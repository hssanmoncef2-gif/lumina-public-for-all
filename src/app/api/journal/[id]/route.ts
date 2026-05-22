import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb/client'
import { JournalEntry } from '@/lib/models/JournalEntry'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/authOptions'

function toObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null
}

async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return (session.user as any).id ?? (session.user as any).email
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { id } = await params
  const entryId = toObjectId(id)

  if (!entryId) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  await connectDB()

  const entry = await JournalEntry.findOne({
    _id: entryId,
    userId,
  }).lean()

  if (!entry) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(entry)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { id } = await params
  const entryId = toObjectId(id)

  if (!entryId) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const body = await req.json()

  await connectDB()

  const updated = await JournalEntry.findOneAndUpdate(
    {
      _id: entryId,
      userId,
    },
    {
      $set: body,
    },
    {
      new: true,
    }
  )

  if (!updated) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getUserId()
  if (!userId) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })

  const { id } = await params
  const entryId = toObjectId(id)

  if (!entryId) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  await connectDB()

  await JournalEntry.deleteOne({
    _id: entryId,
    userId,
  })

  return NextResponse.json({ ok: true })
}
