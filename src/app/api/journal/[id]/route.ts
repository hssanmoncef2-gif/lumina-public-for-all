// ============================================================
// LUMINA — GET/PATCH/DELETE /api/journal/[id]
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { JournalEntry } from '@/lib/models/JournalEntry'
import mongoose from 'mongoose'

function toObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const entryId = toObjectId(id)
  if (!entryId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await connectDB()
  const userIdValue = toObjectId(userId) ?? userId
  const entry = await JournalEntry.findOne({ _id: entryId, userId: userIdValue }).lean()

  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(entry)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId, title, content, mood, moodIntensity, tags, isFavorite, aiSummary } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const entryId = toObjectId(id)
  if (!entryId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await connectDB()

  const patch: Record<string, unknown> = {}
  if (title         !== undefined) patch.title         = title
  if (content       !== undefined) patch.content       = content
  if (mood          !== undefined) patch.mood          = mood
  if (moodIntensity !== undefined) patch.moodIntensity = moodIntensity
  if (tags          !== undefined) patch.tags          = tags
  if (isFavorite    !== undefined) patch.isFavorite    = isFavorite
  if (aiSummary     !== undefined) patch.aiSummary     = aiSummary

  const userIdValue = toObjectId(userId) ?? userId
  const entry = await JournalEntry.findOneAndUpdate(
    { _id: entryId, userId: userIdValue },
    { $set: patch },
    { new: true }
  ).lean()

  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(entry)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { userId } = await req.json()
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const entryId = toObjectId(id)
  if (!entryId) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  await connectDB()
  const userIdValue = toObjectId(userId) ?? userId
  await JournalEntry.deleteOne({ _id: entryId, userId: userIdValue })

  return NextResponse.json({ ok: true })
}