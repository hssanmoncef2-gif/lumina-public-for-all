'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'
import FloatingParticles from '@/components/ui/FloatingParticles'
import BottomNav from '@/components/layout/BottomNav'
import LetterCard from '@/components/letters/LetterCard'
import { LETTERS } from '@/lib/letters/letterData'
import { useLuminaStore } from '@/store/useAppStore'

export default function LettersPage() {
  const router      = useRouter()
  const { data: session } = useSession()
  const currentMood = useLuminaStore((s) => s.currentMood)
  const [readIds,   setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const userId = (session?.user as any)?.id
    if (!userId) return
    fetch(`/api/letters?userId=${userId}`)
      .then(r => r.json())
      .then((ids: string[]) => setReadIds(new Set(ids)))
      .catch(() => {})
  }, [session])

  return (
    <main className="relative min-h-dvh overflow-hidden bg-lumina-void">
      <AtmosphericBackground mood={currentMood} />
      <FloatingParticles mood={currentMood} count={10} />

      <div className="relative z-10 flex flex-col min-h-dvh">
        <div className="px-5" style={{ paddingTop: 'max(env(safe-area-inset-top), 20px)', paddingBottom: '8px' }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[10px] uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>From Lumina</p>
            <h1 className="text-2xl font-light" style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(255,255,255,0.88)' }}>Open when…</h1>
            <p className="text-xs font-light mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Letters written for the moments that need them</p>
          </motion.div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 mt-4 space-y-3" role="list">
          {LETTERS.map((letter, i) => (
            <motion.div key={letter.id} role="listitem"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              onClick={() => router.push(`/letters/${letter.trigger}`)}
              style={{ cursor: 'pointer' }}>
              <LetterCard letter={{ ...letter, isRead: readIds.has(letter.id) }} />
            </motion.div>
          ))}
        </div>

        <BottomNav />
      </div>
    </main>
  )
}
