'use client'

// ============================================================
// LUMINA — MoodQuizQuestion: Individual question renderer
// ============================================================

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { QuizQuestion } from '@/types'

interface Props {
  question: QuizQuestion
  answer: string | number | undefined
  onChange: (value: string | number) => void
}

export default function MoodQuizQuestion({ question, answer, onChange }: Props) {
  const [sliderVal, setSliderVal] = useState<number>(
    typeof answer === 'number' ? answer : 50
  )

  if (question.type === 'emoji-choice' && question.options) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-sm mx-auto">
        {question.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
            onClick={() => onChange(opt.id)}
            className={`
              relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all
              ${answer === opt.id
                ? 'border-white/30 scale-[1.04] shadow-[0_0_24px_rgba(255,255,255,0.12)]'
                : 'border-white/8 hover:border-white/20 hover:scale-[1.02]'
              }
            `}
            style={{
              background: answer === opt.id
                ? opt.gradient ?? 'rgba(255,255,255,0.12)'
                : 'rgba(255,255,255,0.04)',
            }}
          >
            <span className="text-3xl leading-none">{opt.emoji}</span>
            <span className="text-xs text-white/70 font-medium text-center leading-tight">
              {opt.label}
            </span>
            {answer === opt.id && (
              <motion.div
                layoutId="emoji-selected"
                className="absolute inset-0 rounded-2xl border-2 border-white/40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    )
  }

  if (question.type === 'slider') {
    const displayVal = typeof answer === 'number' ? answer : sliderVal
    const comfortPct = 100 - displayVal
    const energyPct  = displayVal

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto space-y-5"
      >
        {/* Labels */}
        <div className="flex justify-between text-sm">
          <span className={`transition-opacity ${comfortPct > energyPct ? 'opacity-90 text-lumina-purple-soft' : 'opacity-30 text-white'}`}>
            🫶 Comfort
          </span>
          <span className={`transition-opacity ${energyPct > comfortPct ? 'opacity-90 text-lumina-blue-soft' : 'opacity-30 text-white'}`}>
            ⚡ Energy
          </span>
        </div>

        {/* Slider track */}
        <div className="relative h-12 flex items-center">
          {/* Track background */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center">
            <div
              className="w-full h-3 rounded-full"
              style={{
                background: `linear-gradient(to right, rgba(167,139,250,0.6) 0%, rgba(167,139,250,0.3) ${displayVal}%, rgba(56,189,248,0.3) ${displayVal}%, rgba(56,189,248,0.6) 100%)`
              }}
            />
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={displayVal}
            onChange={(e) => {
              const v = Number(e.target.value)
              setSliderVal(v)
              onChange(v)
            }}
            className="relative w-full appearance-none bg-transparent cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-7
              [&::-webkit-slider-thumb]:h-7
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-[0_0_16px_rgba(255,255,255,0.5),0_2px_8px_rgba(0,0,0,0.4)]
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110
              [&::-moz-range-thumb]:w-7
              [&::-moz-range-thumb]:h-7
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:border-0"
          />
        </div>

        {/* Current reading */}
        <p className="text-center text-xs text-white/40 font-light">
          {displayVal < 20 && 'Deep comfort mode'}
          {displayVal >= 20 && displayVal < 40 && 'Mostly comfort, little energy'}
          {displayVal >= 40 && displayVal < 60 && 'Somewhere in between'}
          {displayVal >= 60 && displayVal < 80 && 'A spark of energy'}
          {displayVal >= 80 && 'Full energy mode'}
        </p>
      </motion.div>
    )
  }

  if (question.type === 'visual-choice' && question.options) {
    return (
      <div className={`grid gap-4 w-full max-w-sm mx-auto ${question.options.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {question.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
            onClick={() => onChange(opt.id)}
            className={`
              relative flex flex-col items-center justify-center gap-3 rounded-3xl
              border transition-all py-8 px-4
              ${answer === opt.id
                ? 'border-white/30 shadow-[0_0_32px_rgba(255,255,255,0.1)]'
                : 'border-white/8 hover:border-white/18'
              }
            `}
            style={{
              background: answer === opt.id
                ? (opt.gradient ?? 'rgba(255,255,255,0.12)')
                : 'rgba(255,255,255,0.03)',
            }}
          >
            <span className="text-4xl">{opt.emoji}</span>
            <span className="text-sm font-medium text-white/80">{opt.label}</span>

            {answer === opt.id && (
              <motion.div
                layoutId="visual-selected"
                className="absolute inset-0 rounded-3xl border-2 border-white/40 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    )
  }

  return null
}
