import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { connectDB } from '@/lib/mongodb/client'
import { JournalEntry } from '@/lib/models/JournalEntry'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id

  await connectDB()

  const entries = await JournalEntry.find({ userId })
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = (session.user as any).id

  const body = await req.json()
  const { title, content, mood, moodIntensity, tags, isFavorite } = body

  if (!content) {
    return NextResponse.json({ error: 'content required' }, { status: 400 })
  }

  await connectDB()

  const entry = await JournalEntry.create({
    
    title,
    content,
    mood,
    moodIntensity,
    tags: tags || [],
    isFavorite: isFavorite || false,
  })

  return NextResponse.json(entry, { status: 201 })
}
