import { describe, expect, it } from 'vitest'
import { deriveImproperIntegralsResult } from './logic'

describe('improper integrals logic', () => {
  it('reduces error for a convergent exponential tail', () => {
    const result = deriveImproperIntegralsResult({ scenario: 'exp-tail', exponent: 2 })

    expect(result.exactValue).toBeCloseTo(1, 6)
    expect((result.frames[0]?.error ?? 1)).toBeGreaterThan(result.frames.at(-1)?.error ?? 0)
  })

  it('marks the harmonic tail as divergent', () => {
    const result = deriveImproperIntegralsResult({ scenario: 'inv', exponent: 1 })

    expect(result.classification).toBe('iraksak')
    expect(result.exactValue).toBeNull()
  })
})
