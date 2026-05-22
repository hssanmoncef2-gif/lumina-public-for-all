'use client'

// ============================================================
// LUMINA — BreathingGuide
// Animated breathing circle: 4s inhale / 2s hold / 4s exhale
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type Phase = 'inhale' | 'hold' | 'exhale' | 'pause'

interface PhaseConfig {
  label: string
  subLabel: string
  duration: number // seconds
  scale: number
  opacity: number
}

const PHASES: PhaseConfig[] = [
  { label: 'breathe in',  subLabel: 'slowly, deeply',        duration: 4, scale: 1.5,  opacity: 0.9 },
  { label: 'hold',        subLabel: 'gently',                 duration: 2, scale: 1.5,  opacity: 0.8 },
  { label: 'breathe out', subLabel: 'let everything go',      duration: 4, scale: 1.0,  opacity: 0.5 },
  { label: 'rest',        subLabel: 'one more moment',        duration: 1, scale: 1.0,  opacity: 0.4 },
]

export default function BreathingGuide() {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [count, setCount] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].duration)
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phase = PHASES[phaseIndex]

  useEffect(() => {
    if (!isActive) return

    let remaining = phase.duration
    setSecondsLeft(remaining)

    intervalRef.current = setInterval(() => {
      remaining -= 1
      setSecondsLeft(remaining)

      if (remaining <= 0) {
        clearInterval(intervalRef.current!)
        const nextIndex = (phaseIndex + 1) % PHASES.length
        setPhaseIndex(nextIndex)
        if (nextIndex === 0) setCount(c => c + 1)
      }
    }, 1000)

    return () => clearInterval(intervalRef.current!)
  }, [isActive, phaseIndex])

  function toggle() {
    if (isActive) {
      clearInterval(intervalRef.current!)
      setIsActive(false)
      setPhaseIndex(0)
      setCount(0)
      setSecondsLeft(PHASES[0].duration)
    } else {
      setIsActive(true)
    }
  }

  const progressPercent = ((phase.duration - secondsLeft) / phase.duration) * 100

  return (
    <div className="flex flex-col items-center">
      {/* Breathing orb */}
      <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

        {/* Outer glow ring — progress */}
        <svg className="absolute inset-0" width={220} height={220} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={110} cy={110} r={100}
            fill="none"
            stroke="rgba(196,181,253,0.08)"
            strokeWidth={1}
          />
          {isActive && (
            <motion.circle
              key={phaseIndex}
              cx={110} cy={110} r={100}
              fill="none"
              stroke="rgba(196,181,253,0.45)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 100}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 100 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - progressPercent / 100) }}
              transition={{ duration: phase.duration, ease: 'linear' }}
            />
          )}
        </svg>

        {/* Middle glow ring */}
        <motion.div
          animate={isActive ? {
            scale: phase.scale,
            opacity: phase.opacity,
          } : {
            scale: 1,
            opacity: 0.3,
          }}
          transition={{
            duration: phase.duration,
            ease: phaseIndex === 0 ? 'easeOut' : phaseIndex === 2 ? 'easeIn' : 'linear',
          }}
          className="absolute rounded-full"
          style={{
            width: 120,
            height: 120,
            background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, rgba(196,181,253,0.12) 60%, transparent 100%)',
            filter: 'blur(8px)',
          }}
        />

        {/* Inner circle */}
        <motion.div
          animate={isActive ? {
            scale: phase.scale * 0.75,
            opacity: phase.opacity,
          } : {
            scale: 1,
            opacity: 0.5,
          }}
          transition={{
            duration: phase.duration,
            ease: phaseIndex === 0 ? 'easeOut' : phaseIndex === 2 ? 'easeIn' : 'linear',
          }}
          className="absolute rounded-full"
          style={{
            width: 80,
            height: 80,
            background: 'radial-gradient(circle, rgba(196,181,253,0.25) 0%, rgba(139,92,246,0.1) 100%)',
            boxShadow: '0 0 30px rgba(139,92,246,0.3)',
          }}
        />

        {/* Center content */}
        <div className="relative text-center z-10">
          <AnimatePresence mode="wait">
            {isActive ? (
              <motion.div
                key={phaseIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <p
                  className="text-sm font-light leading-tight"
                  style={{
                    fontFamily: 'var(--font-nunito)',
                    color: 'rgba(196,181,253,0.9)',
                  }}
                >
                  {phase.label}
                </p>
                <p
                  className="text-[11px] font-light mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  {secondsLeft}s
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '20px' }}>✦</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Phase label below */}
      <AnimatePresence mode="wait">
        {isActive && (
          <motion.div
            key={phaseIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4 }}
            className="text-center mt-2 mb-1"
          >
            <p
              className="text-xs font-light"
              style={{
                fontFamily: 'var(--font-nunito)',
                color: 'rgba(255,255,255,0.35)',
                letterSpacing: '0.05em',
              }}
            >
              {phase.subLabel}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breath count */}
      {count > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] mt-2"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          {count} {count === 1 ? 'breath' : 'breaths'} completed
        </motion.p>
      )}

      {/* Start/Stop button */}
      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.96 }}
        className="mt-8 px-8 py-3 rounded-full text-sm font-light transition-all"
        style={{
          fontFamily: 'var(--font-sora)',
          background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(139,92,246,0.18)',
          border: '0.5px solid',
          borderColor: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(139,92,246,0.4)',
          color: isActive ? 'rgba(255,255,255,0.45)' : 'rgba(196,181,253,0.85)',
          letterSpacing: '0.08em',
        }}
      >
        {isActive ? 'stop' : 'begin'}
      </motion.button>
    </div>
  )
}
