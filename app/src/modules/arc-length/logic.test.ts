import { describe, expect, it } from 'vitest'
import { deriveArcLengthResult } from './logic'

describe('arc length logic', () => {
  it('improves the arc-length estimate as segments increase', () => {
    const result = deriveArcLengthResult({ curveType: 'circle', segments: 16 })

    expect(result.exactLength).toBeCloseTo(Math.PI / 2, 6)
    expect(result.frames[0]?.error ?? 1).toBeGreaterThan(result.frames.at(-1)?.error ?? 0)
  })
})
