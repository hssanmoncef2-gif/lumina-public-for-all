'use client'

import { motion } from 'framer-motion'
import type { Playlist } from '@/types'
import { formatDuration } from '@/lib/music/playlistData'

interface Props {
  playlist: Playlist
  isActive?: boolean
  onPlay: (playlist: Playlist) => void
  onOpen: (playlist: Playlist) => void
}

export default function PlaylistCard({ playlist, isActive, onPlay, onOpen }: Props) {
  const totalDuration = playlist.tracks.reduce((sum, t) => sum + t.duration, 0)

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => onOpen(playlist)}
      className="relative rounded-[20px] overflow-hidden cursor-pointer"
      style={{
        background: playlist.gradient,
        border: '0.5px solid rgba(255,255,255,0.10)',
        aspectRatio: '1 / 1.1',
      }}
    >
      {/* Glow overlay if active */}
      {isActive && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.2)',
            borderRadius: '20px',
          }}
        />
      )}

      {/* Content */}
      <div className="flex flex-col h-full p-4 justify-between">
        {/* Top: emoji + play */}
        <div className="flex items-start justify-between">
          <motion.div
            animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-3xl"
          >
            {playlist.emoji}
          </motion.div>

          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={(e) => { e.stopPropagation(); onPlay(playlist) }}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '0.5px solid rgba(255,255,255,0.2)',
              boxShadow: isActive ? '0 0 16px rgba(255,255,255,0.2)' : 'none',
            }}
            aria-label={`Play ${playlist.title}`}
          >
            <span className="text-xs text-white">
              {isActive ? '⏸' : '▶'}
            </span>
          </motion.button>
        </div>

        {/* Bottom: info */}
        <div>
          <p className="text-[13px] font-semibold text-white/95 leading-tight">
            {playlist.title}
          </p>
          <p className="text-[10px] text-white/50 mt-1 leading-relaxed line-clamp-2">
            {playlist.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[9px] uppercase tracking-[0.1em] text-white/35">
              {playlist.tracks.length} tracks
            </span>
            <span className="text-[9px] text-white/20">·</span>
            <span className="text-[9px] text-white/35">
              {Math.round(totalDuration / 60)}m
            </span>
          </div>
        </div>
      </div>

      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="active-playlist-bar"
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        />
      )}
    </motion.div>
  )
}
