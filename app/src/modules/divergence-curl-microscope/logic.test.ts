import { describe, expect, it } from 'vitest'
import {
  deriveDivergenceCurlMicroscopeResult,
  type DivergenceCurlMicroscopeParams,
} from './logic'

const baseParams: DivergenceCurlMicroscopeParams = {
  fieldType: 'rotation',
  probeX: 0.4,
  probeY: 0.3,
  probeRadius: 0.75,
  sampleCount: 24,
  probeShape: 'circle',
}

describe('divergence curl microscope logic', () => {
  it('keeps rotation field divergence near zero and curl positive', () => {
    const result = deriveDivergenceCurlMicroscopeResult(baseParams)

    expect(Math.abs(result.estimatedDivergence)).toBeLessThan(0.5)
    expect(result.estimatedCurl).toBeGreaterThan(0.5)
  })

  it('detects positive divergence for radial field', () => {
    const result = deriveDivergenceCurlMicroscopeResult({
      ...baseParams,
      fieldType: 'radial',
    })

    expect(result.estimatedDivergence).toBeGreaterThan(0)
  })

  it('detects negative divergence for sink field', () => {
    const result = deriveDivergenceCurlMicroscopeResult({
      ...baseParams,
      fieldType: 'sink',
    })

    expect(result.estimatedDivergence).toBeLessThan(0)
  })
})
