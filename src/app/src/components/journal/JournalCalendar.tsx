'use client'

// ============================================================
// LUMINA — JournalCalendar: Mark & persist important dates
// ============================================================

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MarkedDate {
  date: string // ISO date string YYYY-MM-DD
  label?: string
  color: string
}

const MARK_COLORS = [
  { id: 'rose',    hex: 'rgba(244,168,168,0.85)', label: 'Memory' },
  { id: 'amber',   hex: 'rgba(252,178,110,0.85)', label: 'Milestone' },
  { id: 'violet',  hex: 'rgba(196,181,253,0.85)', label: 'Mood' },
  { id: 'teal',    hex: 'rgba(94,234,212,0.85)',  label: 'Gratitude' },
  { id: 'sky',     hex: 'rgba(147,197,253,0.85)', label: 'Goal' },
]

const STORAGE_KEY = 'lumina_calendar_marks'

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function loadMarks(): MarkedDate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveMarks(marks: MarkedDate[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(marks)) } catch {}
}

export default function JournalCalendar({ entryDates = [] }: { entryDates?: string[] }) {
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [marks,     setMarks]     = useState<MarkedDate[]>([])
  const [selected,  setSelected]  = useState<string | null>(null)
  const [labelInput, setLabelInput] = useState('')
  const [pickedColor, setPickedColor] = useState(MARK_COLORS[0].hex)
  const [showPicker, setShowPicker] = useState(false)

  useEffect(() => { setMarks(loadMarks()) }, [])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  const marksMap: Record<string, MarkedDate> = {}
  marks.forEach(m => { marksMap[m.date] = m })

  const entrySet = new Set(entryDates)
  const todayKey = toDateKey(today)

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  function handleDayClick(day: number) {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelected(key)
    const existing = marksMap[key]
    if (existing) {
      setLabelInput(existing.label || '')
      setPickedColor(existing.color)
    } else {
      setLabelInput('')
      setPickedColor(MARK_COLORS[0].hex)
    }
    setShowPicker(true)
  }

  function saveMark() {
    if (!selected) return
    const updated = marks.filter(m => m.date !== selected)
    updated.push({ date: selected, label: labelInput.trim() || undefined, color: pickedColor })
    setMarks(updated)
    saveMarks(updated)
    setShowPicker(false)
    setSelected(null)
  }

  function removeMark() {
    if (!selected) return
    const updated = marks.filter(m => m.date !== selected)
    setMarks(updated)
    saveMarks(updated)
    setShowPicker(false)
    setSelected(null)
  }

  const monthName = new Date(viewYear, viewMonth).toLocaleString('en-US', { month: 'long' })
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  const cells: (number | null)[] = [...Array(firstDayOfWeek).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '0.5px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={prevMonth} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/08" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'var(--font-sora)' }}>
            {monthName} {viewYear}
          </p>
        </div>
        <button onClick={nextMonth} className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:bg-white/08" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 px-3 pb-1">
        {dayNames.map(d => (
          <div key={d} className="text-center text-[9px] uppercase tracking-[0.1em] py-1" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-sora)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} />
          const key = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isToday = key === todayKey
          const mark = marksMap[key]
          const hasEntry = entrySet.has(key)

          return (
            <motion.button
              key={key}
              onClick={() => handleDayClick(day)}
              whileTap={{ scale: 0.88 }}
              className="relative flex flex-col items-center justify-center rounded-xl aspect-square text-[11px]"
              style={{
                fontFamily: 'var(--font-sora)',
                background: mark
                  ? `${mark.color.replace('0.85', '0.12')}`
                  : isToday
                    ? 'rgba(139,92,246,0.15)'
                    : 'transparent',
                border: mark
                  ? `0.5px solid ${mark.color.replace('0.85', '0.35')}`
                  : isToday
                    ? '0.5px solid rgba(139,92,246,0.35)'
                    : '0.5px solid transparent',
                color: isToday
                  ? 'rgba(196,181,253,0.95)'
                  : mark
                    ? 'rgba(255,255,255,0.85)'
                    : 'rgba(255,255,255,0.55)',
                fontWeight: isToday ? 600 : 400,
              }}
            >
              {mark && (
                <div
                  className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: mark.color }}
                />
              )}
              {day}
              {hasEntry && (
                <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: 'rgba(139,92,246,0.6)' }} />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Legend */}
      {marks.length > 0 && (
        <div className="px-4 pb-3 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
          <p className="text-[9px] uppercase tracking-[0.1em] mb-2" style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-sora)' }}>
            Marked dates
          </p>
          <div className="flex flex-col gap-1 max-h-20 overflow-y-auto">
            {marks
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(-5)
              .map(m => (
                <div key={m.date} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: m.color }} />
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-nunito)' }}>
                    {new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {m.label && ` — ${m.label}`}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Date mark picker modal */}
      <AnimatePresence>
        {showPicker && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={e => { if (e.target === e.currentTarget) { setShowPicker(false); setSelected(null) } }}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="w-full max-w-sm rounded-t-3xl p-5"
              style={{
                background: 'rgba(12,8,26,0.98)',
                border: '0.5px solid rgba(255,220,184,0.1)',
                borderBottom: 'none',
                paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))',
              }}
            >
              <p className="text-[9px] uppercase tracking-[0.12em] mb-1" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-sora)' }}>
                Mark date
              </p>
              <p className="text-[15px] font-medium mb-4" style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-sora)' }}>
                {new Date(selected + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>

              {/* Color picker */}
              <div className="flex items-center gap-2 mb-4">
                {MARK_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setPickedColor(c.hex)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        background: c.hex,
                        boxShadow: pickedColor === c.hex ? `0 0 0 2px rgba(255,255,255,0.4)` : 'none',
                        transform: pickedColor === c.hex ? 'scale(1.15)' : 'scale(1)',
                      }}
                    />
                    <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-nunito)' }}>
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Label input */}
              <input
                type="text"
                value={labelInput}
                onChange={e => setLabelInput(e.target.value)}
                placeholder="Add a note (optional)"
                maxLength={40}
                className="w-full rounded-xl px-4 py-2.5 text-[13px] outline-none mb-4"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '0.5px solid rgba(255,255,255,0.09)',
                  color: 'rgba(255,255,255,0.75)',
                  fontFamily: 'var(--font-nunito)',
                }}
              />

              <div className="flex gap-2">
                {marksMap[selected] && (
                  <button
                    onClick={removeMark}
                    className="flex-1 py-2.5 rounded-xl text-[12px]"
                    style={{
                      background: 'rgba(255,100,100,0.08)',
                      border: '0.5px solid rgba(255,100,100,0.15)',
                      color: 'rgba(255,160,160,0.7)',
                      fontFamily: 'var(--font-sora)',
                    }}
                  >
                    Remove mark
                  </button>
                )}
                <button
                  onClick={saveMark}
                  className="flex-1 py-2.5 rounded-xl text-[12px] font-medium"
                  style={{
                    background: `${pickedColor.replace('0.85', '0.2')}`,
                    border: `0.5px solid ${pickedColor.replace('0.85', '0.4')}`,
                    color: 'rgba(255,255,255,0.9)',
                    fontFamily: 'var(--font-sora)',
                  }}
                >
                  Save mark ✦
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
