import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { connectDB } from "@/lib/mongodb/client"
import { JournalEntry } from "@/lib/models/JournalEntry"

async function getUserId() {
  const session = await getServerSession(authOptions)
  return (session?.user as any)?.id ?? (session?.user as any)?.email
}

export async function GET() {
  const userId = await getUserId()

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  await connectDB()

  const entries = await JournalEntry.find({ userId })
    .sort({ createdAt: -1 })
    .lean()

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  const body = await req.json()
  const { title, content, mood, moodIntensity, tags, isFavorite } = body

  if (!content) {
    return NextResponse.json({ error: "content required" }, { status: 400 })
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
  })

  return NextResponse.json(entry, { status: 201 })
}
