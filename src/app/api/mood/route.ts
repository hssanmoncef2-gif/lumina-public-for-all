// ============================================================
// LUMINA — GET/POST /api/mood
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { MoodEntry } from '@/lib/models/MoodEntry'
import mongoose from 'mongoose'

function toObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const days   = parseInt(req.nextUrl.searchParams.get('days') ?? '30', 10)
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await connectDB()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  const userIdValue = toObjectId(userId) ?? userId
  const entries = await MoodEntry.find({
    userId:    userIdValue,
    createdAt: { $gte: since },
  }).sort({ createdAt: -1 }).lean()

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const { userId, moodId, intensity, notes } = await req.json()
  if (!userId || !moodId) return NextResponse.json({ error: 'userId and moodId required' }, { status: 400 })

  await connectDB()
  const userIdValue = toObjectId(userId) ?? userId
  const entry = await MoodEntry.create({
    userId:    userIdValue,
    moodId,
    intensity: intensity ?? 3,
    notes:     notes ?? undefined,
  })

  return NextResponse.json(entry, { status: 201 })
}
