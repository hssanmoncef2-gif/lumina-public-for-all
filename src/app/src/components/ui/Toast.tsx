'use client'

// ============================================================
// LUMINA — Toast: Global notification system
// ============================================================

import { useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { create } from 'zustand'

// ---- Types ----

export type ToastVariant = 'default' | 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number // ms, default 3500
  icon?: string
}

// ---- Store ----

interface ToastStore {
  toasts: Toast[]
  add: (toast: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
  clear: () => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((s) => ({ toasts: [...s.toasts.slice(-3), { ...toast, id }] }))
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}))

// ---- Imperative helper ----

export const toast = {
  show:    (message: string, icon?: string) =>
    useToastStore.getState().add({ message, variant: 'default', icon }),
  success: (message: string, icon?: string) =>
    useToastStore.getState().add({ message, variant: 'success', icon: icon ?? '✓' }),
  error:   (message: string, icon?: string) =>
    useToastStore.getState().add({ message, variant: 'error',   icon: icon ?? '✕' }),
  info:    (message: string, icon?: string) =>
    useToastStore.getState().add({ message, variant: 'info',    icon: icon ?? '✦' }),
}

// ---- Variant styles ----

const VARIANT_STYLES: Record<ToastVariant, { border: string; glow: string; iconColor: string }> = {
  default: {
    border:    'rgba(255,255,255,0.12)',
    glow:      'rgba(139,92,246,0.15)',
    iconColor: 'rgba(167,139,250,1)',
  },
  success: {
    border:    'rgba(52,211,153,0.25)',
    glow:      'rgba(52,211,153,0.12)',
    iconColor: 'rgba(52,211,153,1)',
  },
  error: {
    border:    'rgba(248,113,113,0.25)',
    glow:      'rgba(248,113,113,0.12)',
    iconColor: 'rgba(248,113,113,1)',
  },
  info: {
    border:    'rgba(96,165,250,0.25)',
    glow:      'rgba(96,165,250,0.12)',
    iconColor: 'rgba(96,165,250,1)',
  },
}

// ---- Single toast item ----

function ToastItem({ toast: t }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = useCallback(() => remove(t.id), [remove, t.id])

  useEffect(() => {
    timerRef.current = setTimeout(dismiss, t.duration ?? 3500)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [dismiss, t.duration])

  const style = VARIANT_STYLES[t.variant]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={dismiss}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer select-none"
      style={{
        background: 'rgba(14,10,30,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${style.border}`,
        boxShadow: `0 8px 32px ${style.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
        maxWidth: 'calc(100vw - 32px)',
      }}
    >
      {t.icon && (
        <span className="text-sm font-medium shrink-0" style={{ color: style.iconColor }}>
          {t.icon}
        </span>
      )}
      <p className="text-[13px] font-light text-white/80 leading-snug">
        {t.message}
      </p>
    </motion.div>
  )
}

// ---- Provider (render at root) ----

export default function ToastProvider() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-[var(--z-toast)] flex flex-col gap-2 items-center pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto w-full max-w-sm mx-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
