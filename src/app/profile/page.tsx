'use client'

import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'
import FloatingParticles from '@/components/ui/FloatingParticles'
import BottomNav from '@/components/layout/BottomNav'
import JournalEntryCard from '@/components/journal/JournalEntryCard'
import { useLuminaStore } from '@/store/useAppStore'
import { useJournalEntries } from '@/hooks/useJournal'
import { toast } from '@/components/ui/Toast'
import { signOut } from '@/lib/auth'

const QUICK_LINKS = [
  { emoji: '✉️', label: 'Letters from Lumina', href: '/letters' },
  { emoji: '🫧', label: 'Comfort Mode',         href: '/comfort' },
  { emoji: '📖', label: 'My Journal',            href: '/journal' },
  { emoji: '✨', label: 'Replay Onboarding',     href: '/onboarding' },
]

export default function ProfilePage() {
  const router   = useRouter()
  const { data: session } = useSession()
  const currentMood = useLuminaStore((s) => s.currentMood)
  const setUser     = useLuminaStore((s) => s.setUser)
  const [signingOut, setSigningOut] = useState(false)
  const [tab, setTab] = useState<'entries' | 'links'>('entries')

  const userId      = (session?.user as any)?.id as string | undefined
  const displayName = (session?.user as any)?.displayName || session?.user?.name || 'You'

  const { entries, isLoading, toggleFav, remove } = useJournalEntries(userId)

  const totalWords = entries.reduce(
    (acc, e) => acc + e.content.split(/\s+/).filter(Boolean).length, 0
  )

  const handleSignOut = useCallback(async () => {
    setSigningOut(true)
    setUser(null)
    try { localStorage.removeItem('lumina_onboarding_done') } catch {}
    toast.success('Signed out. See you soon 🌙')
    await signOut()
  }, [setUser])

  return (
    <main className="relative min-h-dvh overflow-hidden bg-lumina-void">
      <AtmosphericBackground mood={currentMood} />
      <FloatingParticles mood={currentMood} count={8} />

      <div className="relative z-10 flex flex-col min-h-dvh">
        {/* Header */}
        <div className="px-5" style={{ paddingTop: 'max(env(safe-area-inset-top), 20px)', paddingBottom: '8px' }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-[10px] uppercase tracking-[0.14em] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Your space
            </p>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-light" style={{ fontFamily: 'var(--font-nunito)', color: 'rgba(255,255,255,0.88)' }}>
                {displayName}
              </h1>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.2))', border: '0.5px solid rgba(255,255,255,0.12)' }}
              >
                🤍
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-2.5 px-4 mt-3"
        >
          {[
            { label: 'entries',       value: entries.length,                             emoji: '📖' },
            { label: 'words written', value: totalWords.toLocaleString(),                emoji: '✦'  },
            { label: 'favorites',     value: entries.filter(e => e.isFavorite).length,   emoji: '♥'  },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
              className="rounded-[16px] p-3 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}
            >
              <div className="text-lg mb-1">{stat.emoji}</div>
              <div className="text-xl font-light" style={{ fontFamily: 'var(--font-sora)', color: 'rgba(196,181,253,0.9)' }}>
                {stat.value}
              </div>
              <div className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="flex gap-2 px-4 mt-4 mb-3"
        >
          {(['entries', 'links'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="text-[10px] uppercase tracking-[0.09em] px-4 py-1.5 rounded-full transition-all"
              style={{
                background: tab === t ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                border:     `0.5px solid ${tab === t ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color:      tab === t ? 'rgba(196,181,253,0.9)' : 'rgba(255,255,255,0.3)',
                fontFamily: 'var(--font-sora)',
              }}
            >
              {t === 'entries' ? 'Recent entries' : 'Navigate'}
            </button>
          ))}
        </motion.div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 pb-28">

          {tab === 'entries' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
              {isLoading ? (
                <div className="flex flex-col gap-2.5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
                  ))}
                </div>
              ) : entries.length === 0 ? (
                <div className="flex flex-col items-center text-center pt-10 pb-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 text-2xl"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15), rgba(139,92,246,0.03))', border: '0.5px solid rgba(139,92,246,0.18)' }}
                  >
                    📖
                  </div>
                  <p className="text-[14px] font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-sora)' }}>
                    No entries yet
                  </p>
                  <p className="text-[12px] mb-5" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-nunito)' }}>
                    Your journal is waiting for your first words.
                  </p>
                  <motion.button
                    onClick={() => router.push('/journal/new' as any)}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-2xl text-[12px] font-medium"
                    style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(168,85,247,0.4))', border: '0.5px solid rgba(139,92,246,0.3)', color: 'rgba(255,255,255,0.9)', fontFamily: 'var(--font-sora)' }}
                  >
                    Write your first entry ✦
                  </motion.button>
                </div>
              ) : (
                <>
                  {entries.slice(0, 5).map((entry, i) => (
                    <JournalEntryCard
                      key={entry.id}
                      entry={entry}
                      index={i}
                      onToggleFav={toggleFav}
                      onDelete={remove}
                    />
                  ))}
                  {entries.length > 5 && (
                    <motion.button
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                      onClick={() => router.push('/journal' as any)}
                      whileTap={{ scale: 0.97 }}
                      className="w-full py-3 text-[12px] rounded-[14px] mt-1"
                      style={{ color: 'rgba(196,181,253,0.6)', background: 'rgba(139,92,246,0.06)', border: '0.5px solid rgba(139,92,246,0.15)', fontFamily: 'var(--font-sora)' }}
                    >
                      View all {entries.length} entries →
                    </motion.button>
                  )}
                </>
              )}
            </motion.div>
          )}

          {tab === 'links' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <div
                className="rounded-[20px] overflow-hidden mb-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)' }}
              >
                {QUICK_LINKS.map((item, i, arr) => (
                  <motion.button
                    key={item.href}
                    onClick={() => router.push(item.href as any)}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                    style={{ borderBottom: i < arr.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none' }}
                  >
                    <span className="text-base">{item.emoji}</span>
                    <span className="text-sm font-light flex-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{item.label}</span>
                    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>→</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full py-3 text-sm font-light rounded-[14px] transition-all"
                style={{ color: signingOut ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)', letterSpacing: '0.05em' }}
              >
                {signingOut ? 'signing out…' : 'sign out'}
              </motion.button>
            </motion.div>
          )}
        </div>

        <BottomNav />
      </div>
    </main>
  )
}
