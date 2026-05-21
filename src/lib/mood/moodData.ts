// ============================================================
// LUMINA — Mood Data: Question Bank + Weight Matrix
// ============================================================

import type { MoodId, QuizQuestion, QuizOption, AmbientMode, MusicCategory } from '@/types'

// ---- Questions ----

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'How does your heart feel right now?',
    subtext: 'Trust the first image that comes to you.',
    type: 'emoji-choice',
    options: [
      {
        id: 'q1_ocean',
        label: 'Like the ocean',
        emoji: '🌊',
        gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        moodWeights: { calm: 3, drifting: 2, soft: 1 },
      },
      {
        id: 'q1_forest',
        label: 'Soft and still',
        emoji: '🌿',
        gradient: 'linear-gradient(135deg, #34d399, #059669)',
        moodWeights: { calm: 2, healing: 3, soft: 2 },
      },
      {
        id: 'q1_rain',
        label: 'Heavy with rain',
        emoji: '🌧',
        gradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
        moodWeights: { heavy: 3, drifting: 2, anxious: 1 },
      },
      {
        id: 'q1_sun',
        label: 'Bright and open',
        emoji: '☀️',
        gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        moodWeights: { joyful: 3, alive: 3, calm: 1 },
      },
      {
        id: 'q1_moon',
        label: 'Dark and quiet',
        emoji: '🌑',
        gradient: 'linear-gradient(135deg, #1e1b4b, #312e81)',
        moodWeights: { heavy: 2, drifting: 3, anxious: 2 },
      },
    ],
  },
  {
    id: 'q2',
    text: 'Do you want comfort or energy right now?',
    subtext: 'Slide toward what your body is asking for.',
    type: 'slider',
  },
  {
    id: 'q3',
    text: 'Would rain help tonight?',
    subtext: 'Rain on a window. The smell of petrichor. Yes or no.',
    type: 'visual-choice',
    options: [
      {
        id: 'q3_yes',
        label: 'Yes, give me rain',
        emoji: '🌧',
        gradient: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(67,56,202,0.6))',
        moodWeights: { calm: 2, heavy: 1, drifting: 2, soft: 1 },
      },
      {
        id: 'q3_no',
        label: 'Something warmer',
        emoji: '🕯',
        gradient: 'linear-gradient(135deg, rgba(251,146,60,0.35), rgba(245,158,11,0.45))',
        moodWeights: { healing: 2, soft: 2, joyful: 1, calm: 1 },
      },
    ],
  },
  {
    id: 'q4',
    text: 'Do you want softness or intensity?',
    subtext: 'There is no wrong answer.',
    type: 'visual-choice',
    options: [
      {
        id: 'q4_soft',
        label: 'Softness',
        emoji: '🌸',
        gradient: 'linear-gradient(135deg, rgba(249,168,212,0.4), rgba(196,181,253,0.45))',
        moodWeights: { soft: 3, calm: 2, healing: 2 },
      },
      {
        id: 'q4_intense',
        label: 'Intensity',
        emoji: '🔥',
        gradient: 'linear-gradient(135deg, rgba(239,68,68,0.35), rgba(245,158,11,0.4))',
        moodWeights: { alive: 3, anxious: 1, joyful: 2 },
      },
    ],
  },
  {
    id: 'q5',
    text: 'Do you want to feel understood or distracted?',
    subtext: 'Both are valid. Both are care.',
    type: 'visual-choice',
    options: [
      {
        id: 'q5_understood',
        label: 'Understood',
        emoji: '🫂',
        gradient: 'linear-gradient(135deg, rgba(139,92,246,0.38), rgba(109,40,217,0.45))',
        moodWeights: { healing: 3, heavy: 1, soft: 2, calm: 1 },
      },
      {
        id: 'q5_distracted',
        label: 'Distracted',
        emoji: '✨',
        gradient: 'linear-gradient(135deg, rgba(56,189,248,0.35), rgba(99,102,241,0.4))',
        moodWeights: { joyful: 2, alive: 2, drifting: 1, anxious: -1 },
      },
    ],
  },
]

// ---- Mood definitions (full data) ----

export const MOOD_DATA: Record<MoodId, {
  label: string
  emoji: string
  description: string
  gradient: string
  accentColor: string
  textColor: string
  musicCategory: MusicCategory
  ambientMode: AmbientMode
  quoteCategory: string[]
  particleIntensity: 'low' | 'medium' | 'high'
  animationSpeed: 'slow' | 'normal' | 'fast'
  resultMessage: string
  resultSub: string
}> = {
  calm: {
    label: 'Calm',
    emoji: '🌊',
    description: 'A quiet sea. Steady breath.',
    gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0c4a6e 100%)',
    accentColor: '#38bdf8',
    textColor: '#bae6fd',
    musicCategory: 'rainy-tokyo',
    ambientMode: 'ocean-twilight',
    quoteCategory: ['rest', 'comfort'],
    particleIntensity: 'low',
    animationSpeed: 'slow',
    resultMessage: "You're in the calm.",
    resultSub: "Let this stillness hold you. You don't need to do anything right now.",
  },
  drifting: {
    label: 'Drifting',
    emoji: '🌙',
    description: 'Floating without direction. Somewhere between.',
    gradient: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 50%, #0f0b2a 100%)',
    accentColor: '#818cf8',
    textColor: '#c7d2fe',
    musicCategory: 'dreamy-nights',
    ambientMode: 'deep-night',
    quoteCategory: ['healing', 'self-love'],
    particleIntensity: 'medium',
    animationSpeed: 'slow',
    resultMessage: "You're drifting — and that's okay.",
    resultSub: "Not all nights need a destination. Let the music carry you.",
  },
  soft: {
    label: 'Soft',
    emoji: '🌸',
    description: 'Tender and open. Petals in spring.',
    gradient: 'linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 40%, #c4b5fd 100%)',
    accentColor: '#ec4899',
    textColor: '#fce7f3',
    musicCategory: 'comfort',
    ambientMode: 'foggy-morning',
    quoteCategory: ['self-love', 'comfort'],
    particleIntensity: 'low',
    animationSpeed: 'slow',
    resultMessage: "You're feeling soft today.",
    resultSub: "That tenderness is your strength. Be gentle with yourself.",
  },
  alive: {
    label: 'Alive',
    emoji: '⚡',
    description: 'Electric. Present. Something is awake in you.',
    gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 50%, #064e3b 100%)',
    accentColor: '#34d399',
    textColor: '#d1fae5',
    musicCategory: 'motivation',
    ambientMode: 'golden-hour',
    quoteCategory: ['motivation', 'confidence'],
    particleIntensity: 'high',
    animationSpeed: 'fast',
    resultMessage: "You're alive tonight.",
    resultSub: "That energy is a gift. Channel it into something that matters to you.",
  },
  heavy: {
    label: 'Heavy',
    emoji: '🌧',
    description: 'Weighted. The kind of tired that lives in your chest.',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #3730a3 50%, #1e1b4b 100%)',
    accentColor: '#6366f1',
    textColor: '#e0e7ff',
    musicCategory: 'emotional-release',
    ambientMode: 'rainy-night',
    quoteCategory: ['healing', 'reassurance'],
    particleIntensity: 'low',
    animationSpeed: 'slow',
    resultMessage: "It's okay to be heavy.",
    resultSub: "You don't have to be okay right now. Just be here. That's enough.",
  },
  anxious: {
    label: 'Anxious',
    emoji: '🌀',
    description: 'Spinning thoughts. Heart racing ahead of you.',
    gradient: 'linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #431407 100%)',
    accentColor: '#fb923c',
    textColor: '#fed7aa',
    musicCategory: 'comfort',
    ambientMode: 'dusk',
    quoteCategory: ['reassurance', 'rest'],
    particleIntensity: 'medium',
    animationSpeed: 'normal',
    resultMessage: "I see you. You're anxious.",
    resultSub: "Your nervous system is doing its job. Let's slow things down together.",
  },
  joyful: {
    label: 'Joyful',
    emoji: '✨',
    description: 'Light and expansive. Things feel possible.',
    gradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #d97706 100%)',
    accentColor: '#fbbf24',
    textColor: '#fef3c7',
    musicCategory: 'lo-fi-morning',
    ambientMode: 'golden-hour',
    quoteCategory: ['motivation', 'emotional-growth'],
    particleIntensity: 'high',
    animationSpeed: 'fast',
    resultMessage: "You're in joy.",
    resultSub: "This feeling is real and it's yours. Stay in it as long as you like.",
  },
  healing: {
    label: 'Healing',
    emoji: '🌱',
    description: 'Something is mending. Slowly, softly, surely.',
    gradient: 'linear-gradient(135deg, #86efac 0%, #4ade80 40%, #166534 100%)',
    accentColor: '#86efac',
    textColor: '#dcfce7',
    musicCategory: 'healing',
    ambientMode: 'foggy-morning',
    quoteCategory: ['healing', 'self-love', 'emotional-growth'],
    particleIntensity: 'low',
    animationSpeed: 'slow',
    resultMessage: "You're healing.",
    resultSub: "Every small step is real. You're doing it — even when it doesn't feel like it.",
  },
}

// ---- Comfort-need thresholds ----
export const COMFORT_MOODS: MoodId[] = ['heavy', 'anxious', 'drifting']
