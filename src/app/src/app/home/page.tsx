'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'
import FloatingParticles from '@/components/ui/FloatingParticles'
import HomeHeader from '@/components/layout/HomeHeader'
import MoodSelector from '@/components/mood/MoodSelector'
import MusicCard from '@/components/music/MusicCard'
import QuoteCard from '@/components/quote/QuoteCard'
import QuickActions from '@/components/layout/QuickActions'
import ComfortPill from '@/components/comfort/ComfortPill'
import BottomNav from '@/components/layout/BottomNav'
import { useLuminaStore } from '@/store/useAppStore'
import type { MoodId } from '@/types'

function getGreeting(): { text: string; sub: string } {
  const h = new Date().getHours()
  if (h >= 5 && h < 12)  return { text: 'Good morning',   sub: 'A fresh moment, just for you.' }
  if (h >= 12 && h < 17) return { text: 'Good afternoon', sub: 'How is your heart today?' }
  if (h >= 17 && h < 21) return { text: 'Good evening',   sub: 'The world can slow down now.' }
  if (h >= 21 && h < 24) return { text: 'Good night',     sub: 'You made it through today.' }
  return { text: 'Hello', sub: 'The quiet hours are yours.' }
}

export default function HomePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentMood, setCurrentMood] = useState<MoodId | null>(null)
  const [greeting, setGreeting] = useState(getGreeting())
  const [isReady, setIsReady] = useState(false)
  const onboardingComplete = useLuminaStore((s) => s.onboardingComplete)

  useEffect(() => {
    setGreeting(getGreeting())
    const done = (() => {
      try { return !!localStorage.getItem('lumina_onboarding_done') } catch { return false }
    })()
    if (!done && !onboardingComplete && session?.user) {
      router.replace('/onboarding')
      return
    }
    const t = setTimeout(() => setIsReady(true), 100)
    return () => clearTimeout(t)
  }, [onboardingComplete, router, session])

  return (
    <main className="relative min-h-dvh overflow-hidden bg-lumina-void" data-mood={currentMood ?? 'default'}>
      <AtmosphericBackground mood={currentMood} />
      <FloatingParticles mood={currentMood} count={20} />
      <div className="relative z-content flex flex-col min-h-dvh">
        <div className="safe-top" />
        <AnimatePresence>
          {isReady && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex flex-col flex-1 pb-24"
            >
              <HomeHeader greeting={greeting} />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="px-5 mt-5">
                <p className="text-[10px] uppercase tracking-[0.12em] text-lumina-purple-dream/60 mb-1.5">Your sanctuary</p>
                <h1 className="text-[26px] font-semibold leading-tight text-dreamy">A space made<br />just for you.</h1>
                <p className="text-sm font-light text-white/35 mt-2 leading-relaxed">Soft, safe, and always here when you need it.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }} className="mt-5">
                <MoodSelector currentMood={currentMood} onMoodSelect={setCurrentMood} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }} className="mt-3.5 px-5">
                <MusicCard mood={currentMood} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }} className="mt-3.5 px-5">
                <QuoteCard mood={currentMood} />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65, duration: 0.6 }} className="mt-3.5">
                <QuickActions />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.6 }} className="mt-3.5 px-5">
                <ComfortPill />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <BottomNav />
      </div>
    </main>
  )
}
