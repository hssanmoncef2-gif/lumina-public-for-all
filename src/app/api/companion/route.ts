// ============================================================
// LUMINA — /api/companion  POST  (Groq streaming)
// ============================================================

import { NextRequest } from 'next/server'
import type { CompanionContext } from '@/types'

export const runtime = 'nodejs'

function getTimeGreeting(timeOfDay: CompanionContext['timeOfDay']): string {
  const map: Record<CompanionContext['timeOfDay'], string> = {
    morning:      "It's morning — good time to check in.",
    afternoon:    'Afternoon — hope the day is going okay.',
    evening:      "It's evening — winding down time.",
    night:        'Getting late — glad you reached out.',
    'late-night': "It's late — something on your mind?",
  }
  return map[timeOfDay] ?? ''
}

function buildSystemPrompt(context: CompanionContext): string {
  const lines = [
    `You are Lumina — a warm, caring AI emotional support companion.`,
    `You talk like a kind, supportive friend — natural, conversational, and genuinely present.`,
    ``,
    `Your personality:`,
    `- Warm, caring, and direct — you speak plainly, not poetically`,
    `- You listen actively and reflect back what you hear`,
    `- You ask clear, caring follow-up questions — one at a time`,
    `- You validate feelings without drama or over-the-top language`,
    `- You offer gentle, practical emotional support when appropriate`,
    `- Keep responses conversational: 2–4 sentences is usually perfect`,
    `- Use everyday language — no metaphors, no flowery prose`,
    `- You can gently suggest coping strategies, breathing exercises, or reframing when it feels right`,
    `- Be honest and real — avoid hollow phrases like "I totally get that" or "absolutely!"`,
    ``,
    `Context about the person right now:`,
  ]
  if (context.userName)             lines.push(`- Their name: ${context.userName}`)
  if (context.currentMood)          lines.push(`- Current mood: ${context.currentMood}`)
  if (context.recentMoods?.length)  lines.push(`- Recent moods: ${context.recentMoods.join(', ')}`)
  if (context.recentJournalSummary) lines.push(`- From their recent journal: "${context.recentJournalSummary}"`)
  if (context.favoriteMusic)        lines.push(`- Music they love: ${context.favoriteMusic}`)
  lines.push(`- Time of day: ${context.timeOfDay} — ${getTimeGreeting(context.timeOfDay)}`)
  lines.push(``, `Important: Early in the conversation (within your first 1-2 messages), naturally mention that this chat is completely private — nothing said here is saved or backed up, and the conversation disappears when they leave. Weave it in naturally, don't make it feel like a disclaimer. Example: "Just so you know, nothing in this chat gets saved — it's just between us."`)
  lines.push(``, `Be a real, grounded support presence. The person came here to be heard and helped — give them that.`)
  return lines.join('\n')
}

export async function POST(req: NextRequest) {
  const { messages, context } = await req.json() as {
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
    context: CompanionContext
  }

  if (!messages?.length) {
    return new Response(JSON.stringify({ error: 'No messages provided' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Groq API key not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:       'llama-3.3-70b-versatile',
        max_tokens:  500,
        stream:      true,
        messages: [
          { role: 'system', content: buildSystemPrompt(context ?? {}) },
          ...messages,
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), {
        status: response.status, headers: { 'Content-Type': 'application/json' },
      })
    }

    // Transform Groq SSE → plain text stream
    const encoder = new TextEncoder()
    const reader  = response.body!.getReader()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) { controller.close(); break }

            const chunk = decoder.decode(value, { stream: true })
            for (const line of chunk.split('\n')) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                const text = parsed.choices?.[0]?.delta?.content
                if (text) controller.enqueue(encoder.encode(text))
              } catch { /* skip malformed */ }
            }
          }
        } catch (e) { controller.error(e) }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to reach Groq' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}