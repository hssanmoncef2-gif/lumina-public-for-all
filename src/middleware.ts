// ============================================================
// LUMINA — Middleware (NextAuth)
// ============================================================

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

const PROTECTED = [
  '/home', '/journal', '/letters', '/companion', '/lumina',
  '/profile', '/you', '/quiz', '/comfort', '/music',
  '/library', '/onboarding','/audiobooks',
]

export default withAuth(
  function middleware(req) {
    const path  = req.nextUrl.pathname
    const token = req.nextauth.token

    // Already authed → redirect away from login/signup to home
    if (token && (path.startsWith('/auth/login') || path.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/home', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const path = req.nextUrl.pathname
        const isProtected = PROTECTED.some((p) => path === p || path.startsWith(p + '/'))
        if (isProtected && !token) return false
        return true
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
