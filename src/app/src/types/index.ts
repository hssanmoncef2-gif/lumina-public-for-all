// ============================================================
// LUMINA — Core Type Definitions
// ============================================================

// ---- Mood System ----

export type MoodId =
  | 'calm'
  | 'drifting'
  | 'soft'
  | 'alive'
  | 'heavy'
  | 'anxious'
  | 'joyful'
  | 'healing'

export interface Mood {
  id: MoodId
  label: string
  emoji: string
  description: string
  // Theming
  gradient: string
  accentColor: string
  textColor: string
  // System adaptations
  musicCategory: MusicCategory
  ambientMode: AmbientMode
  quoteCategory: QuoteCategory[]
  particleIntensity: 'low' | 'medium' | 'high'
  animationSpeed: 'slow' | 'normal' | 'fast'
}

export interface MoodEntry {
  id: string
  userId: string
  moodId: MoodId
  intensity: 1 | 2 | 3 | 4 | 5  // 1 = barely, 5 = intensely
  notes?: string
  createdAt: Date
}

// ---- Music System ----

export type MusicCategory =
  | 'confidence'
  | 'comfort'
  | 'dreamy-nights'
  | 'healing'
  | 'motivation'
  | 'emotional-release'
  | 'ocean-calm'
  | 'rainy-tokyo'
  | 'lo-fi-morning'
  | 'celestial-ambient'

export interface Track {
  id: string
  title: string
  artist: string
  category: MusicCategory
  duration: number       // seconds
  src: string            // path under /public/sounds/
  waveformData?: number[] // 0-1 normalized, for visualizer
  bpm?: number
  mood: MoodId[]         // moods this track suits
}

export interface Playlist {
  id: string
  category: MusicCategory
  title: string
  description: string
  emoji: string
  gradient: string
  tracks: Track[]
}

export interface PlayerState {
  currentTrack: Track | null
  playlist: Track[]
  isPlaying: boolean
  volume: number          // 0-1
  progress: number        // 0-1
  isCrossfading: boolean
  visualizerData: number[]
}

// ---- Quote System ----

export type QuoteCategory =
  | 'self-love'
  | 'healing'
  | 'reassurance'
  | 'motivation'
  | 'emotional-growth'
  | 'confidence'
  | 'rest'
  | 'discipline'
  | 'creativity'
  | 'comfort'

export interface Quote {
  id: string
  text: string
  author?: string
  subtext?: string        // small poetic attribution
  categories: QuoteCategory[]
  moods: MoodId[]
  tone: 'gentle' | 'warm' | 'poetic' | 'grounding' | 'uplifting'
}

export interface QuoteDisplay {
  style: 'floating' | 'notification' | 'fullscreen' | 'card'
  quote: Quote
  autoAdvance?: boolean
  interval?: number       // ms
}

// ---- Journal System ----

export interface JournalEntry {
  id: string
  userId: string
  title?: string
  content: string         // rich text / markdown
  mood?: MoodId
  moodIntensity?: number
  tags: string[]
  isFavorite: boolean
  aiSummary?: string      // AI-generated reflection
  createdAt: Date
  updatedAt: Date
}

// ---- Letters System ----

export type LetterTrigger =
  | 'overwhelmed'
  | 'tired'
  | 'overthinking'
  | 'lonely'
  | 'lost'
  | 'anxious'
  | 'comparing-yourself'
  | 'proud-moment'
  | 'cant-sleep'
  | 'needing-courage'

export interface Letter {
  id: string
  trigger: LetterTrigger
  title: string           // "open when you feel overwhelmed"
  preview: string         // blurred teaser text
  content: string         // full letter content
  emoji: string
  gradient: string
  isRead: boolean
  readAt?: Date
}

// ---- Ambient System ----

export type AmbientMode =
  | 'clear-day'
  | 'golden-hour'
  | 'dusk'
  | 'night-city'
  | 'rainy-night'
  | 'deep-night'
  | 'ocean-twilight'
  | 'foggy-morning'

export interface AmbientTheme {
  mode: AmbientMode
  bgGradient: string
  orbColors: string[]
  particleColor: string
  glowColor: string
  overlayOpacity: number
}

// ---- User / Auth ----

export interface UserProfile {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  // Preferences
  preferredMusicCategory?: MusicCategory
  defaultAmbientMode?: AmbientMode
  comfortModeEnabled: boolean
  notificationsEnabled: boolean
  // Stats
  streakDays: number
  totalJournalEntries: number
  favoriteQuotes: string[]
  createdAt: Date
}

// ---- AI Companion ----

export interface CompanionMessage {
  id: string
  role: 'user' | 'companion'
  content: string
  timestamp: Date
  mood?: MoodId
  attachedTrack?: Track
  attachedQuote?: Quote
}

export interface CompanionContext {
  currentMood?: MoodId
  recentMoods: MoodId[]
  recentJournalSummary?: string
  favoriteMusic?: MusicCategory
  userName?: string
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night' | 'late-night'
}

// ---- Comfort Mode ----

export interface ComfortState {
  isActive: boolean
  brightness: number    // 0-1
  animationSpeed: number // 0-1, lower = slower
  currentMessage: string
  breathingPhase: 'inhale' | 'hold' | 'exhale' | 'pause'
  breathingCount: number
}

// ---- App State ----

export interface AppState {
  user: UserProfile | null
  currentMood: MoodId | null
  ambient: AmbientTheme
  player: PlayerState
  comfort: ComfortState
  isLoading: boolean
  onboardingComplete: boolean
}

// ---- Quiz ----

export interface QuizQuestion {
  id: string
  text: string
  subtext?: string
  type: 'emoji-choice' | 'slider' | 'open-text' | 'visual-choice'
  options?: QuizOption[]
}

export interface QuizOption {
  id: string
  label: string
  emoji?: string
  gradient?: string
  // Which moods this option scores toward
  moodWeights: Partial<Record<MoodId, number>>
}

export interface QuizResult {
  primaryMood: MoodId
  secondaryMood?: MoodId
  energyLevel: 1 | 2 | 3 | 4 | 5
  needsComfort: boolean
  recommendedPlaylist: MusicCategory
  recommendedAmbient: AmbientMode
}
