'use client'

// ============================================================
// LUMINA — MoodQuiz: Multi-step quiz container
// ============================================================

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MoodQuizQuestion from './MoodQuizQuestion'
import MoodResult from './MoodResult'
import { QUIZ_QUESTIONS } from '@/lib/mood/moodData'
import { calculateMoodResult, saveMoodEntry, type QuizAnswers } from '@/lib/mood/moodEngine'
import type { QuizResult, MoodId } from '@/types'

interface Props {
  userId?: string
  onComplete: (result: QuizResult) => void
}

const QUESTION_IDS = ['q1', 'q2', 'q3', 'q4', 'q5'] as const
type QuestionId = typeof QUESTION_IDS[number]

export default function MoodQuiz({ userId, onComplete }: Props) {
  const [step, setStep]             = useState(0)   // 0–4 questions, 5 = result
  const [answers, setAnswers]       = useState<QuizAnswers>({})
  const [currentAnswer, setCurrentAnswer] = useState<string | number | undefined>(undefined)
  const [result, setResult]         = useState<QuizResult | null>(null)
  const [direction, setDirection]   = useState(1)    // 1=forward, -1=back
  const [isSaving, setIsSaving]     = useState(false)

  const question = QUIZ_QUESTIONS[step]
  const progress = step / QUIZ_QUESTIONS.length

  const canAdvance = currentAnswer !== undefined ||
    (question?.type === 'slider') // slider always has a default

  const handleAnswer = useCallback((value: string | number) => {
    setCurrentAnswer(value)
  }, [])

  const handleNext = useCallback(async () => {
    if (!question) return

    // Merge answer
    const qId = QUESTION_IDS[step]
    const newAnswers: QuizAnswers = {
      ...answers,
      [qId]: currentAnswer ?? (question.type === 'slider' ? 50 : undefined),
    }
    setAnswers(newAnswers)

    if (step < QUIZ_QUESTIONS.length - 1) {
      setDirection(1)
      setStep(s => s + 1)
      setCurrentAnswer(newAnswers[QUESTION_IDS[step + 1] as QuestionId])
    } else {
      // Final step → calculate result
      const quizResult = calculateMoodResult(newAnswers)
      setResult(quizResult)

      // Save to Supabase if authenticated
      if (userId) {
        setIsSaving(true)
        try {
          await saveMoodEntry({
            userId,
            moodId:    quizResult.primaryMood,
            intensity: quizResult.energyLevel,
          })
        } catch (e) {
          // silent — don't block the UX
        } finally {
          setIsSaving(false)
        }
      }

      setDirection(1)
      setStep(QUIZ_QUESTIONS.length) // show result
    }
  }, [step, question, answers, currentAnswer, userId])

  const handleBack = useCallback(() => {
    if (step === 0) return
    setDirection(-1)
    setStep(s => s - 1)
    const prevId = QUESTION_IDS[step - 1] as QuestionId
    setCurrentAnswer(answers[prevId])
  }, [step, answers])

  const handleRetake = useCallback(() => {
    setStep(0)
    setAnswers({})
    setCurrentAnswer(undefined)
    setResult(null)
    setDirection(-1)
  }, [])

  const handleContinue = useCallback(() => {
    if (result) onComplete(result)
  }, [result, onComplete])

  // Slide variants
  const variants = {
    enter:  (dir: number) => ({ x: dir * 48, opacity: 0 }),
    center:                  { x: 0,          opacity: 1 },
    exit:   (dir: number) => ({ x: dir * -48, opacity: 0 }),
  }

  return (
    <div className="flex flex-col items-center w-full min-h-full px-5 pb-8">

      {/* Progress bar */}
      {step < QUIZ_QUESTIONS.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-sm mb-8 mt-2"
        >
          <div className="flex gap-1.5">
            {QUIZ_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className="h-0.5 flex-1 rounded-full overflow-hidden bg-white/10"
              >
                <motion.div
                  className="h-full bg-white/50 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: i < step ? 1 : i === step ? 0.5 : 0 }}
                  style={{ transformOrigin: 'left' }}
                  transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                />
              </div>
            ))}
          </div>
          <p className="text-right text-[11px] text-white/25 mt-1.5">
            {step + 1} of {QUIZ_QUESTIONS.length}
          </p>
        </motion.div>
      )}

      {/* Question / Result area */}
      <div className="relative w-full flex flex-col items-center flex-1">
        <AnimatePresence mode="wait" custom={direction}>
          {step < QUIZ_QUESTIONS.length ? (
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full flex flex-col items-center gap-7"
            >
              {/* Question text */}
              <div className="text-center max-w-xs space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-xl font-light text-white/90 leading-snug"
                >
                  {question.text}
                </motion.h2>
                {question.subtext && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.12 }}
                    className="text-sm text-white/35 font-light"
                  >
                    {question.subtext}
                  </motion.p>
                )}
              </div>

              {/* Question input */}
              <MoodQuizQuestion
                question={question}
                answer={currentAnswer}
                onChange={handleAnswer}
              />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              className="w-full"
            >
              {result && (
                <MoodResult
                  result={result}
                  onContinue={handleContinue}
                  onRetake={handleRetake}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < QUIZ_QUESTIONS.length && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-4 w-full max-w-sm mt-8"
        >
          {/* Back */}
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="p-3 rounded-2xl border border-white/8 text-white/40
              disabled:opacity-0 disabled:pointer-events-none
              hover:border-white/18 hover:text-white/60 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="flex-1 py-3.5 rounded-2xl font-medium text-sm transition-all
              disabled:opacity-40 disabled:cursor-not-allowed
              enabled:hover:opacity-90 enabled:active:scale-[0.98]"
            style={{
              background: canAdvance
                ? 'linear-gradient(135deg, rgba(167,139,250,0.5), rgba(139,92,246,0.6))'
                : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {step === QUIZ_QUESTIONS.length - 1 ? 'See my mood →' : 'Continue'}
          </button>
        </motion.div>
      )}

      {/* Skip hint */}
      {step === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-[11px] text-white/20 mt-4"
        >
          No right or wrong answers — just be honest with yourself.
        </motion.p>
      )}
    </div>
  )
}
