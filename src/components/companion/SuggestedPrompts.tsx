'use client'

// ============================================================
// LUMINA — SuggestedPrompts
// Scrollable chips of starter messages keyed to current mood
// ============================================================

import { motion } from 'framer-motion'
import type { MoodId } from '@/types'

const PROMPTS_BY_MOOD: Record<MoodId, string[]> = {
  calm: [
    "I've been sitting with something quietly...",
    "There's a stillness I can't quite name.",
    "I want to stay in this feeling a little longer.",
    "Something feels settled today.",
  ],
  drifting: [
    "I'm not sure where I belong right now.",
    "Everything feels a little far away.",
    "I've been lost in my own thoughts.",
    "Help me find something to hold onto.",
  ],
  soft: [
    "I need something gentle today.",
    "I've been a little fragile lately.",
    "Can we just be quiet together for a moment?",
    "I want to feel seen without having to explain.",
  ],
  alive: [
    "Something shifted and I feel lit up.",
    "I want to remember this feeling.",
    "Tell me something beautiful.",
    "I'm ready to start something new.",
  ],
  heavy: [
    "Everything feels like too much right now.",
    "I'm carrying something I can't put down.",
    "I don't know how to keep going today.",
    "I just need someone to understand.",
  ],
  anxious: [
    "My mind won't stop spinning.",
    "I keep expecting something to go wrong.",
    "Can you help me slow down a little?",
    "I'm scared and I don't know why.",
  ],
  joyful: [
    "Something wonderful happened and I want to share it.",
    "I feel grateful right now.",
    "Help me hold this lightness longer.",
    "I'm in a good place — that's new.",
  ],
  healing: [
    "I'm getting better but it's still tender.",
    "Some days I wonder if I'm making progress.",
    "I've been learning to be kinder to myself.",
    "Something old is slowly letting go.",
  ],
}

const DEFAULT_PROMPTS = [
  "How are you feeling right now?",
  "I've been thinking about something...",
  "I need a little support today.",
  "Can we just talk for a bit?",
  "Something's been on my mind.",
]

interface Props {
  mood?: MoodId | null
  onSelect: (prompt: string) => void
  disabled?: boolean
}

export default function SuggestedPrompts({ mood, onSelect, disabled }: Props) {
  const prompts = mood ? PROMPTS_BY_MOOD[mood] ?? DEFAULT_PROMPTS : DEFAULT_PROMPTS

  return (
    <div className="relative">
      {/* Fade edges */}
      <div
        className="absolute left-0 top-0 bottom-0 w-6 pointer-events-none z-10"
        style={{ background: 'linear-gradient(90deg, rgba(8,6,18,0.8) 0%, transparent 100%)' }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-6 pointer-events-none z-10"
        style={{ background: 'linear-gradient(270deg, rgba(8,6,18,0.8) 0%, transparent 100%)' }}
      />

      <div
        className="flex gap-2 overflow-x-auto px-5 pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {prompts.map((prompt, i) => (
          <motion.button
            key={prompt}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            onClick={() => !disabled && onSelect(prompt)}
            disabled={disabled}
            whileTap={{ scale: 0.96 }}
            className="flex-shrink-0 text-left rounded-2xl px-3.5 py-2.5 text-[12px] leading-snug transition-opacity"
            style={{
              fontFamily: 'var(--font-nunito)',
              fontWeight: 300,
              color: disabled ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.55)',
              background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.09)',
              maxWidth: '180px',
              fontStyle: 'italic',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            "{prompt}"
          </motion.button>
        ))}
      </div>
    </div>
  )
}
