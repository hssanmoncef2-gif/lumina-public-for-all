'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useLuminaStore } from '@/store/useAppStore'
import type { Track } from '@/types'

// ============================================================
// usePlayer — Audio element management hook
// Fixed: stable refs prevent infinite re-render loops
// ============================================================

export function usePlayer() {
  const player    = useLuminaStore(s => s.player)
  const setPlayer = useLuminaStore(s => s.setPlayer)

  const audioRef             = useRef<HTMLAudioElement | null>(null)
  const progressIntervalRef  = useRef<NodeJS.Timeout | null>(null)
  const isCrossfadingRef     = useRef(false)
  const playerRef            = useRef(player)

  // Keep playerRef in sync so interval callbacks always see fresh state
  useEffect(() => { playerRef.current = player }, [player])

  // Init audio element once
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = playerRef.current.volume
    }
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  // Sync volume changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = player.volume
  }, [player.volume])

  // ---- Crossfade (uses refs, no stale closure) ----
  const playNextRef = useRef<() => void>(() => {})

  const triggerCrossfade = useCallback(() => {
    if (isCrossfadingRef.current) return
    isCrossfadingRef.current = true
    setPlayer({ isCrossfading: true })

    const target = playerRef.current.volume
    const steps  = 20
    const fadeStep = target / steps
    let vol = target

    const fadeOut = setInterval(() => {
      vol = Math.max(0, vol - fadeStep)
      if (audioRef.current) audioRef.current.volume = vol
      if (vol <= 0) {
        clearInterval(fadeOut)
        playNextRef.current()
        if (audioRef.current) audioRef.current.volume = 0
        let fadeVol = 0
        const fadeIn = setInterval(() => {
          fadeVol = Math.min(target, fadeVol + fadeStep)
          if (audioRef.current) audioRef.current.volume = fadeVol
          if (fadeVol >= target) {
            clearInterval(fadeIn)
            isCrossfadingRef.current = false
            setPlayer({ isCrossfading: false })
          }
        }, 100)
      }
    }, 100)
  }, [setPlayer])

  // Start/stop progress tracking — only depends on isPlaying + currentTrack id
  useEffect(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)

    if (player.isPlaying && player.currentTrack) {
      progressIntervalRef.current = setInterval(() => {
        const audio = audioRef.current
        if (audio && !isNaN(audio.duration) && audio.duration > 0) {
          const progress = audio.currentTime / audio.duration
          setPlayer({ progress: Math.min(progress, 1) })
          if (progress >= 0.95 && !isCrossfadingRef.current) {
            triggerCrossfade()
          }
        } else {
          // No real audio src — simulate progress for demo tracks
          setPlayer({ progress: Math.min((playerRef.current.progress ?? 0) + 0.001, 1) })
        }
      }, 200)
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player.isPlaying, player.currentTrack?.id, setPlayer, triggerCrossfade])

  // ---- Actions ----

  const play = useCallback((track?: Track, playlist?: Track[]) => {
    if (track) {
      if (audioRef.current) {
        audioRef.current.pause()
        if (track.src) {
          audioRef.current.src = track.src
          audioRef.current.play().catch(() => {})
        }
      }
      setPlayer({
        currentTrack: track,
        playlist: playlist ?? playerRef.current.playlist,
        isPlaying: true,
        progress: 0,
      })
    } else if (playerRef.current.currentTrack) {
      audioRef.current?.play().catch(() => {})
      setPlayer({ isPlaying: true })
    }
  }, [setPlayer])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setPlayer({ isPlaying: false })
  }, [setPlayer])

  const togglePlay = useCallback(() => {
    if (playerRef.current.isPlaying) pause()
    else play()
  }, [play, pause])

  const seek = useCallback((progress: number) => {
    if (audioRef.current && !isNaN(audioRef.current.duration)) {
      audioRef.current.currentTime = audioRef.current.duration * progress
    }
    setPlayer({ progress })
  }, [setPlayer])

  const setVolume = useCallback((volume: number) => {
    const v = Math.max(0, Math.min(1, volume))
    if (audioRef.current) audioRef.current.volume = v
    setPlayer({ volume: v })
  }, [setPlayer])

  const playNext = useCallback(() => {
    const { playlist, currentTrack } = playerRef.current
    if (!playlist.length) return
    const idx  = currentTrack ? playlist.findIndex(t => t.id === currentTrack.id) : -1
    const next = playlist[(idx + 1) % playlist.length]
    play(next, playlist)
  }, [play])

  const playPrev = useCallback(() => {
    const { playlist, currentTrack } = playerRef.current
    if (!playlist.length) return
    const idx  = currentTrack ? playlist.findIndex(t => t.id === currentTrack.id) : 0
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length]
    play(prev, playlist)
  }, [play])

  const playPlaylist = useCallback((pl: { tracks: Track[] }, startIndex = 0) => {
    play(pl.tracks[startIndex], pl.tracks)
  }, [play])

  // Keep playNextRef in sync so triggerCrossfade always calls the latest version
  useEffect(() => { playNextRef.current = playNext }, [playNext])

  return {
    player,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    playNext,
    playPrev,
    playPlaylist,
  }
}