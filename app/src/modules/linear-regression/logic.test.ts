import { describe, expect, it } from 'vitest'
import {
  deriveLinearRegressionResult,
  fitRegression,
  generateData,
} from './logic'

describe('linear regression logic', () => {
  it('recovers the generating line when there is no noise', () => {
    const data = generateData(40, 2.5, 3, 0, 42)
    const result = fitRegression(data)

    expect(result.slope).toBeCloseTo(2.5, 6)
    expect(result.intercept).toBeCloseTo(3, 6)
    expect(result.rSquared).toBeCloseTo(1, 6)
  })

  it('calculates residuals and mse consistently', () => {
    const data = generateData(20, 1.5, -2, 4, 42)
    const result = fitRegression(data)
    const mseFromResiduals =
      result.residuals.reduce((sum, point) => sum + point.residual ** 2, 0) / result.residuals.length

    expect(result.mse).toBeCloseTo(mseFromResiduals, 10)
    expect(result.residuals).toHaveLength(data.length)
  })

  it('falls back safely for degenerate x values', () => {
    const result = fitRegression([
      { x: 1, y: 2 },
      { x: 1, y: 4 },
      { x: 1, y: 6 },
    ])

    expect(result.slope).toBe(0)
    expect(result.intercept).toBe(4)
    expect(result.rSquared).toBeLessThanOrEqual(1)
  })

  it('builds playback frames from the first two visible points to the full dataset', () => {
    const result = deriveLinearRegressionResult({
      numPoints: 8,
      trueSlope: 2.5,
      trueIntercept: 3,
      noise: 5,
    })

    expect(result.timeline?.frames).toHaveLength(7)
    expect(result.playbackFrames).toHaveLength(7)
    expect(result.playbackFrames[0]?.visibleCount).toBe(2)
    expect(result.playbackFrames[0]?.data).toHaveLength(2)
    expect(result.playbackFrames.at(-1)?.visibleCount).toBe(result.data.length)
    expect(result.playbackFrames.at(-1)?.data).toEqual(result.data)
    expect(result.playbackFrames.at(-1)?.regression).toEqual(fitRegression(result.data))
  })
})
