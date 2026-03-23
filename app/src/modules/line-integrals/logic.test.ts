import { describe, expect, it } from 'vitest'
import { deriveLineIntegralsResult } from './logic'

describe('line integrals logic', () => {
  it('approximates the circular work integral in the rotation field', () => {
    const result = deriveLineIntegralsResult({
      curveType: 'circle',
      fieldType: 'rotation',
      integralMode: 'work',
      steps: 80,
    })

    expect(result.frames.at(-1)?.cumulative ?? 0).toBeCloseTo(2 * Math.PI, 1)
  })
})
