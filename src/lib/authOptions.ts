// src/lib/authOptions.ts
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { connectDB } from '@/lib/mongodb/client'
import { User } from '@/lib/models/User'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB()
        const user = await User.findOne({ email: credentials.email })
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id:             user._id.toString(),
          email:          user.email,
          name:           user.displayName ?? '',
          sessionVersion: user.sessionVersion ?? 0,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge:   60 * 60 * 24 * 7, // 7 days
  },

  callbacks: {
    // Embed sessionVersion into the JWT when the user first signs in
    async jwt({ token, user }) {
      if (user) {
        token.id             = user.id
        token.sessionVersion = (user as any).sessionVersion ?? 0
      }
      return token
    },

    // On every request, verify the JWT's sessionVersion still matches the DB.
    // Only invalidate on a CONFIRMED mismatch — fail open on DB errors.
    async session({ session, token }) {
      if (!token?.id) return { ...session, user: undefined } as any

      try {
        await connectDB()
        const dbUser = await User.findById(token.id).select('sessionVersion').lean()

        if (dbUser) {
          const dbVersion    = (dbUser as any).sessionVersion ?? 0
          const tokenVersion = (token.sessionVersion as number) ?? 0
          if (dbVersion !== tokenVersion) {
            // User logged out from another device — kill this session
            return { ...session, user: undefined } as any
          }
        }
        // If dbUser is null (deleted account), fall through and let session expire naturally
      } catch {
        // DB unreachable — let session through rather than log everyone out
      }

      if (session.user) {
        (session.user as any).id = token.id
      }
      return session
    },
  },

  pages:  { signIn: '/auth/login' },
  secret: process.env.NEXTAUTH_SECRET,
}
