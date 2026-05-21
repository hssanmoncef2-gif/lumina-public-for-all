'use client'

import { motion } from 'framer-motion'
import type { MoodId } from '@/types'

// Vivid, distinct moods with real emotional meaning
const MOODS: Array<{
  id: MoodId
  emoji: string
  label: string
  sublabel: string
  activeGradient: string
  glowColor: string
}> = [
  {
    id: 'alive',
    emoji: '⚡',
    label: 'Alive',
    sublabel: 'electric',
    activeGradient: 'rgba(52,211,153,0.18)',
    glowColor: 'rgba(52,211,153,0.4)',
  },
  {
    id: 'joyful',
    emoji: '✨',
    label: 'Joyful',
    sublabel: 'light',
    activeGradient: 'rgba(251,191,36,0.18)',
    glowColor: 'rgba(251,191,36,0.4)',
  },
  {
    id: 'soft',
    emoji: '🌸',
    label: 'Soft',
    sublabel: 'tender',
    activeGradient: 'rgba(249,168,212,0.18)',
    glowColor: 'rgba(249,168,212,0.4)',
  },
  {
    id: 'calm',
    emoji: '🌊',
    label: 'Calm',
    sublabel: 'still',
    activeGradient: 'rgba(14,165,233,0.18)',
    glowColor: 'rgba(14,165,233,0.4)',
  },
  {
    id: 'drifting',
    emoji: '🌙',
    label: 'Adrift',
    sublabel: 'floating',
    activeGradient: 'rgba(129,140,248,0.18)',
    glowColor: 'rgba(129,140,248,0.4)',
  },
  {
    id: 'healing',
    emoji: '🌱',
    label: 'Healing',
    sublabel: 'mending',
    activeGradient: 'rgba(134,239,172,0.18)',
    glowColor: 'rgba(134,239,172,0.4)',
  },
  {
    id: 'anxious',
    emoji: '🌀',
    label: 'Anxious',
    sublabel: 'spinning',
    activeGradient: 'rgba(251,146,60,0.18)',
    glowColor: 'rgba(251,146,60,0.4)',
  },
  {
    id: 'heavy',
    emoji: '🌧',
    label: 'Heavy',
    sublabel: 'weighted',
    activeGradient: 'rgba(99,102,241,0.18)',
    glowColor: 'rgba(99,102,241,0.4)',
  },
]

interface Props {
  currentMood: MoodId | null
  onMoodSelect: (mood: MoodId) => void
}

export default function MoodSelector({ currentMood, onMoodSelect }: Props) {
  return (
    <div className="px-5">
      <div
        className="rounded-[20px] p-4"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.1em] text-white/30 mb-3">
          How does your heart feel right now?
        </p>

        {/* 4-column grid for more moods */}
        <div className="grid grid-cols-4 gap-2">
          {MOODS.map((mood, i) => {
            const isActive = currentMood === mood.id
            return (
              <motion.button
                key={mood.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onMoodSelect(mood.id)}
                className="relative flex flex-col items-center gap-1 py-2.5 rounded-[14px] transition-all duration-300"
                style={{
                  border: `0.5px solid ${isActive ? mood.glowColor : 'rgba(255,255,255,0.09)'}`,
                  background: isActive ? mood.activeGradient : 'transparent',
                  boxShadow: isActive ? `0 0 12px ${mood.glowColor}` : 'none',
                  transform: isActive ? 'translateY(-2px)' : 'none',
                }}
                aria-pressed={isActive}
                aria-label={`Mood: ${mood.label}`}
              >
                <motion.span
                  className="text-[18px] leading-none"
                  animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
                >
                  {mood.emoji}
                </motion.span>
                <span
                  className="text-[9px] font-medium tracking-wide"
                  style={{ color: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.38)' }}
                >
                  {mood.label}
                </span>
                {isActive && (
                  <span
                    className="text-[8px] tracking-wide"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    {mood.sublabel}
                  </span>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
