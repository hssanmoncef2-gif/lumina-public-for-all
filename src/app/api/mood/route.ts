import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { connectDB } from '@/lib/mongodb/client'
import { MoodEntry } from '@/lib/models/MoodEntry'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id

  await connectDB()

  const moods = await MoodEntry.find({ userId })
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json(moods)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id
  const body = await req.json()

  await connectDB()

  const entry = await MoodEntry.create({
    
    ...body,
  })

  return NextResponse.json(entry)
}
