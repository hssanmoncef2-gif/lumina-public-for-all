import { create } from 'zustand'
import type { MoodId, PlayerState, ComfortState, AmbientTheme, UserProfile } from '@/types'

// ---- Ambient theme defaults ----
const defaultAmbient: AmbientTheme = {
  mode: 'night-city',
  bgGradient: 'linear-gradient(135deg, #080612, #0e0a1f, #0d1535)',
  orbColors: ['rgba(180,100,220,0.18)', 'rgba(80,140,255,0.14)', 'rgba(255,140,180,0.10)'],
  particleColor: 'rgba(180,130,255,0.6)',
  glowColor: 'rgba(139,92,246,0.3)',
  overlayOpacity: 0.85,
}

const defaultPlayer: PlayerState = {
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  volume: 0.7,
  progress: 0,
  isCrossfading: false,
  visualizerData: [],
}

const defaultComfort: ComfortState = {
  isActive: false,
  brightness: 1,
  animationSpeed: 1,
  currentMessage: "You're safe here.",
  breathingPhase: 'inhale',
  breathingCount: 0,
}

// ---- Store interface ----
interface LuminaStore {
  // State
  user: UserProfile | null
  currentMood: MoodId | null
  ambient: AmbientTheme
  player: PlayerState
  comfort: ComfortState
  isLoading: boolean
  onboardingComplete: boolean

  // Actions
  setUser: (user: UserProfile | null) => void
  setMood: (mood: MoodId | null) => void
  setAmbient: (ambient: Partial<AmbientTheme>) => void
  setPlayer: (player: Partial<PlayerState>) => void
  setComfort: (comfort: Partial<ComfortState>) => void
  activateComfortMode: () => void
  deactivateComfortMode: () => void
  setLoading: (loading: boolean) => void
  setOnboardingComplete: (complete: boolean) => void
}

// ---- Store ----
export const useLuminaStore = create<LuminaStore>((set) => ({
  user: null,
  currentMood: null,
  ambient: defaultAmbient,
  player: defaultPlayer,
  comfort: defaultComfort,
  isLoading: false,
  onboardingComplete: false,

  setUser: (user) => set({ user }),

  setMood: (mood) =>
    set((state) => ({
      currentMood: mood,
      // Auto-update comfort speed based on mood
      comfort: {
        ...state.comfort,
        animationSpeed: mood === 'heavy' || mood === 'calm' ? 0.6 : 1,
      },
    })),

  setAmbient: (ambient) =>
    set((state) => ({ ambient: { ...state.ambient, ...ambient } })),

  setPlayer: (player) =>
    set((state) => ({ player: { ...state.player, ...player } })),

  setComfort: (comfort) =>
    set((state) => ({ comfort: { ...state.comfort, ...comfort } })),

  activateComfortMode: () =>
    set({
      comfort: {
        isActive: true,
        brightness: 0.65,
        animationSpeed: 0.4,
        currentMessage: "You're safe here. Take a breath.",
        breathingPhase: 'inhale',
        breathingCount: 0,
      },
    }),

  deactivateComfortMode: () =>
    set({
      comfort: {
        ...defaultComfort,
        isActive: false,
      },
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setOnboardingComplete: (onboardingComplete) => set({ onboardingComplete }),
}))

// ---- Selectors (memoized picks) ----
export const selectMood    = (s: LuminaStore) => s.currentMood
export const selectPlayer  = (s: LuminaStore) => s.player
export const selectComfort = (s: LuminaStore) => s.comfort
export const selectUser    = (s: LuminaStore) => s.user
export const selectAmbient = (s: LuminaStore) => s.ambient
