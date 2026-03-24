import { useEffect, useMemo, useReducer } from 'react'
import type { PlaybackSpeed, RunMode } from '../types/simulation'

interface UseSimulationPlaybackOptions {
  runMode: RunMode
  totalFrames: number
  initialFrameIndex?: number
  resetKey: string
}

interface UseSimulationPlaybackResult {
  frameIndex: number
  totalFrames: number
  isPlaying: boolean
  speed: PlaybackSpeed
  setSpeed: (speed: PlaybackSpeed) => void
  play: () => void
  pause: () => void
  step: () => void
  restart: () => void
}

interface PlaybackState {
  frameIndex: number
  isPlaying: boolean
  speed: PlaybackSpeed
}

type PlaybackAction =
  | { type: 'reset'; totalFrames: number; initialFrameIndex: number }
  | { type: 'play'; totalFrames: number; initialFrameIndex: number }
  | { type: 'pause' }
  | { type: 'tick'; totalFrames: number }
  | { type: 'step'; totalFrames: number }
  | { type: 'restart'; totalFrames: number; initialFrameIndex: number }
  | { type: 'setSpeed'; speed: PlaybackSpeed }

const speedToDelay: Record<PlaybackSpeed, number> = {
  0.5: 900,
  1: 450,
  2: 225,
}

function clampFrameIndex(frameIndex: number, totalFrames: number) {
  return Math.max(0, Math.min(frameIndex, Math.max(totalFrames - 1, 0)))
}

function reducer(state: PlaybackState, action: PlaybackAction): PlaybackState {
  switch (action.type) {
    case 'reset':
      return {
        ...state,
        frameIndex: clampFrameIndex(action.initialFrameIndex, action.totalFrames),
        isPlaying: false,
      }
    case 'play':
      return {
        ...state,
        frameIndex:
          state.frameIndex >= action.totalFrames - 1
            ? clampFrameIndex(action.initialFrameIndex, action.totalFrames)
            : state.frameIndex,
        isPlaying: action.totalFrames > 1,
      }
    case 'pause':
      return {
        ...state,
        isPlaying: false,
      }
    case 'tick': {
      const nextFrameIndex = Math.min(state.frameIndex + 1, action.totalFrames - 1)
      return {
        ...state,
        frameIndex: nextFrameIndex,
        isPlaying: nextFrameIndex < action.totalFrames - 1,
      }
    }
    case 'step':
      return {
        ...state,
        frameIndex: Math.min(state.frameIndex + 1, action.totalFrames - 1),
        isPlaying: false,
      }
    case 'restart':
      return {
        ...state,
        frameIndex: clampFrameIndex(action.initialFrameIndex, action.totalFrames),
        isPlaying: false,
      }
    case 'setSpeed':
      return {
        ...state,
        speed: action.speed,
      }
    default:
      return state
  }
}

export function useSimulationPlayback({
  runMode,
  totalFrames,
  initialFrameIndex = 0,
  resetKey,
}: UseSimulationPlaybackOptions): UseSimulationPlaybackResult {
  const [state, dispatch] = useReducer(reducer, {
    frameIndex: clampFrameIndex(initialFrameIndex, totalFrames),
    isPlaying: false,
    speed: 1,
  })

  useEffect(() => {
    dispatch({ type: 'reset', totalFrames, initialFrameIndex })
  }, [initialFrameIndex, resetKey, totalFrames])

  useEffect(() => {
    if (runMode !== 'timeline' || !state.isPlaying || totalFrames <= 1) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      dispatch({ type: 'tick', totalFrames })
    }, speedToDelay[state.speed])

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [runMode, state.isPlaying, state.speed, totalFrames, state.frameIndex])

  return useMemo(
    () => ({
      frameIndex: state.frameIndex,
      totalFrames,
      isPlaying: state.isPlaying,
      speed: state.speed,
      setSpeed: (speed: PlaybackSpeed) => dispatch({ type: 'setSpeed', speed }),
      play: () => dispatch({ type: 'play', totalFrames, initialFrameIndex }),
      pause: () => dispatch({ type: 'pause' }),
      step: () => dispatch({ type: 'step', totalFrames }),
      restart: () => dispatch({ type: 'restart', totalFrames, initialFrameIndex }),
    }),
    [initialFrameIndex, state.frameIndex, state.isPlaying, state.speed, totalFrames],
  )
}
