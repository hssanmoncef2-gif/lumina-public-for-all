'use client'

// ============================================================
// LUMINA — JournalEntryCard: Entry preview card
// ============================================================

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { JournalEntry } from '@/types'
import { MOOD_DATA } from '@/lib/mood/moodData'

interface Props {
  entry: JournalEntry
  onToggleFav: (id: string, value: boolean) => void
  onDelete?: (id: string) => void
  index?: number
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours === 0) return 'just now'
    return `${hours}h ago`
  }
  if (days === 1) return 'yesterday'
  if (days < 7)  return `${days} days ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getExcerpt(content: string, max = 90): string {
  const clean = content.replace(/[#*`_~]/g, '').trim()
  if (clean.length <= max) return clean
  return clean.slice(0, max).trimEnd() + '…'
}

export default function JournalEntryCard({ entry, onToggleFav, onDelete, index = 0 }: Props) {
  const router  = useRouter()
  const mood    = entry.mood ? MOOD_DATA[entry.mood] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => router.push(`/journal/${entry.id}` as any)}
      className="relative cursor-pointer overflow-hidden"
      style={{
        background:   'rgba(255,255,255,0.04)',
        border:       '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        marginBottom: 10,
      }}
      whileTap={{ scale: 0.985 }}
    >
      {/* Mood gradient left border */}
      {mood && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[16px]"
          style={{ background: mood.gradient }}
        />
      )}

      <div className="px-4 py-3.5 pl-5">
        {/* Top row: date + favorite */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            {/* Mood emoji badge */}
            {mood && (
              <span
                className="text-[11px] leading-none px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                {mood.emoji}
              </span>
            )}
            <span className="text-[10px] uppercase tracking-[0.09em] text-white/30">
              {formatDate(entry.createdAt)}
            </span>
          </div>

          {/* Favorite toggle */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFav(entry.id, !entry.isFavorite)
            }}
            whileTap={{ scale: 0.8 }}
            className="text-[15px] leading-none transition-opacity"
            style={{ opacity: entry.isFavorite ? 1 : 0.25 }}
            aria-label={entry.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {entry.isFavorite ? '♥' : '♡'}
          </motion.button>
        </div>

        {/* Title */}
        {entry.title && (
          <h3
            className="text-[14px] font-medium leading-snug mb-1"
            style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-sora)' }}
          >
            {entry.title}
          </h3>
        )}

        {/* Excerpt */}
        <p
          className="text-[12.5px] leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.38)', fontFamily: 'var(--font-nunito)' }}
        >
          {getExcerpt(entry.content)}
        </p>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {entry.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-[0.07em] px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(139,92,246,0.12)',
                  color:      'rgba(196,181,253,0.7)',
                  border:     '0.5px solid rgba(139,92,246,0.2)',
                }}
              >
                {tag}
              </span>
            ))}
            {entry.tags.length > 4 && (
              <span className="text-[9px] text-white/25 self-center">+{entry.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
