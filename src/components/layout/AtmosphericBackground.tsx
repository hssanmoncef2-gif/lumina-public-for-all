'use client'

import { useEffect, useRef, memo } from 'react'
import type { MoodId } from '@/types'

interface Props {
  mood: MoodId | null
}

const AtmosphericBackground = memo(function AtmosphericBackground({ mood }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.setAttribute('data-mood', mood ?? 'default')
  }, [mood])

  return (
    <div ref={ref} className="atmo-root" data-mood={mood ?? 'default'}>
      <div className="atmo-base" />
      <div className="atmo-orb atmo-orb-a" />
      <div className="atmo-orb atmo-orb-b" />
      <div className="atmo-orb atmo-orb-c" />
      <div className="atmo-fx" />
      <div className="atmo-particles">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="atmo-particle" style={{ '--i': i } as React.CSSProperties} />
        ))}
      </div>
      <div className="atmo-vignette" />
    </div>
  )
})

export default AtmosphericBackground
