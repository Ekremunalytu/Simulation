import { describe, expect, it } from 'vitest'
import { boundarySeries } from './boundary-series'
import type { SVMSnapshot } from './logic'

function createSnapshot(overrides: Partial<SVMSnapshot>): SVMSnapshot {
  return {
    epoch: 1,
    w1: 1,
    w2: 1,
    bias: 0,
    accuracy: 1,
    hingeLoss: 0,
    supportVectorCount: 0,
    marginWidth: 1,
    points: [],
    ...overrides,
  }
}

describe('svm margin visualization helpers', () => {
  it('renders near-vertical boundaries as vertical segments', () => {
    const series = boundarySeries(
      createSnapshot({
        w1: 2,
        w2: 0.00001,
        bias: -1,
      }),
      0,
    )

    expect(series).toHaveLength(2)
    expect(series[0]?.x).toBeCloseTo(0.5, 6)
    expect(series[1]?.x).toBeCloseTo(0.5, 6)
    expect(series[0]?.y).toBe(-6)
    expect(series[1]?.y).toBe(6)
  })
})
