import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { MoodEntry } from '@/lib/models/MoodEntry'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'

async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return (session.user as any).id ?? (session.user as any).email
}

export async function GET(req: NextRequest) {
  const userId = await getUserId()
  const days = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  await connectDB()

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const entries = await MoodEntry.find({
    userId,
    createdAt: { $gte: since },
  }).sort({ createdAt: -1 }).lean()

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const { moodId, intensity, notes } = await req.json()

  if (!moodId) {
    return NextResponse.json({ error: 'moodId required' }, { status: 400 })
  }

  await connectDB()

  const entry = await MoodEntry.create({
    userId,
    moodId,
    intensity: intensity ?? 3,
    notes: notes ?? undefined,
  })

  return NextResponse.json(entry)
}
