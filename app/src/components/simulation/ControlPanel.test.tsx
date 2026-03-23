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

describe('ControlPanel', () => {
  it('renders sync status and reacts to control changes without a run button', () => {
    const handleChange = vi.fn()

    render(
      <ControlPanel
        controls={[
          { key: 'learningRate', label: 'Öğrenme Oranı', type: 'slider', min: 0.001, max: 1, step: 0.001 },
        ]}
        params={params}
        presets={presets}
        syncState="updating"
        selectedPresetName={null}
        onParamChange={handleChange}
        onReset={vi.fn()}
        onApplyPreset={vi.fn()}
      />,
    )

    expect(screen.getByText(/parametreler güncelleniyor/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /simülasyonu çalıştır/i })).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('slider'), { target: { value: '0.2' } })
    expect(handleChange).toHaveBeenCalledTimes(1)
  })
})
