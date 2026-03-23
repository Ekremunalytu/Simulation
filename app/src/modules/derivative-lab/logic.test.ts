import { describe, expect, it } from 'vitest'
import { deriveDerivativeLabResult } from './logic'

describe('derivative lab logic', () => {
  it('secant slopes converge to the analytic derivative', () => {
    const result = deriveDerivativeLabResult({
      functionType: 'sine',
      point: 0,
      initialH: 1.6,
      steps: 8,
    })

    expect(result.tangentSlope).toBeCloseTo(1, 6)
    expect(result.frames.at(-1)?.secantSlope).toBeCloseTo(1, 2)
    expect(result.frames.at(-1)?.error ?? 1).toBeLessThan(result.frames[0]?.error ?? 0)
  })
})
