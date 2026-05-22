// ============================================================
// LUMINA — Auth helpers (NextAuth)
// ============================================================

import { signIn, signOut as nextAuthSignOut } from 'next-auth/react'

// ---- Sign in ----
export async function signInWithEmail(email: string, password: string) {
  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  })

  if (result?.error) {
    return { error: { message: 'Incorrect email or password.' } }
  }

  return { error: null }
}

// ---- Sign up ----
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
) {
  const res = await fetch('/api/auth/signup', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password, displayName }),
  })

  const data = await res.json()
  if (!res.ok) return { error: { message: data.error } }

  const signInResult = await signIn('credentials', {
    email,
    password,
    redirect: false,
  })

  if (signInResult?.error) {
    return { error: { message: 'Account created but sign-in failed. Try logging in.' } }
  }

  return { error: null }
}

// ---- Sign out ----
// Bumps sessionVersion in DB first → invalidates ALL devices/sessions,
// then clears the local JWT cookie.
export async function signOut() {
  try { localStorage.removeItem('lumina_onboarding_done') } catch {}

  // Tell the server to invalidate all sessions for this user
  try {
    await fetch('/api/auth/logout', { method: 'POST' })
  } catch {
    // Non-fatal — JWT will still expire via maxAge
  }

  await nextAuthSignOut({ callbackUrl: '/auth/login' })
}

// ---- signInWithMagicLink — stub ----
export async function signInWithMagicLink(_email: string) {
  return { error: { message: 'Magic link is not available. Please use email + password.' } }
}

// ---- getUser (client-side session helper) ----
import { getSession } from 'next-auth/react'

export async function getUser() {
  const session = await getSession()
  if (!session?.user) return null
  return {
    id:    (session.user as any).id as string,
    email: session.user.email ?? '',
    name:  session.user.name ?? '',
  }
}
