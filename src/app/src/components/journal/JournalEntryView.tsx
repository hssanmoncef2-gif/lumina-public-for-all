'use client'

// ============================================================
// LUMINA — JournalEntryView: Full entry display + AI reflection
// ============================================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import type { JournalEntry } from '@/types'
import { MOOD_DATA } from '@/lib/mood/moodData'
import AIReflectionCard from '@/components/journal/AIReflectionCard'

interface Props {
  entry: JournalEntry
  onToggleFav: (value: boolean) => void
  onDelete: () => void
  onEdit: () => void
}

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function JournalEntryView({ entry, onToggleFav, onDelete, onEdit }: Props) {
  const router       = useRouter()
  const [showDelete, setShowDelete] = useState(false)
  const mood         = entry.mood ? MOOD_DATA[entry.mood] : null

  return (
    <div className="relative min-h-dvh" style={{ paddingBottom: 100 }}>

      {/* Mood gradient glow at top */}
      {mood && (
        <div
          className="fixed top-0 left-0 right-0 h-40 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, ${mood.accentColor}22 0%, transparent 100%)`,
            zIndex: 0,
          }}
        />
      )}

      <div className="relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[12px] text-white/40"
            style={{ fontFamily: 'var(--font-sora)' }}
          >
            ← Back
          </button>

          <div className="flex items-center gap-4">
            {/* Favorite */}
            <motion.button
              onClick={() => onToggleFav(!entry.isFavorite)}
              whileTap={{ scale: 0.8 }}
              className="text-[18px]"
              style={{ opacity: entry.isFavorite ? 1 : 0.25 }}
            >
              {entry.isFavorite ? '♥' : '♡'}
            </motion.button>

            {/* Edit */}
            <button
              onClick={onEdit}
              className="text-[12px] text-white/40"
              style={{ fontFamily: 'var(--font-sora)' }}
            >
              Edit
            </button>

            {/* Delete */}
            <button
              onClick={() => setShowDelete(true)}
              className="text-[12px] text-white/25"
              style={{ fontFamily: 'var(--font-sora)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Date + mood badge */}
        <div className="flex items-center gap-2 px-5 mt-1 mb-4">
          {mood && (
            <span
              className="text-[11px] leading-none px-2 py-1 rounded-full flex items-center gap-1"
              style={{
                background: `${mood.accentColor}20`,
                border: `0.5px solid ${mood.accentColor}40`,
                color: mood.accentColor,
                fontFamily: 'var(--font-sora)',
              }}
            >
              {mood.emoji} {mood.label}
            </span>
          )}
          <span className="text-[10px] uppercase tracking-[0.09em] text-white/25">
            {formatFullDate(entry.createdAt)}
          </span>
        </div>

        {/* Title */}
        {entry.title && (
          <h1
            className="px-5 mb-3 leading-snug"
            style={{
              fontFamily: 'var(--font-sora)',
              fontSize:   '22px',
              fontWeight: 500,
              color:      'rgba(255,255,255,0.92)',
            }}
          >
            {entry.title}
          </h1>
        )}

        {/* Divider */}
        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '0 20px 20px' }} />

        {/* Content */}
        <div
          className="px-5 whitespace-pre-wrap"
          style={{
            fontFamily:  'var(--font-nunito)',
            fontSize:    '15px',
            fontWeight:  300,
            lineHeight:  1.85,
            color:       'rgba(255,255,255,0.72)',
          }}
        >
          {entry.content}
        </div>

        {/* Tags */}
        {entry.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 mt-6">
            {entry.tags.map(tag => (
              <span
                key={tag}
                className="text-[9px] uppercase tracking-[0.07em] px-2.5 py-1 rounded-full"
                style={{
                  background: 'rgba(139,92,246,0.12)',
                  color:      'rgba(196,181,253,0.7)',
                  border:     '0.5px solid rgba(139,92,246,0.2)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* AI Reflection card */}
        <AIReflectionCard entry={entry} />

      </div>

      {/* Delete confirm overlay */}
      <AnimatePresence>
        {showDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowDelete(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full rounded-t-3xl p-6"
              style={{ background: 'rgba(14,10,30,0.98)', border: '0.5px solid rgba(255,255,255,0.09)' }}
              onClick={e => e.stopPropagation()}
            >
              <p
                className="text-center text-[15px] font-medium mb-1"
                style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-sora)' }}
              >
                Delete this entry?
              </p>
              <p
                className="text-center text-[12px] mb-6"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-nunito)' }}
              >
                This moment can't be recovered.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={onDelete}
                  className="w-full py-3.5 rounded-2xl text-[13px] font-medium"
                  style={{
                    background:  'rgba(239,68,68,0.15)',
                    border:      '0.5px solid rgba(239,68,68,0.3)',
                    color:       'rgba(252,165,165,0.9)',
                    fontFamily:  'var(--font-sora)',
                  }}
                >
                  Yes, delete it
                </button>
                <button
                  onClick={() => setShowDelete(false)}
                  className="w-full py-3.5 rounded-2xl text-[13px]"
                  style={{
                    background:  'rgba(255,255,255,0.04)',
                    color:       'rgba(255,255,255,0.4)',
                    fontFamily:  'var(--font-sora)',
                  }}
                >
                  Keep it
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
