import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { connectDB } from '@/lib/mongodb/client'
import mongoose from 'mongoose'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { displayName } = await req.json()
  if (!displayName) {
    return NextResponse.json({ error: 'displayName required' }, { status: 400 })
  }

  await connectDB()
  const db = mongoose.connection.db!
  await db.collection('user_profiles').updateOne(
    { email: session.user.email },
    { $set: { displayName, updatedAt: new Date() } },
    { upsert: true }
  )

  return NextResponse.json({ ok: true })
}
