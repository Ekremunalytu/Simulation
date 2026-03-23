import { describe, expect, it } from 'vitest'
import { deriveDirectionalDerivativeGradientResult } from './logic'

describe('directional derivative gradient logic', () => {
  it('matches the finite-difference estimate to gradient projection', () => {
    const result = deriveDirectionalDerivativeGradientResult({
      surfaceType: 'paraboloid',
      pointX: 1,
      pointY: 0,
      directionAngle: 0,
    })

    const lastApprox = result.frames.at(-1)?.approxDirectional ?? 0
    expect(lastApprox).toBeCloseTo(result.exactDirectional, 1)
  })
})
