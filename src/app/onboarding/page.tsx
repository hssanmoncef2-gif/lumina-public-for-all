'use client'

import { useState, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import OnboardingStep, { type StepConfig } from '@/components/onboarding/OnboardingStep'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'
import { useLuminaStore } from '@/store/useAppStore'
import { toast } from '@/components/ui/Toast'

const STEPS: StepConfig[] = [
  { emoji: '🌙', title: 'Welcome to Lumina', body: 'This is your private sanctuary — a soft, dreamy space where you can breathe, feel, and be heard. Always here. Always gentle.', cta: 'Begin' },
  { emoji: '✨', title: "What should we call you?", body: "We'd love to greet you by name. You can always change this later in your profile.", cta: "That's me", inputLabel: 'Your name', inputPlaceholder: 'e.g. Sofia, River, Jay...' },
  { emoji: '🎵', title: 'Music that feels', body: 'Lumina plays ambient music tuned to your mood — whether you need comfort, calm, or something to wake your soul up.', cta: 'Sounds beautiful' },
  { emoji: '💬', title: 'A companion who listens', body: 'Our AI companion is always here — not to fix you, but to understand you, at 3am or in the quiet after a hard day.', cta: "That's what I need" },
  { emoji: '📖', title: 'Your journal, your truth', body: 'Write freely. Receive a gentle AI reflection. Watch how your heart grows and softens through time.', cta: "I'm ready" },
  { emoji: '💌', title: 'Letters just for you', body: '"Open when you feel overwhelmed." "Open when you can\'t sleep." Ten letters written for the moments that need them most.', cta: 'I love this' },
  { emoji: '🌿', title: "You're all set", body: "Your sanctuary is ready. It will remember how you feel, grow with you, and always be exactly here when you need it.", cta: 'Enter my sanctuary' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setOnboardingComplete = useLuminaStore((s) => s.setOnboardingComplete)

  const isLast = step === STEPS.length - 1
  const isNameStep = STEPS[step].inputLabel != null

  const handleAdvance = useCallback(async () => {
    if (isNameStep && name.trim().length === 0) {
      toast.info('Enter your name to continue ✨')
      return
    }

    if (isNameStep && name.trim() && session?.user) {
      setIsSubmitting(true)
      try {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName: name.trim() }),
        })
      } catch {
        // non-fatal
      } finally {
        setIsSubmitting(false)
      }
    }

    if (isLast) {
      setOnboardingComplete(true)
      try { localStorage.setItem('lumina_onboarding_done', '1') } catch {}
      toast.success(`Welcome to your sanctuary${name ? `, ${name}` : ''} 🌙`, '✦')
      router.push('/' as any)
      return
    }

    setStep((s) => s + 1)
  }, [isLast, isNameStep, name, router, setOnboardingComplete, session])

  const handleSkip = useCallback(() => {
    setStep(STEPS.length - 1)
  }, [])

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden" style={{ background: '#080612' }}>
      <AtmosphericBackground mood={null} />
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute bottom-[20%] left-[20%] w-72 h-72 rounded-full blur-[90px] opacity-14" style={{ background: 'radial-gradient(circle, #ec4899, transparent)' }} />
        <div className="absolute top-[40%] right-[10%] w-56 h-56 rounded-full blur-[80px] opacity-10" style={{ background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 w-full px-6 pb-36 pt-16">
        <AnimatePresence mode="wait">
          <OnboardingStep key={step} step={STEPS[step]} stepIndex={step} totalSteps={STEPS.length} nameValue={name} onNameChange={setName} />
        </AnimatePresence>
      </div>
      <div className="fixed bottom-0 left-0 right-0 z-20 px-6 pb-10 pt-4" style={{ background: 'linear-gradient(to top, rgba(8,6,18,0.95) 60%, transparent)' }}>
        <motion.button onClick={handleAdvance} disabled={isSubmitting} className="btn-primary w-full" whileTap={{ scale: 0.97 }}
          style={isLast ? { background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', boxShadow: '0 8px 32px rgba(139,92,246,0.45)' } : undefined}
          aria-label={STEPS[step].cta}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="inline-block">✦</motion.span>
              Saving...
            </span>
          ) : STEPS[step].cta}
        </motion.button>
        {!isLast && (
          <button onClick={handleSkip} className="block w-full text-center mt-4 text-white/20 text-xs hover:text-white/40 transition-colors" aria-label="Skip intro">
            Skip intro
          </button>
        )}
      </div>
    </main>
  )
}
