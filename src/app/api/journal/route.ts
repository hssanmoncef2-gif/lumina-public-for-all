import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { JournalEntry } from '@/lib/models/JournalEntry'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const userId = (session.user as any).id ?? (session.user as any).email

  await connectDB()

  const entries = await JournalEntry.find({ userId })
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const userId = (session.user as any).id ?? (session.user as any).email

  const body = await req.json()
  const { title, content, mood, moodIntensity, tags, isFavorite, aiSummary } = body

  if (!content) {
    return NextResponse.json({ error: 'content required' }, { status: 400 })
  }

  await connectDB()

  const entry = await JournalEntry.create({
    userId,
    title: title ?? undefined,
    content,
    mood: mood ?? undefined,
    moodIntensity: moodIntensity ?? undefined,
    tags: tags ?? [],
    isFavorite: isFavorite ?? false,
    aiSummary: aiSummary ?? undefined,
  })

  return NextResponse.json(entry)
}
