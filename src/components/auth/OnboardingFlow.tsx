'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLuminaStore } from '@/store/useAppStore'

const STEPS = [
  {
    emoji: '🌙',
    title: 'Welcome to Lumina',
    body: 'This is your private sanctuary — a soft, dreamy space where you can breathe, feel, and be heard.',
    cta: 'Begin',
  },
  {
    emoji: '🎵',
    title: 'Music that feels',
    body: 'Lumina plays ambient music tuned to your mood — whether you need comfort, calm, or something to wake your soul up.',
    cta: 'Sounds beautiful',
  },
  {
    emoji: '💬',
    title: 'A companion who listens',
    body: 'Our AI companion is always here — not to fix you, but to understand you, at 3am or in the quiet after a hard day.',
    cta: "That's what I need",
  },
  {
    emoji: '📖',
    title: 'Your journal, your truth',
    body: 'Write what you feel. Receive a gentle AI reflection. Track how your heart moves through time.',
    cta: "I'm ready",
  },
  {
    emoji: '✨',
    title: "You're all set",
    body: "Your sanctuary is ready. It will remember how you feel, grow with you, and always be exactly here when you need it.",
    cta: 'Enter my sanctuary',
  },
]

interface OnboardingFlowProps {
  onComplete?: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const setOnboardingComplete = useLuminaStore((s) => s.setOnboardingComplete)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function advance() {
    if (isLast) {
      setOnboardingComplete(true)
      onComplete?.()
      window.location.href = '/'
    } else {
      setStep((s) => s + 1)
    }
  }

  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden bg-lumina-void px-6">

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[100px] opacity-20"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 w-64 h-64 rounded-full blur-[80px] opacity-15"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }}
        />
      </div>

      {/* Progress dots */}
      <div className="absolute top-12 flex gap-2">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step ? 24 : 6,
              opacity: i <= step ? 1 : 0.3,
            }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="h-1.5 rounded-full"
            style={{
              background: i <= step
                ? 'linear-gradient(90deg, #a78bfa, #f9a8d4)'
                : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col items-center text-center gap-6 max-w-[320px]"
        >
          {/* Emoji */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="text-6xl"
          >
            {current.emoji}
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-dreamy leading-tight">
            {current.title}
          </h2>

          {/* Body */}
          <p className="text-white/50 text-sm leading-relaxed font-light">
            {current.body}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* CTA button */}
      <motion.button
        className="btn-primary absolute bottom-12 left-6 right-6"
        onClick={advance}
        whileTap={{ scale: 0.97 }}
        style={isLast ? {
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          boxShadow: '0 8px 32px rgba(139,92,246,0.4)',
        } : undefined}
      >
        {current.cta}
      </motion.button>

      {/* Skip (not on last step) */}
      {!isLast && (
        <button
          onClick={() => setStep(STEPS.length - 1)}
          className="absolute bottom-[88px] left-1/2 -translate-x-1/2 text-white/20 text-xs hover:text-white/40 transition-colors whitespace-nowrap"
        >
          Skip intro
        </button>
      )}

    </div>
  )
}
