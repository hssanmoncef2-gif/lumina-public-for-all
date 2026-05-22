import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const TRIGGER_CONTEXT: Record<string, string> = {
  overwhelmed:  'The person feels overwhelmed — too many things, too much pressure, like everything is piling on.',
  tired:        'The person is exhausted — deeply tired, running on empty, needing rest and permission to stop.',
  overthinking: 'The person\'s mind won\'t quiet — they\'re spiralling, anxious thoughts looping, unable to slow down.',
  lonely:       'The person feels alone — disconnected, unseen, like no one truly understands them right now.',
  lost:         'The person feels lost — no direction, no clarity, unsure of who they are or where they\'re going.',
  sad:          'The person is sad — heavy-hearted, grieving something, carrying a quiet ache.',
  anxious:      'The person is anxious — a low hum of dread, worry about the future, a tight chest.',
  angry:        'The person is angry — frustrated, maybe hurt underneath it, needing to be heard.',
  hopeless:     'The person feels hopeless — like things won\'t get better, like effort doesn\'t matter.',
  change:       'The person is going through a big change — uncertain, maybe scared, standing at a threshold.',
}

export async function POST(req: NextRequest) {
  const { trigger, mood } = await req.json() as { trigger?: string; mood?: string }

  const context = (trigger && TRIGGER_CONTEXT[trigger])
    ? TRIGGER_CONTEXT[trigger]
    : `The person is going through something hard and opened a letter titled "open when you feel ${trigger ?? 'this way'}".`

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 })
  }

  const systemPrompt = `You are Lumina — a warm, emotionally intelligent AI that writes personal letters.

Your letters are:
- Written directly to the reader ("you", "your") — intimate, like a letter from a close friend who truly sees them
- Warm but not saccharine. Honest, not performative. Gentle, not hollow.
- 4–6 short paragraphs. Each paragraph is 2–4 sentences. No long blocks of text.
- Plain language. No metaphors that feel forced. No toxic positivity.
- They acknowledge the hard thing first — validate before offering perspective
- They end with something small and actionable, or a quiet, hopeful thought
- Signed: "With love,\nLumina ✦"

NEVER use phrases like: "I totally get that", "That's so valid", "You've got this!", "Remember your worth", "Every day is a gift"
NEVER use bullet points or numbered lists.
NEVER be preachy or lecture the person.

Each letter should feel UNIQUE — different opening, different angle, different emotional texture. Not a template.`

  const userPrompt = `Context: ${context}
${mood ? `Their current mood state: ${mood}` : ''}

Write a fresh, unique "Open When…" letter for this person. Make it feel genuinely written for them, right now, in this moment. Vary your opening — don't start with "You are".`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 700,
        temperature: 1.0,
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
    const content = data.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ content })
  } catch (e) {
    console.error('Letter generate error:', e)
    return NextResponse.json({ error: 'Failed to generate letter' }, { status: 500 })
  }
}
