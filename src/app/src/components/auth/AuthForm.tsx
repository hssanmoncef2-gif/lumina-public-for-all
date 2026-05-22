'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { signInWithEmail, signUpWithEmail, signInWithMagicLink } from '@/lib/auth'

type Mode = 'login' | 'signup'

interface AuthFormProps {
  mode: Mode
  onSuccess?: () => void
}

export default function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [useMagicLink, setUseMagicLink] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSent, setMagicSent] = useState(false)

  async function handleSubmit() {
    if (!email) { setError('Please enter your email.'); return }
    setError(null)
    setLoading(true)

    try {
      if (useMagicLink) {
        const { error: err } = await signInWithMagicLink(email)
        if (err) throw err
        setMagicSent(true)
      } else if (mode === 'login') {
        if (!password) { setError('Please enter your password.'); setLoading(false); return }
        const { error: err } = await signInWithEmail(email, password)
        if (err) throw err
        onSuccess?.()
        window.location.href = '/'
      } else {
        if (!password) { setError('Please create a password.'); setLoading(false); return }
        if (password.length < 8) { setError('Password must be at least 8 characters.'); setLoading(false); return }
        const { error: err } = await signUpWithEmail(email, password, displayName)
        if (err) throw err
        onSuccess?.()
        window.location.href = '/'
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (magicSent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-5 py-6 text-center"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(249,168,212,0.15))' }}>
          <span className="text-3xl">✨</span>
        </div>
        <div>
          <h3 className="text-white/85 font-medium text-base mb-1.5">Check your email</h3>
          <p className="text-white/40 text-sm leading-relaxed max-w-[240px] mx-auto">
            We sent a magic link to <span className="text-lumina-purple-dream">{email}</span>. 
            Tap it to enter your sanctuary.
          </p>
        </div>
        <button
          onClick={() => { setMagicSent(false); setUseMagicLink(false) }}
          className="text-white/35 text-xs hover:text-white/55 transition-colors mt-2"
        >
          Use a different method
        </button>
      </motion.div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Display name (signup only) */}
      <AnimatePresence>
        {mode === 'signup' && !useMagicLink && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-white/40 text-xs mb-1.5 ml-1">Your name (optional)</label>
            <input
              type="text"
              placeholder="What should we call you?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email */}
      <div>
        <label className="block text-white/40 text-xs mb-1.5 ml-1">Email</label>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
      </div>

      {/* Password (not shown for magic link) */}
      <AnimatePresence>
        {!useMagicLink && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <label className="block text-white/40 text-xs mb-1.5 ml-1">
              {mode === 'signup' ? 'Create a password' : 'Password'}
            </label>
            <input
              type="password"
              placeholder={mode === 'signup' ? 'At least 8 characters' : '••••••••'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400/80 text-xs ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit */}
      <button
        className="btn-primary w-full mt-1 relative overflow-hidden"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingDots />
          </span>
        ) : useMagicLink ? (
          'Send magic link ✨'
        ) : mode === 'login' ? (
          'Enter your sanctuary'
        ) : (
          'Create my sanctuary'
        )}
      </button>

      {/* Magic link toggle */}
      <button
        onClick={() => { setUseMagicLink(!useMagicLink); setError(null) }}
        className="text-white/30 text-xs text-center hover:text-white/50 transition-colors py-1"
      >
        {useMagicLink ? 'Use password instead' : 'Sign in with magic link instead ✨'}
      </button>

    </div>
  )
}

function LoadingDots() {
  return (
    <span className="flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  )
}
