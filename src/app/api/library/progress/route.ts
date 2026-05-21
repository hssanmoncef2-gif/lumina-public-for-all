import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { ReadingProgress } from '@/lib/models/ReadingProgress'

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  await connectDB()
  const progress = await ReadingProgress.find({ userId }).sort({ updatedAt: -1 }).lean()
  return NextResponse.json(progress)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { userId, bookId, source, pageNumber, totalPages, title, coverUrl } = body

  if (!userId || !bookId) {
    return NextResponse.json({ error: 'userId and bookId required' }, { status: 400 })
  }

  await connectDB()

  const progress = await ReadingProgress.findOneAndUpdate(
    { userId, bookId },
    { userId, bookId, source, pageNumber, totalPages, title, coverUrl, updatedAt: new Date() },
    { upsert: true, new: true }
  )

  return NextResponse.json(progress)
}

export async function DELETE(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const bookId  = req.nextUrl.searchParams.get('bookId')
  if (!userId || !bookId) return NextResponse.json({ error: 'missing params' }, { status: 400 })

  await connectDB()
  await ReadingProgress.deleteOne({ userId, bookId })
  return NextResponse.json({ ok: true })
}
