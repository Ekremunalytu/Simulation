import { describe, expect, it } from 'vitest'
import { deriveMultivariableLimitPathsResult } from './logic'

describe('multivariable limit paths logic', () => {
  it('shows matching evidence for the consistent function family', () => {
    const result = deriveMultivariableLimitPathsResult({
      functionType: 'consistent',
      targetX: 0,
      targetY: 0,
      pathPair: 'line-vs-parabola',
    })

    expect(result.sameLimitEvidence).toBe(true)
    expect(result.frames.at(-1)?.firstValue ?? 1).toBeLessThan(0.01)
  })

  it('shows divergent path evidence for the path-dependent family', () => {
    const result = deriveMultivariableLimitPathsResult({
      functionType: 'path-dependent',
      targetX: 0,
      targetY: 0,
      pathPair: 'line-vs-parabola',
    })

    expect(result.sameLimitEvidence).toBe(false)
    expect(result.frames.at(-1)?.firstValue ?? 0).toBeGreaterThan(0.45)
    expect(result.frames.at(-1)?.secondValue ?? 1).toBeLessThan(0.1)
  })
})
