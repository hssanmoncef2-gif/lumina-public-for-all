'use client'

// ============================================================
// LUMINA — New Journal Entry Page
// ============================================================

import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'
import FloatingParticles from '@/components/ui/FloatingParticles'
import JournalEditor from '@/components/journal/JournalEditor'
import { useCreateEntry } from '@/hooks/useJournal'
import { useLuminaStore } from '@/store/useAppStore'

const DEV_USER_ID = 'dev-user'

export default function NewJournalEntryPage() {
  const router      = useRouter()
  const { data: session } = useSession()
  const currentMood = useLuminaStore(s => s.currentMood)
  // Prefer real session userId, fall back to store, then dev fallback
  const userId = (session?.user as any)?.id ?? useLuminaStore.getState().user?.id ?? DEV_USER_ID

  const { create, isSaving, error } = useCreateEntry(userId)

  async function handleSave(data: {
    title: string
    content: string
    mood?: import('@/types').MoodId
    tags: string[]
    isFavorite: boolean
  }) {
    const entry = await create({
      title:       data.title || undefined,
      content:     data.content,
      mood:        data.mood,
      tags:        data.tags,
      isFavorite:  data.isFavorite,
    })
    if (entry) {
      router.push(`/journal/${entry.id}` as any)

    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-lumina-void">
      <AtmosphericBackground mood={currentMood} />
      <FloatingParticles mood={currentMood} count={10} />

      <div className="relative z-content flex flex-col min-h-dvh">
        <div className="safe-top" />

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between px-5 pt-4 pb-5"
        >
          <button
            onClick={() => router.back()}
            className="text-[12px] text-white/35"
            style={{ fontFamily: 'var(--font-sora)' }}
          >
            ← Back
          </button>

          <p
            className="text-[10px] uppercase tracking-[0.12em] text-white/25"
            style={{ fontFamily: 'var(--font-sora)' }}
          >
            New entry
          </p>

          {/* Spacer */}
          <div style={{ width: 40 }} />
        </motion.div>

        {/* Error */}
        {error && (
          <div className="px-5 mb-3">
            <p className="text-[12px] text-red-300/70 text-center">{error}</p>
          </div>
        )}

        {/* Editor */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="flex-1"
        >
          <JournalEditor
            initialMood={currentMood ?? undefined}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={() => router.back()}
            autoFocus
          />
        </motion.div>
      </div>
    </main>
  )
}
