import { describe, expect, it } from 'vitest'
import { deriveMultipleIntegralRegionsResult } from './logic'

describe('multiple integral regions logic', () => {
  it('approximates the triangle area with finer grids', () => {
    const result = deriveMultipleIntegralRegionsResult({
      regionType: 'triangle',
      subdivisions: 12,
    })

    expect(Math.abs((result.cells.at(-1)?.cumulative ?? 0) - result.exactArea)).toBeLessThan(0.4)
  })
})
