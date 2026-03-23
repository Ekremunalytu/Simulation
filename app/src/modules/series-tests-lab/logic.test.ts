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
})
