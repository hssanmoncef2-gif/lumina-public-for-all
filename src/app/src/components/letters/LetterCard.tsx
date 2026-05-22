'use client'

// ============================================================
// LUMINA — LetterCard
// Blurred preview card with unlock glow on tap
// ============================================================

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { Letter } from '@/types'

interface Props {
  letter: Letter
}

export default function LetterCard({ letter }: Props) {
  const router = useRouter()
  const [tapping, setTapping] = useState(false)

  function handleOpen() {
    setTapping(true)
   setTimeout(() => router.push(`/letters/${letter.trigger}` as any), 300)
  }

  return (
    <motion.button
      onClick={handleOpen}
      onTapStart={() => setTapping(true)}
      onTap={() => setTapping(false)}
      whileTap={{ scale: 0.97 }}
      className="relative w-full text-left overflow-hidden rounded-[20px] transition-all"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.09)',
      }}
    >
      {/* Glow overlay on tap */}
      {tapping && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.4 }}
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{
            background: letter.gradient,
            opacity: 0.18,
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Top gradient band */}
      <div
        className="h-1 w-full rounded-t-[20px]"
        style={{ background: letter.gradient }}
      />

      <div className="p-4">
        {/* Emoji + title */}
        <div className="flex items-start gap-3 mb-3">
          <span
            className="w-9 h-9 rounded-[12px] flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {letter.emoji}
          </span>
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] uppercase tracking-[0.12em] mb-1"
              style={{ color: 'rgba(255,255,255,0.35)' }}
            >
              A letter for you
            </p>
            <h3
              className="text-sm font-light leading-snug"
              style={{
                fontFamily: 'var(--font-nunito)',
                color: 'rgba(255,255,255,0.82)',
              }}
            >
              {letter.title}
            </h3>
          </div>

          {/* Read indicator */}
          {letter.isRead ? (
            <span
              className="text-[10px] uppercase tracking-widest flex-shrink-0"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              read
            </span>
          ) : (
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
              style={{ background: 'rgba(196,181,253,0.7)' }}
            />
          )}
        </div>

        {/* Blurred preview */}
        <div className="relative overflow-hidden rounded-[10px] p-3"
          style={{ background: 'rgba(255,255,255,0.03)' }}
        >
          <p
            className="text-xs leading-relaxed font-light line-clamp-2"
            style={{
              fontFamily: 'var(--font-nunito)',
              color: 'rgba(255,255,255,0.55)',
              filter: letter.isRead ? 'none' : 'blur(4px)',
              userSelect: 'none',
            }}
          >
            {letter.preview}
          </p>

          {/* Lock overlay for unread */}
          {!letter.isRead && (
            <div className="absolute inset-0 flex items-center justify-center rounded-[10px]"
              style={{ background: 'rgba(8,6,18,0.2)' }}
            >
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-sm"
                style={{ opacity: 0.5 }}
              >
                ✦
              </motion.span>
            </div>
          )}
        </div>

        {/* Tap to open */}
        <p
          className="text-[10px] uppercase tracking-[0.1em] text-center mt-3"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          tap to open
        </p>
      </div>
    </motion.button>
  )
}
