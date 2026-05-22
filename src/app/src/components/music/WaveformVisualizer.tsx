'use client'

import { motion } from 'framer-motion'

// ============================================================
// WaveformVisualizer — animated bars reacting to isPlaying
// CSS keyframe mode when no real waveformData
// ============================================================

const DEFAULT_HEIGHTS = [5, 9, 14, 10, 18, 12, 20, 8, 15, 11, 17, 9, 13, 19, 7, 16, 11, 14, 8, 18, 12, 16, 10, 20, 7]

interface Props {
  isPlaying: boolean
  waveformData?: number[]  // 0-1 normalized
  barCount?: number
  height?: number          // container height in px
  color?: string
  variant?: 'standard' | 'minimal' | 'thick'
}

export default function WaveformVisualizer({
  isPlaying,
  waveformData,
  barCount = 25,
  height = 32,
  color = 'rgba(167,139,250,0.6)',
  variant = 'standard',
}: Props) {
  const bars = waveformData
    ? waveformData.slice(0, barCount).map(v => Math.max(3, v * height * 0.9))
    : DEFAULT_HEIGHTS.slice(0, barCount)

  const barWidth = variant === 'thick' ? 3 : variant === 'minimal' ? 1.5 : 2
  const gap = variant === 'thick' ? 3 : 2

  return (
    <div
      className="flex items-end"
      style={{ height, gap, width: '100%' }}
      aria-hidden="true"
    >
      {bars.map((h, i) => {
        const minH = Math.max(3, h * 0.25)
        const maxH = h
        const duration = 0.4 + (i % 7) * 0.07
        const delay = i * 0.035

        return (
          <motion.div
            key={i}
            className="rounded-full flex-1"
            style={{
              background: color,
              minWidth: barWidth,
              maxWidth: barWidth + 4,
            }}
            animate={
              isPlaying
                ? {
                    height: [minH, maxH, minH * 1.4, maxH * 0.8, minH],
                    opacity: [0.5, 0.9, 0.7, 1, 0.5],
                  }
                : {
                    height: minH,
                    opacity: 0.25,
                  }
            }
            transition={
              isPlaying
                ? {
                    duration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay,
                    repeatType: 'mirror',
                  }
                : { duration: 0.4, ease: 'easeOut' }
            }
          />
        )
      })}
    </div>
  )
}
