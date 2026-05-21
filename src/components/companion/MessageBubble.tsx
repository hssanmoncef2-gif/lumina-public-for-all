'use client'

// ============================================================
// LUMINA — MessageBubble
// Soft letter-style chat bubbles for companion conversation
// ============================================================

import { motion } from 'framer-motion'
import type { CompanionMessage } from '@/types'

interface Props {
  message: CompanionMessage
  isStreaming?: boolean
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function MessageBubble({ message, isStreaming }: Props) {
  const isCompanion = message.role === 'companion'

  if (isCompanion) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col gap-1 max-w-[88%]"
      >
        {/* Lumina label */}
        <div
          className="flex items-center gap-1.5 mb-0.5"
          style={{ fontFamily: 'var(--font-sora)' }}
        >
          <span className="text-[11px]">✦</span>
          <span
            className="text-[9px] uppercase tracking-[0.12em]"
            style={{ color: 'rgba(196,181,253,0.5)' }}
          >
            Lumina
          </span>
        </div>

        {/* Bubble */}
        <div
          className="relative rounded-3xl rounded-tl-sm px-5 py-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(99,102,241,0.08) 100%)',
            border: '0.5px solid rgba(139,92,246,0.2)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {message.content ? (
            <p
              className="text-[14px] leading-[1.8]"
              style={{
                fontFamily: 'var(--font-nunito)',
                fontWeight: 300,
                color: 'rgba(255,255,255,0.78)',
                fontStyle: 'italic',
              }}
            >
              {message.content}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="inline-block ml-0.5 text-[10px]"
                  style={{ color: 'rgba(196,181,253,0.6)' }}
                >
                  ▋
                </motion.span>
              )}
            </p>
          ) : (
            // Loading state — three soft dots
            <div className="flex items-center gap-1.5 py-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'rgba(196,181,253,0.4)' }}
                  animate={{ scale: [0.6, 1, 0.6], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          )}
        </div>

        <span
          className="text-[9px] pl-1"
          style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-sora)' }}
        >
          {formatTime(message.timestamp)}
        </span>
      </motion.div>
    )
  }

  // User message — right-aligned
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-end gap-1 max-w-[80%] ml-auto"
    >
      <div
        className="rounded-3xl rounded-tr-sm px-4 py-3"
        style={{
          background: 'rgba(255,255,255,0.07)',
          border: '0.5px solid rgba(255,255,255,0.1)',
        }}
      >
        <p
          className="text-[13.5px] leading-relaxed"
          style={{
            fontFamily: 'var(--font-nunito)',
            fontWeight: 300,
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          {message.content}
        </p>
      </div>
      <span
        className="text-[9px] pr-1"
        style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'var(--font-sora)' }}
      >
        {formatTime(message.timestamp)}
      </span>
    </motion.div>
  )
}
