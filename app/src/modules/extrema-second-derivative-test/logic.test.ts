import { describe, expect, it } from 'vitest'
import { deriveExtremaSecondDerivativeTestResult } from './logic'

describe('extrema second derivative test logic', () => {
  it('classifies minimum, maximum, and saddle correctly', () => {
    expect(
      deriveExtremaSecondDerivativeTestResult({
        surfaceType: 'bowl',
        pointX: 0,
        pointY: 0,
      }).classification,
    ).toBe('yerel minimum')

    expect(
      deriveExtremaSecondDerivativeTestResult({
        surfaceType: 'hill',
        pointX: 0,
        pointY: 0,
      }).classification,
    ).toBe('yerel maksimum')

    expect(
      deriveExtremaSecondDerivativeTestResult({
        surfaceType: 'saddle',
        pointX: 0,
        pointY: 0,
      }).classification,
    ).toBe('eyer noktası')
  })
})
