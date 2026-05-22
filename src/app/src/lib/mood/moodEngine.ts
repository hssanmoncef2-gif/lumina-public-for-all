// ============================================================
// LUMINA — Mood Engine: Quiz Scoring + Result Calculation
// ============================================================

import type { MoodId, QuizResult } from '@/types'
import { COMFORT_MOODS, MOOD_DATA } from './moodData'

export type QuizAnswers = {
  q1?: string
  q2?: number
  q3?: string
  q4?: string
  q5?: string
}

import { QUIZ_QUESTIONS } from './moodData'

function getOptionWeights(optionId: string): Partial<Record<MoodId, number>> {
  for (const q of QUIZ_QUESTIONS) {
    if (!q.options) continue
    const opt = q.options.find(o => o.id === optionId)
    if (opt) return opt.moodWeights
  }
  return {}
}

function sliderToWeights(value: number): Partial<Record<MoodId, number>> {
  const comfortScore = (100 - value) / 100
  const energyScore  = value / 100
  return {
    calm:    comfortScore * 2.5,
    soft:    comfortScore * 1.5,
    healing: comfortScore * 1.2,
    alive:   energyScore  * 2.5,
    joyful:  energyScore  * 2.0,
  }
}

export function calculateMoodResult(answers: QuizAnswers): QuizResult {
  const scores: Record<MoodId, number> = {
    calm: 0, drifting: 0, soft: 0, alive: 0,
    heavy: 0, anxious: 0, joyful: 0, healing: 0,
  }

  for (const optionId of [answers.q1, answers.q3, answers.q4, answers.q5]) {
    if (!optionId) continue
    const weights = getOptionWeights(optionId)
    for (const [moodId, weight] of Object.entries(weights)) {
      if (weight !== undefined) {
        scores[moodId as MoodId] = (scores[moodId as MoodId] || 0) + weight
      }
    }
  }

  if (answers.q2 !== undefined) {
    const sliderWeights = sliderToWeights(answers.q2)
    for (const [moodId, weight] of Object.entries(sliderWeights)) {
      if (weight !== undefined) {
        scores[moodId as MoodId] = (scores[moodId as MoodId] || 0) + weight
      }
    }
  }

  const ranked = (Object.entries(scores) as [MoodId, number][]).sort((a, b) => b[1] - a[1])
  const primaryMood   = ranked[0][0]
  const secondaryMood = ranked[1][1] > 0 ? ranked[1][0] : undefined

  const sliderVal = answers.q2 ?? 50
  const energyLevel = Math.max(1, Math.min(5, Math.round(sliderVal / 20) + 1)) as 1|2|3|4|5

  const needsComfort = COMFORT_MOODS.includes(primaryMood) ||
    (secondaryMood !== undefined && COMFORT_MOODS.includes(secondaryMood))

  const moodDef = MOOD_DATA[primaryMood]

  return {
    primaryMood,
    secondaryMood,
    energyLevel,
    needsComfort,
    recommendedPlaylist: moodDef.musicCategory,
    recommendedAmbient:  moodDef.ambientMode,
  }
}

// Mood save now goes through the Next.js API route instead of Supabase directly
export async function saveMoodEntry({
  moodId,
  intensity,
  notes,
}: {
  userId?: string
  moodId: MoodId
  intensity: 1|2|3|4|5
  notes?: string
}) {
  const res = await fetch('/api/mood', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ moodId, intensity, notes }),
  })
  const data = await res.json()
  return { data, error: res.ok ? null : data }
}
