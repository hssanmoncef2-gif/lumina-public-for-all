'use client'

import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const TABS = [
  { icon: '🏠', label: 'Home',    href: '/home' },
  { icon: '🎵', label: 'Music',   href: '/music' },
  { icon: '✦',  label: 'Lumina',  href: '/lumina' },
  { icon: '📚', label: 'Library', href: '/library' },
  { icon: '🎧', label: 'Audio',   href: '/audiobooks' },
  { icon: '📖', label: 'Journal', href: '/journal' },
  { icon: '🤍', label: 'You',     href: '/you' },
]

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[var(--z-overlay)] safe-bottom"
      style={{
        background: 'rgba(8,6,18,0.85)',
        borderTop: '0.5px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex justify-around px-2 pt-2 pb-3">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/')

          return (
            <button
              key={tab.href}
              onClick={() => router.push(tab.href as any)}
              className="nav-tab"
              style={{ opacity: isActive ? 1 : 0.4 }}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-[16px]"
                  style={{ background: 'rgba(139,92,246,0.12)' }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative text-lg leading-none">{tab.icon}</span>
              <span
                className="relative text-[8px] font-light tracking-[0.08em] uppercase"
                style={{ color: isActive ? 'rgba(196,181,253,0.8)' : 'rgba(255,255,255,0.3)' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
