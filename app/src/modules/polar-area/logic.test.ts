import { describe, expect, it } from 'vitest'
import { derivePolarAreaResult } from './logic'

describe('polar area logic', () => {
  it('approaches the exact rose area as sectors increase', () => {
    const result = derivePolarAreaResult({
      curveType: 'rose',
      scale: 2,
      sectors: 16,
    })

    expect(result.exactArea).toBeCloseTo(2 * Math.PI, 6)
    expect(result.frames[0]?.error ?? 1).toBeGreaterThan(result.frames.at(-1)?.error ?? 0)
  })
})
