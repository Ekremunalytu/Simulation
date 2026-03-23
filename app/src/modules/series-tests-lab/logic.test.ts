import { describe, expect, it } from 'vitest'
import { deriveSeriesTestsLabResult } from './logic'

describe('series tests lab logic', () => {
  it('classifies geometric series with |r| < 1 as convergent', () => {
    const result = deriveSeriesTestsLabResult({
      testType: 'geometric',
      parameter: 0.5,
      terms: 12,
    })

    expect(result.classification).toBe('yakinsak')
  })

  it('classifies p-series with p < 1 as divergent', () => {
    const result = deriveSeriesTestsLabResult({
      testType: 'p-series',
      parameter: 0.8,
      terms: 12,
    })

    expect(result.classification).toBe('iraksak')
  })

  it('uses the ratio test threshold at parameter = 1', () => {
    const convergent = deriveSeriesTestsLabResult({
      testType: 'ratio',
      parameter: 2.4,
      terms: 12,
    })
    const divergent = deriveSeriesTestsLabResult({
      testType: 'ratio',
      parameter: 0.8,
      terms: 12,
    })

    expect(convergent.classification).toBe('yakinsak')
    expect(convergent.frames.at(-1)?.evidence ?? 1).toBeLessThan(1)
    expect(divergent.classification).toBe('iraksak')
    expect(divergent.frames.at(-1)?.evidence ?? 0).toBeGreaterThan(1)
  })
})
