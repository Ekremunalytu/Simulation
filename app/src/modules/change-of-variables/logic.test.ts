import { describe, expect, it } from 'vitest'
import { deriveChangeOfVariablesResult } from './logic'

describe('change of variables logic', () => {
  it('approximates the polar integral with Jacobian weighting', () => {
    const result = deriveChangeOfVariablesResult({
      regionType: 'disk',
      integrandType: 'unit',
      subdivisions: 8,
    })

    expect(result.approxValue).toBeCloseTo(result.exactValue, 0)
  })
})
