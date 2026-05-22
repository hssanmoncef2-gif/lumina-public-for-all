import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { connectDB } from "@/lib/mongodb/client"
import { JournalEntry } from "@/lib/models/JournalEntry"
import mongoose from "mongoose"

function toObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : null
}

async function getUserId() {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.id ?? (session?.user as any)?.email
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  const { id } = await params
  const entryId = toObjectId(id)

  if (!entryId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  await connectDB()

  const entry = await JournalEntry.findOne({
    _id: entryId,
    userId,
  }).lean()

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(entry)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  const { id } = await params
  const entryId = toObjectId(id)

  if (!entryId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  const { title, content, mood, moodIntensity, tags, isFavorite, aiSummary } = await req.json()

  await connectDB()

  const patch: Record<string, unknown> = {}

  if (title !== undefined) patch.title = title
  if (content !== undefined) patch.content = content
  if (mood !== undefined) patch.mood = mood
  if (moodIntensity !== undefined) patch.moodIntensity = moodIntensity
  if (tags !== undefined) patch.tags = tags
  if (isFavorite !== undefined) patch.isFavorite = isFavorite
  if (aiSummary !== undefined) patch.aiSummary = aiSummary

  const entry = await JournalEntry.findOneAndUpdate(
    { _id: entryId, userId },
    { $set: patch },
    { new: true }
  ).lean()

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(entry)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  const { id } = await params
  const entryId = toObjectId(id)

  if (!entryId) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  }

  await connectDB()

  await JournalEntry.deleteOne({
    _id: entryId,
    userId,
  })

  return NextResponse.json({ ok: true })
}
