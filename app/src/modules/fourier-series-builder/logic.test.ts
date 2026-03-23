import { describe, expect, it } from 'vitest'
import {
  deriveFourierSeriesBuilderResult,
  type FourierSeriesBuilderParams,
} from './logic'

const baseParams: FourierSeriesBuilderParams = {
  waveType: 'square',
  harmonics: 9,
  amplitude: 1,
  period: Math.PI,
  phaseShift: 0,
}

describe('fourier series builder logic', () => {
  it('reduces rmse as harmonics increase', () => {
    const low = deriveFourierSeriesBuilderResult({ ...baseParams, harmonics: 3 })
    const high = deriveFourierSeriesBuilderResult({ ...baseParams, harmonics: 11 })

    expect(high.errorSeries.at(-1)?.rmse ?? 0).toBeLessThan(low.errorSeries.at(-1)?.rmse ?? 0)
  })

  it('keeps gibbs overshoot visible for square wave', () => {
    const result = deriveFourierSeriesBuilderResult({ ...baseParams, harmonics: 15 })

    expect(result.frames.at(-1)?.overshoot ?? 0).toBeGreaterThan(0.05)
  })
})
