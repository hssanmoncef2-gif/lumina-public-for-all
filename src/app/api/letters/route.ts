import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { LetterRead } from '@/lib/models/LetterRead'
import mongoose from 'mongoose'

function toObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null
}

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await connectDB()
  const userIdValue = toObjectId(userId) ?? userId
  const reads = await LetterRead.find({ userId: userIdValue }).lean()
  return NextResponse.json(reads.map((r) => r.letterId))
}

export async function POST(req: NextRequest) {
  const { userId, letterId } = await req.json()
  if (!userId || !letterId) return NextResponse.json({ error: 'userId and letterId required' }, { status: 400 })

  await connectDB()
  const userIdValue = toObjectId(userId) ?? userId
  await LetterRead.updateOne(
    { userId: userIdValue, letterId },
    { $setOnInsert: { readAt: new Date() } },
    { upsert: true }
  )

  return NextResponse.json({ ok: true })
}
