'use client'

// ============================================================
// LUMINA — ServiceWorkerRegistrar
// Registers the SW after mount — client-only, no SSR
// ============================================================

import { useEffect } from 'react'

export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('[Lumina SW] registered', reg.scope)
        })
        .catch((err) => {
          console.warn('[Lumina SW] registration failed', err)
        })
    }
  }, [])

  return null
}
