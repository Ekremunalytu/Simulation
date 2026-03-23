import { describe, expect, it } from 'vitest'
import { deriveLimitExplorerResult } from './logic'

describe('limit explorer logic', () => {
  it('recognizes a removable discontinuity with a finite two-sided limit', () => {
    const result = deriveLimitExplorerResult({
      functionType: 'removable',
      approachPoint: 1,
      direction: 'both',
      zoom: 2,
    })

    expect(result.limitValue).toBeCloseTo(2, 2)
    expect(result.classification).toBe('removable')
    expect(result.timeline?.frames.length).toBeGreaterThan(1)
  })

  it('reports no two-sided limit for jump discontinuities', () => {
    const result = deriveLimitExplorerResult({
      functionType: 'jump',
      approachPoint: 0,
      direction: 'both',
      zoom: 2,
    })

    expect(result.leftEstimate).not.toBe(result.rightEstimate)
    expect(result.limitValue).toBeNull()
  })

  it('tracks asymptotic one-sided signs instead of collapsing them into a generic missing value', () => {
    const result = deriveLimitExplorerResult({
      functionType: 'asymptote',
      approachPoint: 1,
      direction: 'both',
      zoom: 2,
    })

    expect(result.leftDisplay).toBe('-∞')
    expect(result.rightDisplay).toBe('+∞')
  })
})
