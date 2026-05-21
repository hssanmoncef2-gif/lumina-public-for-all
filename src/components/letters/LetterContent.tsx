'use client'

// ============================================================
// LUMINA — LetterContent
// Styled full letter display with elegant typography
// ============================================================

import { motion } from 'framer-motion'
import type { Letter } from '@/types'

interface Props {
  letter: Letter
}

export default function LetterContent({ letter }: Props) {
  const paragraphs = letter.content.split('\n\n').filter(Boolean)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative"
    >
      {/* Letter header */}
      <div className="mb-8 text-center">
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl block mb-4"
        >
          {letter.emoji}
        </motion.span>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          <p
            className="text-[10px] uppercase tracking-[0.15em] mb-2"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-sora)' }}
          >
            A letter for you
          </p>
          <h1
            className="text-xl font-light leading-relaxed"
            style={{
              fontFamily: 'var(--font-nunito)',
              color: 'rgba(255,255,255,0.88)',
            }}
          >
            {letter.title}
          </h1>
        </motion.div>

        {/* Gradient divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-6 h-px mx-auto"
          style={{
            width: '120px',
            background: letter.gradient,
            opacity: 0.6,
          }}
        />
      </div>

      {/* Letter body */}
      <div
        className="space-y-5"
        style={{
          fontFamily: 'var(--font-nunito)',
        }}
      >
        {paragraphs.map((para, i) => {
          // Detect closing (last 2 paragraphs — signature lines)
          const isSignature = i >= paragraphs.length - 2

          return (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.4 + i * 0.08,
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className={`leading-[1.85] font-light ${isSignature ? 'text-right' : ''}`}
              style={{
                fontSize: '15px',
                color: isSignature ? 'rgba(196,181,253,0.7)' : 'rgba(255,255,255,0.72)',
                fontStyle: isSignature ? 'italic' : 'normal',
              }}
            >
              {para}
            </motion.p>
          )
        })}
      </div>

      {/* Decorative bottom flourish */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-12 text-center"
      >
        <div
          className="h-px mx-auto mb-4"
          style={{
            width: '80px',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <span style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px', letterSpacing: '0.15em' }}>
          ✦ lumina
        </span>
      </motion.div>
    </motion.article>
  )
}
