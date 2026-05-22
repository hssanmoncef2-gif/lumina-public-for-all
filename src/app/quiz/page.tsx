'use client'

// ============================================================
// LUMINA — /quiz: AI-powered mood check-in
// Uses Groq to analyze how the user is feeling in their own words
// Falls back to the static quiz if API unavailable
// ============================================================

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'
import FloatingParticles from '@/components/ui/FloatingParticles'
import MoodQuiz from '@/components/mood/MoodQuiz'
import { getUser } from '@/lib/auth'
import { useLuminaStore } from '@/store/useAppStore'
import type { QuizResult, MoodId } from '@/types'

const MOOD_GRADIENTS: Record<MoodId, string> = {
  calm:     'rgba(14,165,233,0.3)',
  drifting: 'rgba(129,140,248,0.3)',
  soft:     'rgba(249,168,212,0.3)',
  alive:    'rgba(52,211,153,0.3)',
  heavy:    'rgba(99,102,241,0.3)',
  anxious:  'rgba(251,146,60,0.3)',
  joyful:   'rgba(251,191,36,0.3)',
  healing:  'rgba(134,239,172,0.3)',
}

const MOOD_EMOJIS: Record<MoodId, string> = {
  calm: '🌊', drifting: '🌙', soft: '🌸', alive: '⚡',
  heavy: '🌧', anxious: '🌀', joyful: '✨', healing: '🌱',
}

const PLACEHOLDERS = [
  '"I haven\'t slept well and my chest feels tight…"',
  '"Today was beautiful and I feel at peace"',
  '"Everything is a lot right now, I can\'t explain it"',
  '"Electric. Something good is coming"',
  '"Numb and kind of floating through the day"',
  '"Tender. Like I could cry at anything beautiful"',
]

// AI-powered mode
function AIMoodCheckin({ onComplete }: { onComplete: (result: QuizResult) => void }) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)])
  const [charCount, setCharCount] = useState(0)

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setCharCount(e.target.value.length)
  }, [])

  const analyze = useCallback(async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/mood-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      // silent fallback
    } finally {
      setLoading(false)
    }
  }, [text, loading])

  const handleContinue = useCallback(() => {
    if (!result) return
    const quizResult: QuizResult = {
      primaryMood: result.primaryMood as MoodId,
      secondaryMood: result.secondaryMood as MoodId | undefined,
      energyLevel: result.energyLevel ?? 3,
      needsComfort: result.needsComfort ?? false,
      recommendedPlaylist: result.recommendedPlaylist ?? 'comfort',
      recommendedAmbient: result.ambientSound === 'ocean' ? 'ocean-twilight'
        : result.ambientSound === 'rain' ? 'rainy-night'
        : result.ambientSound === 'night-forest' ? 'deep-night'
        : result.ambientSound === 'deep-space' ? 'deep-night'
        : 'night-city',
    }
    onComplete(quizResult)
  }, [result, onComplete])

  return (
    <div className="flex flex-col items-center gap-6 px-6 w-full max-w-sm">
      <motion.div
        animate={{ y: [0, -6, 0], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="text-5xl"
      >
        ✦
      </motion.div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-light text-white/90">How are you feeling?</h1>
        <p className="text-sm text-white/40 font-light leading-relaxed">
          Say it in your own words — no right answer, just honesty.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full space-y-3"
          >
            <div className="relative">
              <textarea
                value={text}
                onChange={handleInput}
                placeholder={placeholder}
                autoFocus
                className="w-full resize-none rounded-[20px] p-4 text-[14px] text-white/85 placeholder-white/20 outline-none leading-relaxed"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '0.5px solid rgba(255,255,255,0.12)',
                  minHeight: '120px',
                  fontFamily: 'inherit',
                }}
                onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) analyze() }}
              />
              <span className="absolute bottom-3 right-4 text-[10px] text-white/20">
                {charCount > 0 ? charCount : '⌘↵ to send'}
              </span>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={analyze}
              disabled={!text.trim() || loading}
              className="w-full py-4 rounded-2xl font-medium text-sm transition-all"
              style={{
                background: text.trim() && !loading
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(99,102,241,0.6))'
                  : 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: text.trim() ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>⟳</motion.span>
                  Reading your energy…
                </span>
              ) : 'Read my mood →'}
            </motion.button>

            <p className="text-center text-[11px] text-white/20">
              Powered by Lumina AI · not stored
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full space-y-4"
          >
            {/* Mood card */}
            <motion.div
              className="rounded-[24px] p-5 flex items-center gap-4"
              style={{
                background: MOOD_GRADIENTS[result.primaryMood as MoodId] ?? 'rgba(139,92,246,0.2)',
                border: '0.5px solid rgba(255,255,255,0.1)',
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="text-4xl flex-shrink-0"
              >
                {MOOD_EMOJIS[result.primaryMood as MoodId] ?? '✨'}
              </motion.span>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/40 mb-0.5">Your mood</p>
                <p className="text-xl font-semibold text-white/95 capitalize">{result.primaryMood}</p>
                {result.secondaryMood && (
                  <p className="text-[11px] text-white/45 mt-0.5">with traces of {result.secondaryMood}</p>
                )}
              </div>
            </motion.div>

            {/* AI insight */}
            <div className="rounded-[18px] p-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
              <p className="text-[13px] text-white/70 italic leading-relaxed">"{result.insight}"</p>
            </div>

            {/* Recommendations */}
            {result.musicMood && (
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] text-white/30">✦ recommended:</span>
                <span className="text-[11px] text-white/55">{result.musicMood} music</span>
                {result.ambientSound && <>
                  <span className="text-white/20">·</span>
                  <span className="text-[11px] text-white/55">{result.ambientSound.replace(/-/g, ' ')} ambiance</span>
                </>}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-medium text-white/50 transition-all hover:text-white/70"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
              >
                Try again
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleContinue}
                className="flex-[2] py-3 rounded-2xl text-sm font-medium text-white/90 transition-all"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(99,102,241,0.6))', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                This feels right →
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function QuizPage() {
  const router = useRouter()
  const { setMood, setAmbient } = useLuminaStore()

  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [mode, setMode] = useState<'choose' | 'ai' | 'quiz' | 'done'>('choose')

  useEffect(() => {
    getUser().then(u => { if (u) setUserId(u.id) })
  }, [])

  const handleComplete = useCallback((result: QuizResult) => {
    setMood(result.primaryMood)

    const ambientGradients: Record<string, string> = {
      'ocean-twilight': 'linear-gradient(135deg, #0c2340, #0e3354, #0a1a30)',
      'deep-night':     'linear-gradient(135deg, #0a0618, #0e0a1f, #050310)',
      'foggy-morning':  'linear-gradient(135deg, #1a1535, #2a1f4a, #151030)',
      'golden-hour':    'linear-gradient(135deg, #1a0e05, #2d1a0a, #1a1008)',
      'rainy-night':    'linear-gradient(135deg, #050a1a, #0a0f25, #070c1f)',
      'dusk':           'linear-gradient(135deg, #1a0820, #0f0d25, #0d0818)',
      'night-city':     'linear-gradient(135deg, #080612, #0e0a1f, #0d1535)',
    }
    setAmbient({
      mode: result.recommendedAmbient,
      bgGradient: ambientGradients[result.recommendedAmbient] ?? ambientGradients['night-city'],
    })

    setMode('done')
    setTimeout(() => router.push('/' as any), 1800)
  }, [setMood, setAmbient, router])

  return (
    <main className="relative min-h-dvh overflow-hidden bg-lumina-void">
      <AtmosphericBackground mood={null} />
      <FloatingParticles mood={null} count={14} />

      <div className="relative z-content flex flex-col min-h-dvh">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-safe-top pt-4 pb-2">
          <button
            onClick={() => mode === 'choose' ? router.back() : setMode('choose')}
            className="p-2 text-white/30 hover:text-white/60 transition-colors"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M14 4l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-sm font-light text-white/40">
            mood check-in
          </motion.p>
          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center pt-4 pb-8">
          <AnimatePresence mode="wait">
            {mode === 'choose' ? (
              <motion.div key="choose"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-8 px-6 text-center max-w-xs w-full"
              >
                <motion.div
                  animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-6xl"
                >🌙</motion.div>

                <div className="space-y-3">
                  <h1 className="text-2xl font-light text-white/90">How are you feeling?</h1>
                  <p className="text-sm text-white/40 font-light leading-relaxed">
                    Choose how you want to check in.
                  </p>
                </div>

                <div className="w-full space-y-3">
                  {/* AI option - primary */}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMode('ai')}
                    className="w-full py-4 rounded-2xl font-medium text-sm text-white/90 transition-all text-left px-4"
                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.2))', border: '1px solid rgba(139,92,246,0.3)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">✦</span>
                      <div>
                        <p className="font-medium">Tell me in your own words</p>
                        <p className="text-[11px] text-white/40 font-light mt-0.5">AI reads your energy in seconds</p>
                      </div>
                    </div>
                  </motion.button>

                  {/* Classic quiz option */}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setMode('quiz')}
                    className="w-full py-4 rounded-2xl font-medium text-sm text-white/70 transition-all text-left px-4"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)' }}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🌙</span>
                      <div>
                        <p className="font-medium text-white/70">5-question check-in</p>
                        <p className="text-[11px] text-white/35 font-light mt-0.5">Guided questions, ~30 seconds</p>
                      </div>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            ) : mode === 'ai' ? (
              <motion.div key="ai"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="w-full flex justify-center"
              >
                <AIMoodCheckin onComplete={handleComplete} />
              </motion.div>
            ) : mode === 'quiz' ? (
              <motion.div key="quiz"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="w-full max-w-sm"
              >
                <MoodQuiz userId={userId} onComplete={handleComplete} />
              </motion.div>
            ) : (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 text-center"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6 }}
                  className="text-5xl"
                >✨</motion.div>
                <p className="text-white/60 font-light text-sm">Taking you home…</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
