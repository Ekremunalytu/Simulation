import { describe, expect, it } from 'vitest'
import { deriveSequenceLimitsMonotoneLabResult } from './logic'

describe('deriveSequenceLimitsMonotoneLabResult', () => {
  it('generates term-by-term frames for squeeze theorem mode', () => {
    const result = deriveSequenceLimitsMonotoneLabResult({
      scenario: 'squeeze',
      parameter: 1,
      terms: 16,
    })

    expect(result.frames).toHaveLength(16)
    expect(result.targetLimit).toBe(0)
  })

  it('marks recursive sequences with a shrinking final gap', () => {
    const result = deriveSequenceLimitsMonotoneLabResult({
      scenario: 'recursive',
      parameter: 2.5,
      terms: 14,
    })

    expect((result.frames.at(-1)?.gap ?? 1)).toBeLessThan(0.1)
  })
})
