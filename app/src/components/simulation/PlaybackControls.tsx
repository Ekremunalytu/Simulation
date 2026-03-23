import { motion } from 'framer-motion'
import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import type { PlaybackSpeed } from '../../types/simulation'

interface PlaybackControlsProps {
  frameIndex: number
  totalFrames: number
  isPlaying: boolean
  speed: PlaybackSpeed
  onPlay: () => void
  onPause: () => void
  onStep: () => void
  onRestart: () => void
  onSpeedChange: (speed: PlaybackSpeed) => void
}

const speeds: PlaybackSpeed[] = [0.5, 1, 2]

export function PlaybackControls({
  frameIndex,
  totalFrames,
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStep,
  onRestart,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-container-low/70 border border-white/[0.05] px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="p-2.5 rounded-xl bg-surface-container-lowest/70 hover:bg-surface-container transition-colors text-on-surface"
          title={isPlaying ? 'Oynatmayı duraklat' : 'Oynatmayı başlat'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={onStep}
          className="p-2.5 rounded-xl bg-surface-container-lowest/70 hover:bg-surface-container transition-colors text-on-surface"
          title="Bir adım ilerle"
        >
          <SkipForward className="w-4 h-4" />
        </button>
        <button
          onClick={onRestart}
          className="p-2.5 rounded-xl bg-surface-container-lowest/70 hover:bg-surface-container transition-colors text-on-surface"
          title="Baştan başlat"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <div className="font-mono text-xs text-outline px-3">
          Adım {frameIndex + 1} / {totalFrames}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {speeds.map((item) => (
          <button
            key={item}
            onClick={() => onSpeedChange(item)}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              speed === item
                ? 'bg-secondary/15 text-secondary ring-1 ring-secondary/20'
                : 'bg-surface-container-lowest/70 text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {item}x
          </button>
        ))}
      </div>
    </motion.div>
  )
}
