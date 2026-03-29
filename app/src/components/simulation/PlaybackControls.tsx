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
  const actionClass =
    'focus-ring flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-low text-on-surface shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high'

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface-panel flex flex-wrap items-center justify-between gap-4 rounded-[24px] px-4 py-3"
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={isPlaying ? onPause : onPlay}
          className={actionClass}
          aria-label={isPlaying ? 'Oynatmayı duraklat' : 'Oynatmayı başlat'}
        >
          {isPlaying ? <Pause aria-hidden="true" className="w-4 h-4" /> : <Play aria-hidden="true" className="w-4 h-4" />}
        </button>
        <button
          type="button"
          onClick={onStep}
          className={actionClass}
          aria-label="Bir adım ilerle"
        >
          <SkipForward aria-hidden="true" className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRestart}
          className={actionClass}
          aria-label="Baştan başlat"
        >
          <RotateCcw aria-hidden="true" className="w-4 h-4" />
        </button>
        <div className="rounded-full bg-black/20 px-4 py-2 font-mono text-xs text-outline shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
          Adım {frameIndex + 1} / {totalFrames}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {speeds.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onSpeedChange(item)}
            className={`focus-ring rounded-2xl px-3.5 py-2 text-xs font-medium transition-[background-color,color,box-shadow] duration-200 ${
              speed === item
                ? 'bg-secondary/15 text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)]'
                : 'bg-surface-container-low text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high hover:text-on-surface'
            }`}
            aria-pressed={speed === item}
          >
            {item}x
          </button>
        ))}
      </div>
    </motion.div>
  )
}
