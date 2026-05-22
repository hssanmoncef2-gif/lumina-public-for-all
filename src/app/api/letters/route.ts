import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { connectDB } from '@/lib/mongodb/client'
import { LetterRead } from '@/lib/models/LetterRead'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id

  await connectDB()

  const reads = await LetterRead.find({ userId }).lean()

  return NextResponse.json(reads)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const { letterId } = await req.json()

  if (!letterId) {
    return NextResponse.json({ error: 'letterId required' }, { status: 400 })
  }

  await connectDB()

  const read = await LetterRead.findOneAndUpdate(
    {  letterId },
    {  letterId },
    { upsert: true, new: true }
  )

  return NextResponse.json(read)
}
