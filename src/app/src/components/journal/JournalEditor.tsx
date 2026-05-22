'use client'

// ============================================================
// LUMINA — JournalEditor: Breathing textarea + mood + tags
// ============================================================

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { MoodId } from '@/types'
import { MOOD_DATA } from '@/lib/mood/moodData'

const MOOD_IDS: MoodId[] = ['calm', 'soft', 'alive', 'joyful', 'healing', 'drifting', 'heavy', 'anxious']

interface Props {
  initialTitle?:   string
  initialContent?: string
  initialMood?:    MoodId
  initialTags?:    string[]
  initialFav?:     boolean
  isSaving?:       boolean
  onSave: (data: {
    title:      string
    content:    string
    mood?:      MoodId
    tags:       string[]
    isFavorite: boolean
  }) => void
  onCancel?: () => void
  autoFocus?: boolean
}

export default function JournalEditor({
  initialTitle   = '',
  initialContent = '',
  initialMood,
  initialTags    = [],
  initialFav     = false,
  isSaving       = false,
  onSave,
  onCancel,
  autoFocus      = true,
}: Props) {
  const [title,      setTitle]      = useState(initialTitle)
  const [content,    setContent]    = useState(initialContent)
  const [mood,       setMood]       = useState<MoodId | undefined>(initialMood)
  const [tags,       setTags]       = useState<string[]>(initialTags)
  const [tagInput,   setTagInput]   = useState('')
  const [isFavorite, setIsFavorite] = useState(initialFav)
  const [showMoods,  setShowMoods]  = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const selectedMood = mood ? MOOD_DATA[mood] : null

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(200, el.scrollHeight)}px`
  }, [content])

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => textareaRef.current?.focus(), 300)
    }
  }, [autoFocus])

  function handleTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase().replace(/,/g, '')
      if (!tags.includes(newTag) && tags.length < 8) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag))
  }

  function handleSave() {
    if (!content.trim()) return
    onSave({ title, content, mood, tags, isFavorite })
  }

  const canSave = content.trim().length > 0

  return (
    <div className="flex flex-col gap-0 pb-32">

      {/* Title field */}
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Give this moment a name… (optional)"
        maxLength={100}
        className="w-full bg-transparent outline-none placeholder-white/20 border-none"
        style={{
          fontFamily: 'var(--font-sora)',
          fontSize:   '20px',
          fontWeight: 500,
          color:      'rgba(255,255,255,0.88)',
          padding:    '0 20px',
          marginBottom: 6,
        }}
      />

      {/* Divider */}
      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.06)', margin: '0 20px 16px' }} />

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="What's in your heart today? Write freely — this space is only yours…"
        className="w-full bg-transparent outline-none placeholder-white/18 border-none resize-none"
        style={{
          fontFamily:  'var(--font-nunito)',
          fontSize:    '15px',
          fontWeight:  300,
          lineHeight:  1.85,
          color:       'rgba(255,255,255,0.75)',
          padding:     '0 20px',
          minHeight:   200,
        }}
      />

      {/* Bottom toolbar */}
      <div
        className="fixed bottom-0 left-0 right-0"
        style={{
          background:        'rgba(8,6,18,0.9)',
          borderTop:         '0.5px solid rgba(255,255,255,0.07)',
          backdropFilter:    'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingBottom:     'env(safe-area-inset-bottom)',
        }}
      >
        {/* Tags row */}
        <div
          className="flex items-center flex-wrap gap-1.5 px-4 pt-3 pb-2"
          style={{ minHeight: 36 }}
        >
          {tags.map(tag => (
            <motion.span
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-1 text-[10px] uppercase tracking-[0.07em] px-2.5 py-1 rounded-full"
              style={{
                background: 'rgba(139,92,246,0.15)',
                color:      'rgba(196,181,253,0.8)',
                border:     '0.5px solid rgba(139,92,246,0.25)',
              }}
            >
              {tag}
              <button onClick={() => removeTag(tag)} className="opacity-50 hover:opacity-100 text-[10px]">×</button>
            </motion.span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKey}
            placeholder={tags.length === 0 ? 'Add tags (Enter to add)' : '+ tag'}
            className="bg-transparent outline-none border-none text-[11px] text-white/30 placeholder-white/20 flex-1 min-w-[80px]"
            style={{ fontFamily: 'var(--font-nunito)' }}
            maxLength={24}
          />
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between px-4 pb-3 gap-3">

          {/* Left: mood + fav */}
          <div className="flex items-center gap-2">

            {/* Mood selector button */}
            <div className="relative">
              <button
                onClick={() => setShowMoods(v => !v)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-all"
                style={{
                  background: selectedMood
                    ? 'rgba(139,92,246,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  border: `0.5px solid ${selectedMood ? 'rgba(139,92,246,0.3)' : 'rgba(255,255,255,0.09)'}`,
                  color: selectedMood ? 'rgba(196,181,253,0.9)' : 'rgba(255,255,255,0.35)',
                  fontFamily: 'var(--font-sora)',
                }}
              >
                <span>{selectedMood ? selectedMood.emoji : '✦'}</span>
                <span>{selectedMood ? selectedMood.label : 'Mood'}</span>
              </button>

              {/* Mood picker popover */}
              <AnimatePresence>
                {showMoods && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-[calc(100%+8px)] left-0 z-50 rounded-2xl p-2"
                    style={{
                      background:     'rgba(14,10,30,0.96)',
                      border:         '0.5px solid rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(20px)',
                      width:          220,
                    }}
                  >
                    <div className="grid grid-cols-4 gap-1">
                      {MOOD_IDS.map(mId => {
                        const m = MOOD_DATA[mId]
                        const active = mood === mId
                        return (
                          <button
                            key={mId}
                            onClick={() => { setMood(active ? undefined : mId); setShowMoods(false) }}
                            className="flex flex-col items-center gap-0.5 rounded-xl py-2 px-1 transition-all"
                            style={{
                              background: active ? 'rgba(139,92,246,0.18)' : 'transparent',
                              border:     active ? '0.5px solid rgba(139,92,246,0.3)' : '0.5px solid transparent',
                            }}
                          >
                            <span className="text-[18px] leading-none">{m.emoji}</span>
                            <span className="text-[8px] text-white/45" style={{ fontFamily: 'var(--font-nunito)' }}>
                              {m.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Favorite toggle */}
            <motion.button
              onClick={() => setIsFavorite(v => !v)}
              whileTap={{ scale: 0.8 }}
              className="text-[18px] transition-opacity"
              style={{ opacity: isFavorite ? 1 : 0.25 }}
              aria-label="Toggle favorite"
            >
              {isFavorite ? '♥' : '♡'}
            </motion.button>
          </div>

          {/* Right: cancel + save */}
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-[12px] px-4 py-2 rounded-full"
                style={{
                  color:      'rgba(255,255,255,0.35)',
                  background: 'rgba(255,255,255,0.04)',
                  fontFamily: 'var(--font-sora)',
                }}
              >
                Cancel
              </button>
            )}

            <motion.button
              onClick={handleSave}
              disabled={!canSave || isSaving}
              whileTap={{ scale: canSave ? 0.95 : 1 }}
              className="text-[12px] font-medium px-5 py-2 rounded-full transition-all"
              style={{
                background: canSave
                  ? 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(168,85,247,0.7))'
                  : 'rgba(255,255,255,0.05)',
                color:      canSave ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
                fontFamily: 'var(--font-sora)',
                opacity:    isSaving ? 0.6 : 1,
              }}
            >
              {isSaving ? 'Saving…' : 'Save'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
