'use client'

// ============================================================
// LUMINA — Companion Page (/companion)
// Dreamy AI chat interface with mood context, streaming
// ============================================================

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AtmosphericBackground from '@/components/layout/AtmosphericBackground'
import FloatingParticles from '@/components/ui/FloatingParticles'
import BottomNav from '@/components/ui/BottomNav'
import MessageBubble from '@/components/companion/MessageBubble'
import SuggestedPrompts from '@/components/companion/SuggestedPrompts'
import { useCompanion } from '@/hooks/useCompanion'
import { useLuminaStore } from '@/store/useAppStore'
import { MOOD_DATA } from '@/lib/mood/moodData'

const MOOD_LABEL: Record<string, string> = {
  calm:    'calm 🌊',
  drifting:'drifting ✦',
  soft:    'soft 🌸',
  alive:   'alive ⚡',
  heavy:   'heavy 🌫',
  anxious: 'anxious 🌀',
  joyful:  'joyful ☀️',
  healing: 'healing 🌱',
}

export default function CompanionPage() {
  const currentMood = useLuminaStore(s => s.currentMood)
  const user        = useLuminaStore(s => s.user)
  const mood        = currentMood ? MOOD_DATA[currentMood] : null

  const { messages, isStreaming, error, sendMessage, clearConversation } = useCompanion()

  const [inputText, setInputText]     = useState('')
  const [showClear, setShowClear]     = useState(false)
  const messagesEndRef                = useRef<HTMLDivElement>(null)
  const inputRef                      = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const text = inputText.trim()
    if (!text || isStreaming) return
    sendMessage(text)
    setInputText('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handlePromptSelect(prompt: string) {
    sendMessage(prompt)
  }

  const hasMessages = messages.length > 0
  const lastCompanionMsg = [...messages].reverse().find(m => m.role === 'companion')

  return (
    <main className="relative min-h-dvh overflow-hidden bg-lumina-void flex flex-col">
      <AtmosphericBackground mood={currentMood} />
      <FloatingParticles mood={currentMood} count={8} />

      {/* Header */}
      <div
        className="relative z-20 flex items-center justify-between px-5 pt-safe-top"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
      >
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <motion.span
              className="text-[16px]"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              ✦
            </motion.span>
            <h1
              className="text-[17px] font-medium"
              style={{ fontFamily: 'var(--font-sora)', color: 'rgba(255,255,255,0.88)' }}
            >
              Lumina
            </h1>
          </div>

          {/* Mood context pill */}
          {currentMood ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px]"
              style={{ fontFamily: 'var(--font-sora)', color: 'rgba(255,255,255,0.3)' }}
            >
              Talking with Lumina · feeling {MOOD_LABEL[currentMood] ?? currentMood}
            </motion.p>
          ) : (
            <p
              className="text-[10px]"
              style={{ fontFamily: 'var(--font-sora)', color: 'rgba(255,255,255,0.25)' }}
            >
              Your gentle companion
            </p>
          )}
        </div>

        {/* Clear button */}
        {hasMessages && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowClear(true)}
            className="text-[11px] px-3 py-1.5 rounded-xl"
            style={{
              fontFamily: 'var(--font-sora)',
              color:      'rgba(255,255,255,0.2)',
              border:     '0.5px solid rgba(255,255,255,0.08)',
            }}
          >
            clear
          </motion.button>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.05)', margin: '12px 20px 0' }} />

      {/* Messages area */}
      <div
        className="relative z-10 flex-1 overflow-y-auto px-5 py-6"
        style={{ paddingBottom: 140 }}
      >
        <AnimatePresence>
          {!hasMessages && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center justify-center min-h-[40vh] text-center gap-4 pt-8"
            >
              {/* Breathing orb */}
              <motion.div
                className="relative w-20 h-20 rounded-full"
                animate={{
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    '0 0 30px rgba(139,92,246,0.2)',
                    '0 0 50px rgba(139,92,246,0.35)',
                    '0 0 30px rgba(139,92,246,0.2)',
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{ background: 'radial-gradient(circle at 40% 40%, rgba(196,181,253,0.3), rgba(139,92,246,0.15))' }}
              >
                <div
                  className="absolute inset-0 rounded-full"
                  style={{ background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), transparent 60%)' }}
                />
              </motion.div>

              <div className="space-y-2">
                <p
                  className="text-[16px] font-medium"
                  style={{ fontFamily: 'var(--font-sora)', color: 'rgba(255,255,255,0.75)' }}
                >
                  {user?.displayName ? `Hi, ${user.displayName}.` : 'I\'m here.'}
                </p>
                <p
                  className="text-[13px] leading-relaxed max-w-[240px] mx-auto"
                  style={{ fontFamily: 'var(--font-nunito)', fontWeight: 300, color: 'rgba(255,255,255,0.38)', fontStyle: 'italic' }}
                >
                  This is a gentle space. Say whatever is on your heart.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message list */}
        <div className="flex flex-col gap-5">
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'companion'}
            />
          ))}
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-[11px] mt-4"
              style={{ color: 'rgba(252,165,165,0.45)', fontFamily: 'var(--font-nunito)', fontStyle: 'italic' }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom input area — fixed above BottomNav */}
      <div
        className="fixed left-0 right-0 z-30"
        style={{ bottom: 64 }}
      >
        {/* Suggested prompts (only when no messages yet) */}
        <AnimatePresence>
          {!hasMessages && !isStreaming && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mb-2"
            >
              <SuggestedPrompts
                mood={currentMood}
                onSelect={handlePromptSelect}
                disabled={isStreaming}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input row */}
        <div
          className="mx-4 mb-2 rounded-2xl flex items-end gap-2 px-4 py-3"
          style={{
            background:    'rgba(14,10,30,0.92)',
            border:        '0.5px solid rgba(255,255,255,0.1)',
            backdropFilter:'blur(20px)',
          }}
        >
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say what's on your mind..."
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-transparent resize-none outline-none leading-relaxed"
            style={{
              fontFamily:  'var(--font-nunito)',
              fontSize:    '14px',
              fontWeight:  300,
              color:       'rgba(255,255,255,0.75)',
              maxHeight:   '120px',
              overflowY:   'auto',
              caretColor:  'rgba(196,181,253,0.8)',
            }}
          />

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleSend}
            disabled={!inputText.trim() || isStreaming}
            className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-opacity"
            style={{
              background: inputText.trim() && !isStreaming
                ? 'rgba(139,92,246,0.4)'
                : 'rgba(139,92,246,0.12)',
              border:    '0.5px solid rgba(139,92,246,0.3)',
              opacity:   !inputText.trim() || isStreaming ? 0.45 : 1,
            }}
          >
            <span
              className="text-[12px]"
              style={{ color: 'rgba(196,181,253,0.9)' }}
            >
              ↑
            </span>
          </motion.button>
        </div>
      </div>

      {/* Clear confirm overlay */}
      <AnimatePresence>
        {showClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowClear(false)}
          >
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full rounded-t-3xl p-6"
              style={{ background: 'rgba(14,10,30,0.98)', border: '0.5px solid rgba(255,255,255,0.09)' }}
              onClick={e => e.stopPropagation()}
            >
              <p
                className="text-center text-[15px] font-medium mb-1"
                style={{ color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-sora)' }}
              >
                Clear this conversation?
              </p>
              <p
                className="text-center text-[12px] mb-6"
                style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-nunito)' }}
              >
                This moment will float away quietly.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => { clearConversation(); setShowClear(false) }}
                  className="w-full py-3.5 rounded-2xl text-[13px] font-medium"
                  style={{
                    background: 'rgba(139,92,246,0.15)',
                    border:     '0.5px solid rgba(139,92,246,0.3)',
                    color:      'rgba(196,181,253,0.9)',
                    fontFamily: 'var(--font-sora)',
                  }}
                >
                  Yes, clear it
                </button>
                <button
                  onClick={() => setShowClear(false)}
                  className="w-full py-3.5 rounded-2xl text-[13px]"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    color:      'rgba(255,255,255,0.4)',
                    fontFamily: 'var(--font-sora)',
                  }}
                >
                  Keep talking
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </main>
  )
}
