'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePlayer } from '@/hooks/usePlayer'
import WaveformVisualizer from './WaveformVisualizer'
import { formatDuration } from '@/lib/music/playlistData'

interface Props {
  onExpand?: () => void
}

export default function NowPlayingBar({ onExpand }: Props) {
  const { player, togglePlay, playNext, playPrev } = usePlayer()
  const { currentTrack, isPlaying, progress } = player

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="fixed left-0 right-0 z-[25]"
          style={{ bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))' }}
        >
          <div
            className="mx-3 rounded-[18px] overflow-hidden cursor-pointer"
            style={{
              background: 'rgba(18,12,36,0.92)',
              border: '0.5px solid rgba(167,139,250,0.18)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
            onClick={onExpand}
          >
            {/* Progress thin line at top */}
            <div className="h-[2px] w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full"
                style={{
                  background: 'linear-gradient(90deg, #a78bfa, #f9a8d4)',
                  width: `${progress * 100}%`,
                }}
                transition={{ duration: 0.2 }}
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3">
              {/* Album art orb */}
              <motion.div
                animate={isPlaying ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-10 h-10 rounded-[11px] flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.7), rgba(59,130,246,0.6))',
                  boxShadow: isPlaying ? '0 0 18px rgba(139,92,246,0.5)' : 'none',
                }}
              >
                🎵
              </motion.div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white/92 truncate leading-tight">
                  {currentTrack.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <WaveformVisualizer
                    isPlaying={isPlaying}
                    barCount={12}
                    height={12}
                    color="rgba(167,139,250,0.55)"
                    variant="minimal"
                  />
                  <span className="text-[9px] text-white/30 flex-shrink-0">
                    {formatDuration(Math.round(currentTrack.duration * (1 - progress)))} left
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div
                className="flex items-center gap-1"
                onClick={e => e.stopPropagation()}
              >
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={playPrev}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                  aria-label="Previous"
                >
                  <span className="text-xs">⏮</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: 'rgba(139,92,246,0.25)',
                    border: '0.5px solid rgba(139,92,246,0.35)',
                  }}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  <span className="text-xs text-white/90">{isPlaying ? '⏸' : '▶'}</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={playNext}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                  aria-label="Next"
                >
                  <span className="text-xs">⏭</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
