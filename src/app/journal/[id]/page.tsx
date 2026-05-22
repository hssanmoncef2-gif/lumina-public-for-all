'use client'

// ============================================================
// LUMINA — Journal Entry [id] Page: View + Edit toggle
// ============================================================

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'
import FloatingParticles from '@/components/ui/FloatingParticles'
import JournalEntryView from '@/components/journal/JournalEntryView'
import JournalEditor from '@/components/journal/JournalEditor'
import { useJournalEntry } from '@/hooks/useJournal'
import { deleteEntry } from '@/lib/journal/journalService'
import { useLuminaStore } from '@/store/useAppStore'
import type { MoodId } from '@/types'

const DEV_USER_ID = 'dev-user'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function JournalEntryPage({ params }: PageProps) {
  const { id }       = use(params)
  const router       = useRouter()
  const { data: session } = useSession()
  const currentMood  = useLuminaStore(s => s.currentMood)
  const userId       = (session?.user as any)?.id ?? useLuminaStore.getState().user?.id ?? DEV_USER_ID

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const { entry, isLoading, isSaving, save } = useJournalEntry(id, userId)

  async function handleSave(data: {
    title: string
    content: string
    mood?: MoodId
    tags: string[]
    isFavorite: boolean
  }) {
    await save({
      title:       data.title || undefined,
      content:     data.content,
      mood:        data.mood,
      tags:        data.tags,
      isFavorite:  data.isFavorite,
    })
    setIsEditing(false)
  }

async function handleDelete() {
    setIsDeleting(true)
    try {
      await deleteEntry(id, userId)
      router.push('/journal' as any)
    } catch {
      setIsDeleting(false)
    }
  }

  async function handleToggleFav(value: boolean) {
    await save({ isFavorite: value })
  }

  if (isLoading) {
    return (
      <main className="relative min-h-dvh bg-lumina-void flex items-center justify-center">
        <AtmosphericBackground mood={currentMood} />
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/30 text-[13px]"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Loading…
        </motion.div>
      </main>
    )
  }

  if (!entry) {
    return (
      <main className="relative min-h-dvh bg-lumina-void flex flex-col items-center justify-center gap-4">
        <AtmosphericBackground mood={currentMood} />
        <p className="text-white/40 text-[14px]" style={{ fontFamily: 'var(--font-sora)' }}>
          Entry not found.
        </p>
        <button
          onClick={() => router.push('/journal' as any)}
          className="text-[12px] text-purple-300/60"
          style={{ fontFamily: 'var(--font-sora)' }}
        >
          ← Back to journal
        </button>
      </main>
    )
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-lumina-void">
      <AtmosphericBackground mood={entry.mood ?? currentMood} />
      <FloatingParticles mood={entry.mood ?? currentMood} count={10} />

      <div className="relative z-content min-h-dvh">
        <div className="safe-top" />

        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {/* Edit header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-5">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-[12px] text-white/35"
                  style={{ fontFamily: 'var(--font-sora)' }}
                >
                  ← Cancel
                </button>
                <p
                  className="text-[10px] uppercase tracking-[0.12em] text-white/25"
                  style={{ fontFamily: 'var(--font-sora)' }}
                >
                  Editing
                </p>
                <div style={{ width: 52 }} />
              </div>

              <JournalEditor
                initialTitle={entry.title}
                initialContent={entry.content}
                initialMood={entry.mood}
                initialTags={entry.tags}
                initialFav={entry.isFavorite}
                isSaving={isSaving}
                onSave={handleSave}
                autoFocus={false}
              />
            </motion.div>
          ) : (
            <motion.div
              key="view"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
            >
              <JournalEntryView
                entry={entry}
                onToggleFav={handleToggleFav}
                onDelete={handleDelete}
                onEdit={() => setIsEditing(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
