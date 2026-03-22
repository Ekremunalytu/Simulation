import { describe, expect, it } from 'vitest'
import { fitRegression, generateData } from './logic'

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
})
