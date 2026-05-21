'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const ACTIONS = [
  { icon: '📖', label: 'Journal',   href: '/journal',  gradient: 'rgba(139,92,246,0.15)' },
  { icon: '🌙', label: 'Mood quiz', href: '/quiz',     gradient: 'rgba(59,130,246,0.15)' },
  { icon: '💌', label: 'Letters',   href: '/letters',  gradient: 'rgba(236,72,153,0.15)' },
  { icon: '🤍', label: 'Companion', href: '/companion',gradient: 'rgba(52,211,153,0.12)' },
]

export default function QuickActions() {
  const router = useRouter()

  return (
    <div className="flex gap-2.5 px-5">
      {ACTIONS.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4 }}
          whileTap={{ scale: 0.93 }}
          onClick={() => router.push(action.href as any)}
          className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-[16px] transition-all duration-300"
          style={{
            background: action.gradient,
            border: '0.5px solid rgba(255,255,255,0.08)',
          }}
        >
          <span className="text-[18px] leading-none">{action.icon}</span>
          <span className="text-[9px] font-light text-white/40 tracking-wide">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}
