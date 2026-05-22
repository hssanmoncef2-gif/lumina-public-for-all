// ============================================================
// LUMINA — POST /api/auth/signup
// Creates a new user in MongoDB with hashed password
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb/client'
import { User } from '@/lib/models/User'

export async function POST(req: NextRequest) {
  try {
    const { email, password, displayName } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }

    await connectDB()

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await User.create({
      email:       email.toLowerCase().trim(),
      password:    hashed,
      displayName: displayName?.trim() || email.split('@')[0],
    })

    return NextResponse.json({
      id:          user._id.toString(),
      email:       user.email,
      displayName: user.displayName,
    }, { status: 201 })

  } catch (err: any) {
    console.error('[signup]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
