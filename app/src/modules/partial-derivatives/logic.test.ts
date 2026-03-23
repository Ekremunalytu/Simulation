import { describe, expect, it } from 'vitest'
import { derivePartialDerivativesResult } from './logic'

describe('partial derivatives logic', () => {
  it('matches analytic partials for the paraboloid surface', () => {
    const result = derivePartialDerivativesResult({
      surfaceType: 'paraboloid',
      pointX: 1.5,
      pointY: -0.5,
    })

    expect(result.dfdx).toBeCloseTo(3, 6)
    expect(result.dfdy).toBeCloseTo(-1, 6)
  })

  it('builds shrinking finite-difference frames that approach the analytic partials', () => {
    const result = derivePartialDerivativesResult({
      surfaceType: 'wave',
      pointX: 1.2,
      pointY: 1,
    })

    expect(result.timeline?.frames.length).toBeGreaterThan(1)
    expect(Math.abs((result.frames.at(-1)?.approxDfdx ?? 0) - result.dfdx)).toBeLessThan(
      Math.abs((result.frames[0]?.approxDfdx ?? 0) - result.dfdx),
    )
    expect(Math.abs((result.frames.at(-1)?.approxDfdy ?? 0) - result.dfdy)).toBeLessThan(
      Math.abs((result.frames[0]?.approxDfdy ?? 0) - result.dfdy),
    )
  })
})
