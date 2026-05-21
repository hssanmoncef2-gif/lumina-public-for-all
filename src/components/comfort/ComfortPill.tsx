'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function ComfortPill() {
  const router = useRouter()

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={() => router.push('/comfort' as any)}
      className="comfort-pill w-full"
    >
      {/* Pulsing dot */}
      <motion.div
        animate={{ opacity: [1, 0.4, 1], scale: [1, 0.7, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: '#fbcfe8' }}
      />

      {/* Text */}
      <p className="flex-1 text-xs text-left text-white/65">
        Need a softer moment right now?
      </p>

      {/* Badge + arrow */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[9px] px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(139,92,246,0.2)',
            color: 'rgba(196,181,253,0.8)',
            border: '0.5px solid rgba(139,92,246,0.25)',
          }}
        >
          Comfort mode
        </span>
        <span className="text-white/25 text-sm">›</span>
      </div>
    </motion.button>
  )
}
