'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'
import FloatingParticles from '@/components/ui/FloatingParticles'
import LetterContent from '@/components/letters/LetterContent'
import { LETTER_BY_TRIGGER } from '@/lib/letters/letterData'
import { useLuminaStore } from '@/store/useAppStore'
import type { LetterTrigger } from '@/types'

interface Props { params: Promise<{ trigger: string }> }

export default function LetterViewPage({ params }: Props) {
  const router  = useRouter()
  const { data: session } = useSession()
  const currentMood = useLuminaStore((s) => s.currentMood)
  const [trigger, setTrigger] = useState<LetterTrigger | null>(null)
  const [phase, setPhase] = useState<'sealed' | 'opening' | 'open'>('sealed')
  const [aiContent, setAiContent] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    params.then(p => setTrigger(p.trigger as LetterTrigger))
  }, [params])

  const letter = trigger ? LETTER_BY_TRIGGER[trigger] : undefined

  // Generate AI content when trigger is known
  useEffect(() => {
    if (!trigger) return
    setGenerating(true)
    fetch('/api/letter-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trigger, mood: currentMood }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.content) setAiContent(data.content)
      })
      .catch(() => {})
      .finally(() => setGenerating(false))
  }, [trigger, currentMood])

  useEffect(() => {
    if (!letter) return
    const t1 = setTimeout(() => setPhase('opening'), 400)
    const t2 = setTimeout(() => setPhase('open'),    1200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [letter])

  useEffect(() => {
    if (phase !== 'open' || !letter) return
    const userId = (session?.user as any)?.id
    if (!userId) return
    fetch('/api/letters', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, letterId: letter.id }),
    }).catch(() => {})
  }, [phase, letter, session])

  if (!letter) return (
    <main className="relative min-h-dvh bg-lumina-void flex items-center justify-center">
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>Letter not found.</p>
    </main>
  )

  // Merge letter with AI content if ready, otherwise fall back to static
  const displayLetter = aiContent
    ? { ...letter, content: aiContent }
    : letter

  return (
    <main className="relative min-h-dvh overflow-hidden bg-lumina-void">
      <AtmosphericBackground mood={null} />
      <FloatingParticles mood={null} count={6} />
      <div className="absolute inset-0 pointer-events-none" style={{ background: letter.gradient, opacity: 0.06 }} />

      <div className="relative z-10 flex flex-col min-h-dvh">
        <div className="px-5" style={{ paddingTop: 'max(env(safe-area-inset-top), 20px)' }}>
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            onClick={() => router.back()} aria-label="Back"
            className="flex items-center gap-2 py-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            <span>←</span>
            <span className="text-xs uppercase tracking-[0.1em]">Letters</span>
          </motion.button>
        </div>

        <AnimatePresence>
          {phase === 'sealed' && (
            <motion.div key="sealed" exit={{ opacity: 0, scale: 0.85, y: -30 }}
              transition={{ duration: 0.5 }} className="flex-1 flex items-center justify-center px-8">
              <div className="text-center">
                <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-6xl mb-4">✉️</motion.div>
                <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.4)' }}>writing your letter…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {phase === 'open' && (
            <motion.div key="open" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }} className="flex-1 overflow-y-auto px-6 pb-16">

              {/* Show shimmer while AI is still generating */}
              {generating && !aiContent ? (
                <div className="space-y-3 mt-6">
                  {[80, 60, 90, 50, 70].map((w, i) => (
                    <motion.div key={i}
                      animate={{ opacity: [0.08, 0.18, 0.08] }}
                      transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
                      className="h-3 rounded-full"
                      style={{ width: `${w}%`, background: 'rgba(200,160,255,0.3)' }}
                    />
                  ))}
                  <p className="text-[10px] mt-4 tracking-[0.08em]" style={{ color: 'rgba(200,160,255,0.3)' }}>
                    writing just for you…
                  </p>
                </div>
              ) : (
                <LetterContent letter={displayLetter} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
