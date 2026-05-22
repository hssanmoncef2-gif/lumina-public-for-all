'use client'

// ============================================================
// LUMINA — useCompanion Hook
// Manages conversation history, streaming, mood context
// ============================================================

import { useState, useCallback, useRef, useEffect } from 'react'
import type { CompanionMessage, CompanionContext, MoodId } from '@/types'
import { useLuminaStore } from '@/store/useAppStore'

function generateId() {
  return Math.random().toString(36).slice(2, 10)
}

function getTimeOfDay(): CompanionContext['timeOfDay'] {
  const h = new Date().getHours()
  if (h >= 5 && h < 12)  return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 21) return 'evening'
  if (h >= 21 && h < 24) return 'night'
  return 'late-night'
}

export function useCompanion() {
  const currentMood  = useLuminaStore(s => s.currentMood)
  const user         = useLuminaStore(s => s.user)

  const [messages, setMessages]   = useState<CompanionMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError]         = useState<string | null>(null)
  const abortRef                  = useRef<AbortController | null>(null)

  // Build context from app state
  const buildContext = useCallback((): CompanionContext => ({
    currentMood:  currentMood ?? undefined,
    recentMoods:  currentMood ? [currentMood] : [],
    userName:     user?.displayName ?? undefined,
    favoriteMusic: user?.preferredMusicCategory ?? undefined,
    timeOfDay:    getTimeOfDay(),
  }), [currentMood, user])

  // Convert CompanionMessages to Anthropic format
  function toApiMessages(msgs: CompanionMessage[]) {
    return msgs.map(m => ({
      role:    m.role === 'companion' ? 'assistant' : 'user',
      content: m.content,
    }))
  }

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return

    setError(null)

    // Add user message
    const userMsg: CompanionMessage = {
      id:        generateId(),
      role:      'user',
      content:   text.trim(),
      timestamp: new Date(),
      mood:      currentMood ?? undefined,
    }

    const updatedMsgs = [...messages, userMsg]
    setMessages(updatedMsgs)

    // Placeholder companion message for streaming
    const companionId = generateId()
    const companionMsg: CompanionMessage = {
      id:        companionId,
      role:      'companion',
      content:   '',
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, companionMsg])
    setIsStreaming(true)

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/companion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: toApiMessages(updatedMsgs),
          context:  buildContext(),
        }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(err.error ?? 'Request failed')
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let   accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        // Update the streaming message live
        setMessages(prev =>
          prev.map(m => m.id === companionId ? { ...m, content: accumulated } : m)
        )
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return
      setError('Lumina couldn\'t reach you just now. Try again in a moment.')
      // Remove the empty placeholder on error
      setMessages(prev => prev.filter(m => m.id !== companionId))
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }, [messages, isStreaming, currentMood, buildContext])

  const clearConversation = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
  }, [])

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  // Clean up on unmount
  useEffect(() => () => abortRef.current?.abort(), [])

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearConversation,
    stopStreaming,
    context: buildContext(),
  }
}
