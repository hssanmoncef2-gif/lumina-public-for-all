'use client'

// ============================================================
// LUMINA — Comfort Page (/comfort)
// Breathing guide, dim overlay, cycling affirmations
// ============================================================

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import BreathingGuide from '@/components/comfort/BreathingGuide'

const AFFIRMATIONS = [
  'You are safe in this moment.',
  'Your feelings are valid.',
  'You have survived every hard day so far.',
  'It\'s okay to slow down.',
  'You are doing enough.',
  'This feeling will pass.',
  'You are allowed to rest.',
  'You are not alone.',
  'Your presence matters.',
  'Be gentle with yourself tonight.',
  'You don\'t have to have it all figured out.',
  'Breathe. You are here.',
]

export default function ComfortPage() {
  const router = useRouter()
  const [affirmIndex, setAffirmIndex] = useState(0)
  const [showText, setShowText] = useState(true)

  // Cycle affirmations every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowText(false)
      setTimeout(() => {
        setAffirmIndex(i => (i + 1) % AFFIRMATIONS.length)
        setShowText(true)
      }, 600)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  return (
    <main
      className="relative min-h-dvh overflow-hidden flex flex-col"
      style={{ background: '#060410' }}
    >
      {/* Deep dark overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(139,92,246,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Very subtle particles — 3 drifting orbs */}
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          animate={{
            x: [0, 30 - i * 20, 0],
            y: [0, -20 + i * 10, 0],
          }}
          transition={{
            duration: 12 + i * 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            width: 120 + i * 60,
            height: 120 + i * 60,
            left: `${15 + i * 25}%`,
            top: `${20 + i * 20}%`,
            background: `radial-gradient(circle, rgba(139,92,246,${0.05 - i * 0.01}) 0%, transparent 70%)`,
            filter: 'blur(30px)',
          }}
        />
      ))}

      {/* Top nav */}
      <div
        className="relative z-20 flex items-center justify-between px-5"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 20px)', paddingBottom: '8px' }}
      >
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 py-2"
          style={{ color: 'rgba(255,255,255,0.25)' }}
        >
          <span>←</span>
          <span className="text-xs uppercase tracking-[0.1em]">leave</span>
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-[10px] uppercase tracking-[0.14em]"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          comfort mode
        </motion.p>

        <div style={{ width: 60 }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-center mb-10"
        >
          <p
            className="text-xs uppercase tracking-[0.15em]"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            slow down with me
          </p>
        </motion.div>

        {/* Breathing Guide */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <BreathingGuide />
        </motion.div>

        {/* Affirmation cycling */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-12 text-center px-4"
          style={{ minHeight: '52px' }}
        >
          <AnimatePresence mode="wait">
            {showText && (
              <motion.p
                key={affirmIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="font-light leading-relaxed"
                style={{
                  fontFamily: 'var(--font-nunito)',
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.38)',
                  fontStyle: 'italic',
                }}
              >
                {AFFIRMATIONS[affirmIndex]}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {AFFIRMATIONS.map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: i === affirmIndex ? 0.6 : 0.12 }}
                transition={{ duration: 0.3 }}
                className="rounded-full"
                style={{
                  width: i === affirmIndex ? 16 : 4,
                  height: 4,
                  background: 'rgba(196,181,253,1)',
                  transition: 'width 0.3s ease',
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
