// ============================================================
// LUMINA — /api/reflect  POST  (Groq streaming)
// Journal entry → gentle AI reflection
// ============================================================

import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are Lumina — a gentle, emotionally intelligent AI companion built into a dreamy emotional wellness app. Your role is to offer a brief, poetic reflection on journal entries.

When reflecting on a journal entry:
- Write in a warm, soft, hand-written letter style — like a caring friend, not a therapist
- Be concise: 2–4 sentences maximum
- Acknowledge the emotion beneath the words without projecting or diagnosing
- End with something grounding or gently uplifting
- Use soft, poetic language — no clinical terms, no bullet points, no generic affirmations
- Write in second person ("you felt...", "there's something tender in...")
- Do NOT start with "I" — start with an observation about what was written
- Do NOT repeat the journal content back verbatim
- The reflection should feel like catching your breath after reading something beautiful`

export async function POST(req: NextRequest) {
  const { entryId, content, mood, title } = await req.json()

  if (!content) {
    return new Response(JSON.stringify({ error: 'No content provided' }), {
      status: 400, headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Groq API key not configured' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  const userPrompt = `Please offer a gentle reflection on this journal entry${mood ? ` (written while feeling ${mood})` : ''}${title ? ` titled "${title}"` : ''}:\n\n---\n${content}\n---\n\nReflect in 2–4 soft, poetic sentences.`

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model:      'llama-3.3-70b-versatile',
        max_tokens: 200,
        stream:     true,
        messages: [
          { role: 'system',  content: SYSTEM_PROMPT },
          { role: 'user',    content: userPrompt },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: err }), {
        status: response.status, headers: { 'Content-Type': 'application/json' },
      })
    }

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
              } catch { /* skip */ }
            }
          }
        } catch (e) { controller.error(e) }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Entry-Id': entryId ?? '',
      },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to reach Groq' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
