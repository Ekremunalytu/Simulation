import { describe, expect, it } from 'vitest'
import { deriveDoubleIntegralResult } from './logic'

describe('double integral logic', () => {
  it('approximates simple surfaces close to the analytic double integral', () => {
    const result = deriveDoubleIntegralResult({
      surfaceType: 'plane',
      extent: 2,
      subdivisions: 7,
    })

    expect(Math.abs((result.cells.at(-1)?.cumulative ?? 0) - result.exactValue)).toBeLessThan(0.5)
  })
})
