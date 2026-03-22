import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ControlPanel } from './ControlPanel'
import type { GradientDescentParams } from '../../modules/gradient-descent/logic'
import type { PresetConfig } from '../../types/simulation'

const params: GradientDescentParams = {
  learningRate: 0.05,
  iterations: 100,
  startX: 3,
  startY: 3,
  momentum: false,
  stochastic: false,
}

const presets: PresetConfig<GradientDescentParams>[] = [
  {
    name: 'Fast',
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

describe('ControlPanel', () => {
  it('enables the run button only when the draft is dirty', () => {
    const handleRun = vi.fn()

    const { rerender } = render(
      <ControlPanel
        controls={[
          { key: 'learningRate', label: 'Learning Rate', type: 'slider', min: 0.001, max: 1, step: 0.001 },
        ]}
        params={params}
        presets={presets}
        dirty={false}
        selectedPresetName={null}
        onParamChange={vi.fn()}
        onRun={handleRun}
        onReset={vi.fn()}
        onApplyPreset={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /run simulation/i })).toBeDisabled()

    rerender(
      <ControlPanel
        controls={[
          { key: 'learningRate', label: 'Learning Rate', type: 'slider', min: 0.001, max: 1, step: 0.001 },
        ]}
        params={params}
        presets={presets}
        dirty
        selectedPresetName={null}
        onParamChange={vi.fn()}
        onRun={handleRun}
        onReset={vi.fn()}
        onApplyPreset={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /run simulation/i }))

    expect(handleRun).toHaveBeenCalledTimes(1)
  })
})
