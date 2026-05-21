'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import AuthForm from '@/components/auth/AuthForm'
import OnboardingFlow from '@/components/auth/OnboardingFlow'

export default function SignupPage() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  if (showOnboarding) {
    return <OnboardingFlow />
  }

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-lumina-void px-6">

      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Large pink orb */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-[0.10]"
          style={{
            background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'orbPulse 14s ease-in-out infinite',
          }}
        />
        {/* Purple orb */}
        <div
          className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-[0.10]"
          style={{
            background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        {/* Soft blue */}
        <div
          className="absolute top-1/3 right-0 w-56 h-56 rounded-full opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-[360px] flex flex-col gap-8"
      >

        {/* Logo */}
        <div className="text-center flex flex-col items-center gap-3">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="text-4xl"
          >
            ✨
          </motion.div>
          <div>
            <h1 className="text-3xl font-semibold text-aurora tracking-tight">Lumina</h1>
            <p className="text-white/35 text-sm font-light mt-1">A space made just for you</p>
          </div>
        </div>

        {/* Teaser pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {['🎵 Mood music', '💬 AI companion', '📖 Private journal', '🌙 Comfort mode'].map((item) => (
            <span
              key={item}
              className="text-xs text-white/40 px-3 py-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '0.5px solid rgba(255,255,255,0.08)',
              }}
            >
              {item}
            </span>
          ))}
        </motion.div>

        {/* Auth card */}
        <div
          className="glass rounded-3xl p-6"
          style={{ boxShadow: '0 8px 48px rgba(0,0,0,0.5), inset 0 0 0 0.5px rgba(255,255,255,0.07)' }}
        >
          <h2 className="text-white/80 font-medium text-base mb-1.5">Create your sanctuary</h2>
          <p className="text-white/30 text-xs mb-5">Free, private, and always here for you.</p>

          <AuthForm mode="signup" onSuccess={() => setShowOnboarding(true)} />
        </div>

        {/* Switch to login */}
        <p className="text-center text-white/30 text-sm">
          Already have a sanctuary?{' '}
          <Link href="/auth/login" className="text-lumina-purple-dream hover:text-lumina-purple-soft transition-colors">
            Sign in
          </Link>
        </p>

      </motion.div>
    </main>
  )
}
