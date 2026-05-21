'use client'

// ============================================================
// LUMINA — useMoodHistory (MongoDB via API)
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import type { MoodId } from '@/types'

interface MoodHistoryEntry {
  id: string
  userId: string
  moodId: MoodId
  intensity: 1|2|3|4|5
  notes?: string
  createdAt: Date
}

interface MoodTrend {
  dominantMood: MoodId | null
  streak: number
  entriesThisWeek: MoodHistoryEntry[]
  moodFrequency: Partial<Record<MoodId, number>>
}

export function useMoodHistory(userId: string | null) {
  const [history,   setHistory]   = useState<MoodHistoryEntry[]>([])
  const [trend,     setTrend]     = useState<MoodTrend | null>(null)
  const [isLoading, setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/mood?userId=${userId}&days=30`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()

      const entries: MoodHistoryEntry[] = data.map((row: any) => ({
        id:        row._id,
        userId:    row.userId,
        moodId:    row.moodId as MoodId,
        intensity: row.intensity,
        notes:     row.notes,
        createdAt: new Date(row.createdAt),
      }))

      setHistory(entries)
      setTrend(computeTrend(entries))
    } catch {
      setError('Could not load mood history.')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  return { history, trend, isLoading, error, refetch: fetchHistory }
}

// ---- Helper: also log a mood entry ----
export async function logMood(userId: string, moodId: MoodId, intensity = 3) {
  await fetch('/api/mood', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ userId, moodId, intensity }),
  })
}

function computeTrend(entries: MoodHistoryEntry[]): MoodTrend {
  if (entries.length === 0) {
    return { dominantMood: null, streak: 0, entriesThisWeek: [], moodFrequency: {} }
  }

  const freq: Partial<Record<MoodId, number>> = {}
  for (const e of entries) freq[e.moodId] = (freq[e.moodId] ?? 0) + 1

  const dominantMood = (Object.entries(freq) as [MoodId, number][])
    .sort((a, b) => b[1] - a[1])[0][0]

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const daySet = new Set(entries.map(e => {
    const d = new Date(e.createdAt); d.setHours(0, 0, 0, 0); return d.getTime()
  }))

  let streak = 0
  const cursor = new Date(today)
  while (daySet.has(cursor.getTime())) { streak++; cursor.setDate(cursor.getDate() - 1) }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return {
    dominantMood,
    streak,
    entriesThisWeek: entries.filter(e => new Date(e.createdAt) >= weekAgo),
    moodFrequency: freq,
  }
}
