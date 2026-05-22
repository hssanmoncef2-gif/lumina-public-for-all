// src/app/api/auth/logout/route.ts
// Bumps the user's sessionVersion, immediately invalidating all existing JWTs
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { connectDB } from '@/lib/mongodb/client'
import { User } from '@/lib/models/User'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ ok: true }) // already logged out
  }

  const userId = (session.user as any).id
  if (userId) {
    await connectDB()
    await User.findByIdAndUpdate(userId, { $inc: { sessionVersion: 1 } })
  }

  return NextResponse.json({ ok: true })
}
