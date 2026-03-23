import { describe, expect, it } from 'vitest'
import { deriveSequenceSeriesResult } from './logic'

describe('sequence series logic', () => {
  it('geometric series converges toward its finite sum when |r| < 1', () => {
    const result = deriveSequenceSeriesResult({
      seriesType: 'geometric',
      terms: 20,
      ratio: 0.5,
      exponent: 1.5,
    })

    expect(result.convergenceTarget).toBeCloseTo(2, 6)
    expect(result.termsData.at(-1)?.partialSum).toBeCloseTo(2, 2)
  })

  it('harmonic partial sums keep increasing', () => {
    const result = deriveSequenceSeriesResult({
      seriesType: 'harmonic',
      terms: 20,
      ratio: 0.5,
      exponent: 1.5,
    })

    expect(result.termsData.at(-1)?.partialSum ?? 0).toBeGreaterThan(result.termsData[9]?.partialSum ?? 0)
  })
})
