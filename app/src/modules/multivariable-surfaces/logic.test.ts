import { describe, expect, it } from 'vitest'
import { deriveMultivariableSurfacesResult } from './logic'

describe('multivariable surfaces logic', () => {
  it('builds contour frames and a single-axis slice together', () => {
    const result = deriveMultivariableSurfacesResult({
      surfaceType: 'paraboloid',
      levelValue: 1,
      sliceAxis: 'x',
      sliceValue: 0,
    })

    expect(result.frames).toHaveLength(5)
    expect(result.sliceData).toHaveLength(80)
    expect(result.frames[2].levelPoints.length).toBeGreaterThan(0)
  })
})
