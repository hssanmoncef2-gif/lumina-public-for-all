'use client'

import { useMemo, useState, useEffect, memo } from 'react'
import type { MoodId } from '@/types'

const MOOD_COLORS: Record<string, string[]> = {
  calm:     ['rgba(180,130,255,0.7)', 'rgba(120,180,255,0.6)', 'rgba(255,160,200,0.5)'],
  drifting: ['rgba(100,180,255,0.7)', 'rgba(180,220,255,0.6)', 'rgba(140,200,255,0.5)'],
  soft:     ['rgba(255,160,210,0.7)', 'rgba(220,150,255,0.6)', 'rgba(255,200,230,0.5)'],
  alive:    ['rgba(80,220,160,0.7)',  'rgba(100,255,180,0.6)', 'rgba(150,255,200,0.5)'],
  heavy:    ['rgba(140,100,255,0.6)', 'rgba(100,80,220,0.5)',  'rgba(160,140,255,0.4)'],
  default:  ['rgba(180,130,255,0.6)', 'rgba(120,180,255,0.5)', 'rgba(255,255,255,0.3)'],
}

interface Particle {
  x: number
  y: number
  size: number
  color: string
  speed: number
  dx: number
  opacity: number
  life: number
  maxLife: number
}

interface Props {
  mood: MoodId | null
  count?: number
}

// CSS-only version — client-only to avoid hydration mismatch from Math.random()
const FloatingParticles = memo(function FloatingParticles({ mood, count = 18 }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const colors = MOOD_COLORS[mood ?? 'default'] ?? MOOD_COLORS.default

  // Generate stable random values once on client only
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    startY: `${60 + Math.random() * 40}%`,
    color: colors[i % colors.length],
    size: 1.5 + Math.random() * 2,
    duration: `${4 + Math.random() * 7}s`,
    delay: `${Math.random() * 6}s`,
    dx: `${(Math.random() - 0.5) * 50}px`,
  })), [count]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.startY,
            width: p.size,
            height: p.size,
            background: p.color,
            // Custom property for drift direction
            ['--dx' as string]: p.dx,
            animation: `driftUp ${p.duration} linear ${p.delay} infinite`,
          }}
        />
      ))}
    </div>
  )
})

export default FloatingParticles
