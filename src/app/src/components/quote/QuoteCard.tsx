'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MoodId } from '@/types'

interface Quote { text: string; sub: string }

// Static fallbacks — shown instantly while AI loads or on error
const FALLBACK_QUOTES: Record<string, Quote[]> = {
  calm:     [{ text: "The calm you're feeling is real. You're allowed to stay here.", sub: 'for quiet moments' }],
  drifting: [{ text: "You don't need to have it all figured out today.", sub: 'for the uncertain heart' }],
  soft:     [{ text: "Softness is not weakness. It takes courage to stay tender.", sub: 'for the gentle ones' }],
  alive:    [{ text: "This moment of aliveness is yours. Don't explain it — just feel it.", sub: 'for the electric moments' }],
  heavy:    [{ text: "You survived today. That's not a small thing.", sub: 'for the heavy days' }],
  default:  [{ text: "You are allowed to be exactly where you are.", sub: 'right here, right now' }],
}

interface Props {
  mood: MoodId | null
}

export default function QuoteCard({ mood }: Props) {
  const moodKey = mood ?? 'default'
  const [quotes, setQuotes] = useState<Quote[]>(FALLBACK_QUOTES[moodKey] ?? FALLBACK_QUOTES.default)
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [aiLoaded, setAiLoaded] = useState(false)

  const fetchQuotes = useCallback(async (m: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: m }),
      })
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      if (Array.isArray(data.quotes) && data.quotes.length > 0) {
        setQuotes(data.quotes)
        setIndex(0)
        setAiLoaded(true)
      }
    } catch {
      // silently keep fallback
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-fetch when mood changes
  useEffect(() => {
    const fallback = FALLBACK_QUOTES[moodKey] ?? FALLBACK_QUOTES.default
    setQuotes(fallback)
    setIndex(0)
    setAiLoaded(false)
    fetchQuotes(moodKey)
  }, [moodKey, fetchQuotes])

  function nextQuote() {
    if (loading) return
    const next = (index + 1) % quotes.length
    // When wrapping around, fetch a fresh batch
    if (next === 0 && aiLoaded) {
      fetchQuotes(moodKey)
    } else {
      setIndex(next)
    }
  }

  const quote = quotes[index] ?? quotes[0]

  return (
    <motion.button
      onClick={nextQuote}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-[20px] p-4 transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
      }}
      aria-label="Next quote — tap to refresh"
    >
      {/* Sparkle — pulses faster while loading */}
      <motion.div
        animate={{ opacity: loading ? [0.3, 1, 0.3] : [0.4, 0.8, 0.4] }}
        transition={{ duration: loading ? 1 : 3, repeat: Infinity }}
        className="text-lg mb-2 text-lumina-purple-dream/70"
      >
        ✦
      </motion.div>

      {/* Quote text */}
      <AnimatePresence mode="wait">
        <motion.p
          key={quote?.text}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: loading && !aiLoaded ? 0.4 : 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.4 }}
          className="quote-body text-sm"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          {loading && !aiLoaded ? '✦  ✦  ✦' : `"${quote?.text}"`}
        </motion.p>
      </AnimatePresence>

      {/* Sub attribution */}
      <AnimatePresence mode="wait">
        <motion.p
          key={quote?.sub}
          initial={{ opacity: 0 }}
          animate={{ opacity: loading && !aiLoaded ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-[10px] mt-2 tracking-[0.06em]"
          style={{ color: 'rgba(200,160,255,0.35)' }}
        >
          {quote?.sub}
        </motion.p>
      </AnimatePresence>

      {/* Tap hint */}
      <p className="text-[9px] mt-3 text-white/15 text-right tracking-wide">
        {loading ? 'generating…' : 'tap for another'}
      </p>
    </motion.button>
  )
}
