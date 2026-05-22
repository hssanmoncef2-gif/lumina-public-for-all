'use client'

// ============================================================
// LUMINA — MoodResult: Quiz result + recommendations
// ============================================================

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { QuizResult } from '@/types'
import { MOOD_DATA } from '@/lib/mood/moodData'

interface Props {
  result: QuizResult
  onContinue: () => void
  onRetake: () => void
}

const MUSIC_LABELS: Record<string, string> = {
  'ocean-calm':         'Ocean Calm',
  'dreamy-nights':      'Dreamy Nights',
  'comfort':            'Comfort Sounds',
  'healing':            'Healing Frequencies',
  'motivation':         'Motivation Mix',
  'emotional-release':  'Emotional Release',
  'lo-fi-morning':      'Lo-fi Morning',
  'celestial-ambient':  'Celestial Ambient',
  'rainy-tokyo':        'Rainy Tokyo',
  'confidence':         'Confidence Boost',
}

const AMBIENT_LABELS: Record<string, string> = {
  'ocean-twilight':  'Ocean Twilight',
  'deep-night':      'Deep Night',
  'foggy-morning':   'Foggy Morning',
  'golden-hour':     'Golden Hour',
  'rainy-night':     'Rainy Night',
  'dusk':            'Dusk',
  'night-city':      'Night City',
  'clear-day':       'Clear Day',
}

export default function MoodResult({ result, onContinue, onRetake }: Props) {
  const mood = MOOD_DATA[result.primaryMood]
  const secondary = result.secondaryMood ? MOOD_DATA[result.secondaryMood] : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      className="relative flex flex-col items-center gap-6 w-full"
    >
      {/* Mood orb */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, type: 'spring', stiffness: 180, damping: 20 }}
        className="relative"
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-50 scale-150"
          style={{ background: mood.gradient }}
        />
        <div
          className="relative w-28 h-28 rounded-full flex items-center justify-center text-5xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
          style={{ background: mood.gradient }}
        >
          {mood.emoji}
        </div>
      </motion.div>

      {/* Mood label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-center space-y-2"
      >
        <p className="text-xs uppercase tracking-widest text-white/35 font-medium">
          Your mood right now
        </p>
        <h2 className="text-3xl font-light" style={{ color: mood.accentColor }}>
          {mood.label}
        </h2>
        {secondary && (
          <p className="text-sm text-white/40">
            with a hint of {secondary.label.toLowerCase()} {secondary.emoji}
          </p>
        )}
      </motion.div>

      {/* Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-center max-w-xs space-y-1.5"
      >
        <p className="text-white/85 font-medium text-base">{mood.resultMessage}</p>
        <p className="text-white/45 text-sm leading-relaxed font-light">{mood.resultSub}</p>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="w-full max-w-xs space-y-3"
      >
        <p className="text-xs text-center uppercase tracking-widest text-white/25">
          Made for this moment
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Music rec */}
          <div
            className="flex flex-col gap-1.5 p-4 rounded-2xl border border-white/8"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <span className="text-xl">🎵</span>
            <p className="text-[11px] text-white/35 uppercase tracking-wider">Music</p>
            <p className="text-sm text-white/75 font-medium leading-tight">
              {MUSIC_LABELS[result.recommendedPlaylist] ?? result.recommendedPlaylist}
            </p>
          </div>

          {/* Ambient rec */}
          <div
            className="flex flex-col gap-1.5 p-4 rounded-2xl border border-white/8"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <span className="text-xl">🌙</span>
            <p className="text-[11px] text-white/35 uppercase tracking-wider">Atmosphere</p>
            <p className="text-sm text-white/75 font-medium leading-tight">
              {AMBIENT_LABELS[result.recommendedAmbient] ?? result.recommendedAmbient}
            </p>
          </div>
        </div>

        {/* Comfort mode badge */}
        {result.needsComfort && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-purple-400/20"
            style={{ background: 'rgba(167,139,250,0.08)' }}
          >
            <span className="text-lg">🫂</span>
            <div>
              <p className="text-xs text-purple-300/80 font-medium">Comfort mode available</p>
              <p className="text-[11px] text-white/35 leading-tight">
                Breathing guide + soft visuals when you need it
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col gap-3 w-full max-w-xs"
      >
        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-2xl font-medium text-sm transition-all
            hover:opacity-90 active:scale-[0.98]"
          style={{
            background: mood.gradient,
            color: 'rgba(255,255,255,0.95)',
            boxShadow: `0 4px 24px ${mood.accentColor}33`,
          }}
        >
          Take me home ✦
        </button>

        <button
          onClick={onRetake}
          className="w-full py-3 rounded-2xl text-sm text-white/35 border border-white/8
            hover:text-white/55 hover:border-white/15 transition-all"
        >
          Retake quiz
        </button>
      </motion.div>
    </motion.div>
  )
}
