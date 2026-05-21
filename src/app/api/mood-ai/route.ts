// ============================================================
// LUMINA — /api/mood-ai  POST  (Groq mood analysis)
// Takes a short text description of how the user feels
// Returns structured mood analysis + recommendations
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are Lumina's mood analysis engine. The user will describe how they're feeling in their own words. Your job is to deeply understand their emotional state and return ONLY a JSON object with no extra text.

Analyze their words for: emotional tone, energy level, need for comfort, what kind of music and ambiance would help.

Return this exact JSON structure:
{
  "primaryMood": one of: "calm" | "drifting" | "soft" | "alive" | "heavy" | "anxious" | "joyful" | "healing",
  "secondaryMood": one of the same values or null,
  "energyLevel": 1-5 (1=very low, 5=very high),
  "needsComfort": boolean,
  "insight": "A single poetic, warm sentence that reflects what you heard in their words — like a gentle mirror, not advice. Max 20 words.",
  "musicMood": "A 2-4 word descriptor for the music they need (e.g. 'soft and dreamy', 'cathartic release', 'grounding energy')",
  "ambientSound": one of: "rain" | "ocean" | "night-forest" | "deep-space" | "brown-noise" | "pink-noise" | "crystal-bowl" | "thunder-rain" | "wind",
  "recommendedPlaylist": one of: "confidence" | "comfort" | "dreamy-nights" | "healing" | "motivation" | "emotional-release" | "ocean-calm" | "rainy-tokyo" | "lo-fi-morning" | "celestial-ambient"
}

Be nuanced. "I'm tired but happy" is different from "I'm exhausted and sad". Read between the lines. If they say very little, go with the emotional undertone.`

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text || text.trim().length < 2) {
    return NextResponse.json({ error: 'Please share a little about how you feel' }, { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    // Fallback: basic keyword matching if no API key
    return NextResponse.json(fallbackAnalysis(text))
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 400,
        temperature: 0.3,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `How I feel: "${text}"` },
        ],
      }),
    })

    if (!response.ok) {
      return NextResponse.json(fallbackAnalysis(text))
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content ?? ''

    try {
      // Strip markdown code fences if present
      const clean = rawContent.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json(fallbackAnalysis(text))
    }
  } catch {
    return NextResponse.json(fallbackAnalysis(text))
  }
}

// Simple keyword-based fallback
function fallbackAnalysis(text: string) {
  const lower = text.toLowerCase()
  let primaryMood: string = 'calm'

  if (/anxious|panic|nervous|stressed|overwhelm|worried|racing/.test(lower)) primaryMood = 'anxious'
  else if (/sad|heavy|low|down|tired|exhausted|empty/.test(lower)) primaryMood = 'heavy'
  else if (/happy|joy|great|amazing|excited|wonderful|good/.test(lower)) primaryMood = 'joyful'
  else if (/alive|energy|motivated|strong|confident|ready/.test(lower)) primaryMood = 'alive'
  else if (/soft|gentle|tender|warm|cozy|safe/.test(lower)) primaryMood = 'soft'
  else if (/lost|numb|drifting|floating|disconnect|empty/.test(lower)) primaryMood = 'drifting'
  else if (/healing|better|recovering|growing|mending/.test(lower)) primaryMood = 'healing'
  else primaryMood = 'calm'

  const moodToPlaylist: Record<string, string> = {
    anxious: 'comfort', heavy: 'emotional-release', joyful: 'lo-fi-morning',
    alive: 'motivation', soft: 'comfort', drifting: 'dreamy-nights',
    healing: 'healing', calm: 'rainy-tokyo',
  }
  const moodToAmbient: Record<string, string> = {
    anxious: 'brown-noise', heavy: 'rain', joyful: 'crystal-bowl',
    alive: 'wind', soft: 'pink-noise', drifting: 'night-forest',
    healing: 'rain', calm: 'ocean',
  }

  return {
    primaryMood,
    secondaryMood: null,
    energyLevel: 3,
    needsComfort: ['heavy', 'anxious', 'drifting'].includes(primaryMood),
    insight: 'Your words carry weight. This space holds it gently.',
    musicMood: 'soft and present',
    ambientSound: moodToAmbient[primaryMood] ?? 'ocean',
    recommendedPlaylist: moodToPlaylist[primaryMood] ?? 'comfort',
  }
}
