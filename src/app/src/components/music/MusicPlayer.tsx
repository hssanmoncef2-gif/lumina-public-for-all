'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '@/hooks/usePlayer'
import WaveformVisualizer from './WaveformVisualizer'
import { formatDuration, PLAYLISTS } from '@/lib/music/playlistData'
import type { Track } from '@/types'

// ============================================================
// MusicPlayer — Full-screen player with dreamy album art
// Pulsing gradient orb, waveform, progress, volume controls
// ============================================================

interface Props {
  onClose?: () => void
}

export default function MusicPlayer({ onClose }: Props) {
  const { player, togglePlay, seek, setVolume, playNext, playPrev } = usePlayer()
  const { currentTrack, isPlaying, progress, volume, playlist } = player
  const [showVolume, setShowVolume] = useState(false)

  if (!currentTrack) return null

  // Get playlist info for this track's category
  const playlistMeta = PLAYLISTS.find(p => p.category === currentTrack.category)
  const trackGradient = playlistMeta?.gradient ?? 'linear-gradient(135deg, rgba(139,92,246,0.5), rgba(59,130,246,0.4))'

  const elapsed = Math.round(currentTrack.duration * progress)
  const remaining = currentTrack.duration - elapsed

  // Find current track index in playlist
  const currentIdx = playlist.findIndex(t => t.id === currentTrack.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed inset-0 z-[30] flex flex-col"
      style={{ background: '#080612' }}
    >
      {/* Dynamic dreamy background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={isPlaying ? {
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.55, 0.35],
          } : { scale: 1, opacity: 0.25 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute"
          style={{
            width: '80vw',
            height: '80vw',
            top: '5%',
            left: '10%',
            background: trackGradient,
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={isPlaying ? {
            scale: [1, 1.08, 0.95, 1],
            opacity: [0.15, 0.3, 0.15],
          } : { opacity: 0.1 }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute"
          style={{
            width: '50vw',
            height: '50vw',
            bottom: '30%',
            right: '5%',
            background: 'radial-gradient(circle, rgba(236,72,153,0.4), transparent)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '0.5px solid rgba(255,255,255,0.1)',
          }}
          aria-label="Close player"
        >
          <span className="text-sm text-white/60">↓</span>
        </motion.button>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">Now Playing</p>
          {playlistMeta && (
            <p className="text-[11px] text-white/50 mt-0.5">{playlistMeta.title}</p>
          )}
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowVolume(v => !v)}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{
            background: showVolume ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.07)',
            border: `0.5px solid ${showVolume ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
          }}
          aria-label="Volume"
        >
          <span className="text-sm">{volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔇'}</span>
        </motion.button>
      </div>

      {/* Volume slider */}
      <AnimatePresence>
        {showVolume && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="relative z-10 px-8 pb-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30">🔇</span>
              <div className="flex-1 relative h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ width: `${volume * 100}%`, background: 'linear-gradient(90deg, #a78bfa, #f9a8d4)' }}
                />
                <input
                  type="range"
                  min={0} max={1} step={0.01}
                  value={volume}
                  onChange={e => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  aria-label="Volume"
                />
              </div>
              <span className="text-xs text-white/30">🔊</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Album Art Orb — center piece */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-6">
        <div className="relative flex items-center justify-center">
          {/* Outer pulsing ring */}
          <motion.div
            animate={isPlaying ? {
              scale: [1, 1.12, 1],
              opacity: [0.15, 0.3, 0.15],
            } : { opacity: 0 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute rounded-full"
            style={{
              width: '72vw',
              height: '72vw',
              maxWidth: 290,
              maxHeight: 290,
              background: trackGradient,
              filter: 'blur(20px)',
            }}
          />

          {/* Inner art circle */}
          <motion.div
            animate={isPlaying ? {
              scale: [1, 1.04, 1],
              rotate: [0, 3, 0, -3, 0],
            } : { scale: 1, rotate: 0 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative rounded-full flex items-center justify-center"
            style={{
              width: '62vw',
              height: '62vw',
              maxWidth: 250,
              maxHeight: 250,
              background: trackGradient,
              border: '0.5px solid rgba(255,255,255,0.15)',
              boxShadow: isPlaying
                ? '0 0 60px rgba(139,92,246,0.4), 0 0 100px rgba(139,92,246,0.15)'
                : '0 0 30px rgba(139,92,246,0.2)',
            }}
          >
            <span className="text-6xl">{playlistMeta?.emoji ?? '🎵'}</span>

            {/* Inner glassy ring */}
            <div
              className="absolute inset-4 rounded-full"
              style={{ border: '0.5px solid rgba(255,255,255,0.08)' }}
            />
          </motion.div>
        </div>
      </div>

      {/* Track info */}
      <div className="relative z-10 px-6">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-xl font-semibold text-white/95 truncate leading-tight">
              {currentTrack.title}
            </h2>
            <p className="text-sm text-white/35 mt-0.5">
              {currentTrack.artist}
              {currentTrack.bpm && (
                <span className="ml-2 text-[10px] text-white/20">· {currentTrack.bpm} BPM</span>
              )}
            </p>
          </div>
        </div>

        {/* Waveform */}
        <div className="mt-3 mb-2">
          <WaveformVisualizer
            isPlaying={isPlaying}
            barCount={40}
            height={28}
            color="rgba(167,139,250,0.5)"
          />
        </div>

        {/* Progress slider */}
        <div className="relative">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #a78bfa, #60a5fa)',
                width: `${progress * 100}%`,
              }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <input
            type="range"
            min={0} max={1} step={0.001}
            value={progress}
            onChange={e => seek(parseFloat(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer h-1"
            aria-label="Seek"
          />
        </div>

        {/* Time labels */}
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-white/25">{formatDuration(elapsed)}</span>
          <span className="text-[10px] text-white/25">−{formatDuration(remaining)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-10 px-6 py-5">
        <div className="flex items-center justify-center gap-5">
          {/* Prev */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={playPrev}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.08)',
            }}
            aria-label="Previous track"
          >
            <span className="text-lg text-white/55">⏮</span>
          </motion.button>

          {/* Play/Pause — main button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={togglePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              boxShadow: isPlaying
                ? '0 0 40px rgba(139,92,246,0.6), 0 8px 24px rgba(139,92,246,0.3)'
                : '0 4px 16px rgba(139,92,246,0.3)',
            }}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            <motion.span
              key={isPlaying ? 'pause' : 'play'}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-xl text-white"
            >
              {isPlaying ? '⏸' : '▶'}
            </motion.span>
          </motion.button>

          {/* Next */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={playNext}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '0.5px solid rgba(255,255,255,0.08)',
            }}
            aria-label="Next track"
          >
            <span className="text-lg text-white/55">⏭</span>
          </motion.button>
        </div>

        {/* Track position in playlist */}
        {playlist.length > 1 && (
          <div className="flex justify-center mt-4 gap-1.5">
            {playlist.slice(0, Math.min(playlist.length, 8)).map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === currentIdx ? 16 : 4,
                  height: 4,
                  background: i === currentIdx
                    ? 'rgba(167,139,250,0.8)'
                    : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bottom safe area spacer */}
      <div className="safe-bottom h-4" />
    </motion.div>
  )
}
