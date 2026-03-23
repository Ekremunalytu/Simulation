import { describe, expect, it } from 'vitest'
import { deriveParametricCurvesResult } from './logic'

describe('parametric curves logic', () => {
  it('tracks circle motion with unit speed and unit acceleration', () => {
    const result = deriveParametricCurvesResult({ curveType: 'circle', samples: 12 })

    expect(result.frames[0]?.speed).toBeCloseTo(1, 6)
    expect(result.frames[0]?.acceleration).toBeCloseTo(1, 6)
    expect(result.frames).toHaveLength(12)
  })
})
