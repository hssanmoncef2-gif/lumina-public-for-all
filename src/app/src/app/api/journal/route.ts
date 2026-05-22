import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { JournalEntry } from '@/lib/models/JournalEntry'
import mongoose from 'mongoose'

function toObjectId(userId: string) {
  return mongoose.Types.ObjectId.isValid(userId)
    ? new mongoose.Types.ObjectId(userId)
    : null
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await connectDB()

  // Support both ObjectId and plain string userId
  const query = toObjectId(userId)
    ? { userId: toObjectId(userId) }
    : { userIdStr: userId }

  const entries = await JournalEntry.find(
    toObjectId(userId) ? { userId: toObjectId(userId) } : { userId: userId as any }
  )
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, title, content, mood, moodIntensity, tags, isFavorite } = body

  if (!userId || !content) {
    return NextResponse.json({ error: 'userId and content required' }, { status: 400 })
  }

  await connectDB()

  // Accept both real ObjectId and dev string userIds
  const userIdValue = toObjectId(userId) ?? userId

  const entry = await JournalEntry.create({
    userId:        userIdValue,
    title:         title ?? undefined,
    content,
    mood:          mood ?? undefined,
    moodIntensity: moodIntensity ?? undefined,
    tags:          tags ?? [],
    isFavorite:    isFavorite ?? false,
  })

  return NextResponse.json(entry, { status: 201 })
}
