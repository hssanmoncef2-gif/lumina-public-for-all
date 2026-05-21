import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MOOD_CONTEXT: Record<string, string> = {
  calm:     'The person is feeling calm, peaceful, and at rest.',
  drifting: 'The person feels uncertain, between things, not sure where they are headed.',
  soft:     'The person is in a tender, gentle, emotionally open mood.',
  alive:    'The person feels energised, present, and full of life.',
  heavy:    'The person is going through something hard — grief, exhaustion, or emotional weight.',
  default:  'The person is in an unspecified but reflective mood.',
}

export async function POST(req: NextRequest) {
  const { mood } = await req.json() as { mood?: string }
  const moodKey = mood && MOOD_CONTEXT[mood] ? mood : 'default'
  const moodDesc = MOOD_CONTEXT[moodKey]

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
  }

  const systemPrompt = `You are a writer for Lumina, a gentle emotional wellness app. 
Your job is to write short, beautiful, original affirmation quotes — the kind that feel like they were written just for this person in this moment.

Style rules:
- Second person ("you", "your") — never "I" or "we"
- Short sentences. Plain language. No clichés.
- Emotionally resonant but never dramatic or over-the-top
- Each quote is 1–3 sentences max
- The "sub" is a tiny poetic label like "for the heavy days" or "for the uncertain heart" — 2–6 words, lowercase, no punctuation

Respond ONLY with a valid JSON array of 5 objects, each with "text" and "sub" fields. No markdown, no explanation, no extra text.

Example format:
[
  {"text": "You don't have to figure it all out today.", "sub": "for the uncertain heart"},
  {"text": "Rest is not giving up. It is how you come back.", "sub": "for the tired ones"}
]`

  const userPrompt = `Context: ${moodDesc}

Generate 5 unique, fresh affirmation quotes suited to this mood. Each should feel distinct — different angles, different tones. Return only the JSON array.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 600,
        temperature: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return NextResponse.json({ error: err }, { status: response.status })
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content ?? '[]'

    // Strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, '').trim()
    const quotes = JSON.parse(clean)

    return NextResponse.json({ quotes })
  } catch (e) {
    console.error('Quotes API error:', e)
    return NextResponse.json({ error: 'Failed to generate quotes' }, { status: 500 })
  }
}
