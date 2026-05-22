import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { connectDB } from "@/lib/mongodb/client"
import { LetterRead } from "@/lib/models/LetterRead"

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

  const reads = await LetterRead.find({ userId }).lean()

  return NextResponse.json(reads.map((r) => r.letterId))
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()

  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 })
  }

  const { letterId } = await req.json()

  if (!letterId) {
    return NextResponse.json({ error: "letterId required" }, { status: 400 })
  }

  await connectDB()

  await LetterRead.updateOne(
    { userId, letterId },
    { $setOnInsert: { readAt: new Date() } },
    { upsert: true }
  )

  return NextResponse.json({ ok: true })
}
