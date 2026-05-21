'use client'

// ============================================================
// LUMINA — OnboardingStep: animated card for each onboarding step
// ============================================================

import { motion } from 'framer-motion'

export interface StepConfig {
  emoji: string
  title: string
  body: string
  cta: string
  inputLabel?: string      // if set, renders a name input
  inputPlaceholder?: string
}

interface OnboardingStepProps {
  step: StepConfig
  stepIndex: number
  totalSteps: number
  nameValue?: string
  onNameChange?: (v: string) => void
}

export default function OnboardingStep({
  step,
  stepIndex,
  totalSteps,
  nameValue,
  onNameChange,
}: OnboardingStepProps) {
  return (
    <motion.div
      key={stepIndex}
      initial={{ opacity: 0, y: 32, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.97 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center text-center gap-6 max-w-[320px] w-full"
    >
      {/* Floating emoji orb */}
      <div className="relative flex items-center justify-center">
        {/* Glow ring */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute w-24 h-24 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.35), transparent)',
          }}
        />
        <motion.div
          animate={{ y: [0, -9, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="relative text-6xl"
          role="img"
          aria-label={step.emoji}
        >
          {step.emoji}
        </motion.div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-dreamy leading-tight">
        {step.title}
      </h2>

      {/* Body */}
      <p className="text-white/50 text-sm leading-relaxed font-light">
        {step.body}
      </p>

      {/* Optional name input */}
      {step.inputLabel && (
        <div className="w-full text-left">
          <label className="block text-[11px] uppercase tracking-widest text-white/30 mb-2">
            {step.inputLabel}
          </label>
          <input
            type="text"
            value={nameValue ?? ''}
            onChange={(e) => onNameChange?.(e.target.value)}
            placeholder={step.inputPlaceholder ?? 'Your name...'}
            maxLength={32}
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm font-light placeholder-white/20 outline-none focus:border-lumina-purple-dream/50 focus:bg-white/8 transition-all"
            aria-label={step.inputLabel}
          />
        </div>
      )}

      {/* Step progress dots — decorative only, parent controls */}
      <div className="flex gap-1.5 mt-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === stepIndex ? 20 : 5,
              opacity: i <= stepIndex ? 1 : 0.25,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="h-1 rounded-full"
            style={{
              background:
                i <= stepIndex
                  ? 'linear-gradient(90deg, #a78bfa, #f9a8d4)'
                  : 'rgba(255,255,255,0.15)',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
