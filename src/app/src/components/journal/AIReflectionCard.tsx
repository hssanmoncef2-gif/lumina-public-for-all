'use client'

// ============================================================
// LUMINA — AIReflectionCard
// Streams Lumina's AI reflection into journal entry view
// ============================================================

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { JournalEntry } from '@/types'

interface Props {
  entry: JournalEntry
  onReflectionSaved?: (reflection: string) => void
}

export default function AIReflectionCard({ entry, onReflectionSaved }: Props) {
  const [reflection, setReflection] = useState(entry.aiSummary ?? '')
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(!!entry.aiSummary)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function generateReflection() {
    if (isStreaming) return
    setError(null)
    setReflection('')
    setIsStreaming(true)
    setHasGenerated(true)

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: entry.id,
          content: entry.content,
          mood:    entry.mood,
          title:   entry.title,
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? 'Reflection failed')
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let   accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        setReflection(accumulated)
      }

      onReflectionSaved?.(accumulated)
    } catch (e: any) {
      if (e.name === 'AbortError') return
      setError('Lumina couldn\'t reach you just now.')
      setHasGenerated(false)
      setReflection('')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mx-5 mt-8 rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(139,92,246,0.07)',
        border:     '0.5px solid rgba(139,92,246,0.18)',
      }}
    >
      <div className="px-4 pt-4 pb-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.span
              className="text-[14px]"
              animate={isStreaming ? { rotate: [0, 180, 360], scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              ✦
            </motion.span>
            <span
              className="text-[9px] uppercase tracking-[0.12em]"
              style={{ color: 'rgba(196,181,253,0.6)', fontFamily: 'var(--font-sora)' }}
            >
              Lumina's reflection
            </span>
          </div>

          {/* Generate / Regenerate button */}
          {!isStreaming && (
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={generateReflection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px]"
              style={{
                fontFamily: 'var(--font-sora)',
                background: 'rgba(139,92,246,0.15)',
                border:     '0.5px solid rgba(139,92,246,0.28)',
                color:      'rgba(196,181,253,0.8)',
              }}
            >
              <span>{hasGenerated ? '↺' : '✨'}</span>
              {hasGenerated ? 'Reflect again' : 'Generate reflection'}
            </motion.button>
          )}

          {isStreaming && (
            <button
              onClick={() => abortRef.current?.abort()}
              className="text-[9px] uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-sora)' }}
            >
              stop
            </button>
          )}
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] leading-relaxed"
              style={{ color: 'rgba(252,165,165,0.5)', fontFamily: 'var(--font-nunito)', fontStyle: 'italic' }}
            >
              {error}
            </motion.p>
          ) : hasGenerated ? (
            <motion.p
              key="reflection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[13.5px] leading-[1.85]"
              style={{ color: 'rgba(255,255,255,0.62)', fontFamily: 'var(--font-nunito)', fontStyle: 'italic' }}
            >
              {reflection}
              {isStreaming && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.9, repeat: Infinity }}
                  className="inline-block ml-0.5 text-[10px]"
                  style={{ color: 'rgba(196,181,253,0.5)' }}
                >
                  ▋
                </motion.span>
              )}
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12.5px] leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-nunito)', fontStyle: 'italic' }}
            >
              Lumina can offer a gentle reflection on what you've written. Tap to begin.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
