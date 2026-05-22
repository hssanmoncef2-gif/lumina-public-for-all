'use client'

import { motion } from 'framer-motion'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

interface Props {
  greeting: { text: string; sub: string }
}

export default function HomeHeader({ greeting }: Props) {
  return (
    <header className="flex items-center justify-between px-5 pt-5">
      {/* Left: greeting */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.1em] text-white/40 font-light">
          {greeting.text}
        </p>
        <p className="text-[15px] font-medium text-white/80 mt-0.5">
          {greeting.sub}
        </p>
      </div>

      {/* Right: logout */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => signOut({ callbackUrl: '/auth/login' })}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '0.5px solid rgba(255,255,255,0.09)',
          color: 'rgba(255,255,255,0.35)',
        }}
        aria-label="Sign out"
      >
        <LogOut size={13} strokeWidth={1.8} />
        <span style={{ fontFamily: 'var(--font-sora, sans-serif)', letterSpacing: '0.05em' }}>
          Sign out
        </span>
      </motion.button>
    </header>
  )
}
