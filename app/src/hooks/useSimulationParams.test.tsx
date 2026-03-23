import type { ReactNode } from 'react'
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useSimulationParams } from './useSimulationParams'
import type { PresetConfig } from '../types/simulation'
import type { GradientDescentParams } from '../modules/gradient-descent/logic'

const defaults: GradientDescentParams = {
  learningRate: 0.05,
  iterations: 100,
  startX: 3,
  startY: 3,
  momentum: false,
  stochastic: false,
}

const presets: PresetConfig<GradientDescentParams>[] = [
  {
    name: 'Hızlı',
    params: {
      learningRate: 0.2,
      iterations: 50,
      startX: 3,
      startY: 3,
      momentum: false,
      stochastic: false,
    },
  },
]

function createWrapper(initialEntry: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  }
}

describe('useSimulationParams', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    window.localStorage.clear()
  })

  it('prefers URL params over localStorage and defaults', () => {
    window.localStorage.setItem(
      'obsidian-lab:gradient-descent',
      JSON.stringify({
        committedParams: {
          ...defaults,
          learningRate: 0.9,
        },
        selectedPresetName: null,
        panelOpen: false,
      }),
    )

    const { result } = renderHook(
      () =>
        useSimulationParams({
          moduleId: 'gradient-descent',
          defaults,
          presets,
        }),
      {
        wrapper: createWrapper('/sim/gradient-descent?learningRate=0.15&iterations=120'),
      },
    )

    expect(result.current.committedParams.learningRate).toBe(0.15)
    expect(result.current.committedParams.iterations).toBe(120)
    expect(result.current.panelOpen).toBe(true)
  })

  it('commits draft params automatically after debounce', () => {
    const { result } = renderHook(
      () =>
        useSimulationParams({
          moduleId: 'gradient-descent',
          defaults,
          presets,
        }),
      {
        wrapper: createWrapper('/sim/gradient-descent'),
      },
    )

    act(() => {
      result.current.setDraftParam('learningRate', 0.2)
    })

    expect(result.current.draftParams.learningRate).toBe(0.2)
    expect(result.current.committedParams.learningRate).toBe(0.05)
    expect(result.current.syncState).toBe('updating')

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.committedParams.learningRate).toBe(0.2)
    expect(result.current.syncState).toBe('synced')
  })

  it('resets back to the selected preset', () => {
    const { result } = renderHook(
      () =>
        useSimulationParams({
          moduleId: 'gradient-descent',
          defaults,
          presets,
        }),
      {
        wrapper: createWrapper('/sim/gradient-descent'),
      },
    )

    act(() => {
      result.current.applyPreset('Hızlı')
    })

    act(() => {
      result.current.setDraftParam('iterations', 140)
    })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.draftParams).toEqual(presets[0].params)
    expect(result.current.committedParams).toEqual(presets[0].params)
    expect(result.current.syncState).toBe('synced')
  })
})
