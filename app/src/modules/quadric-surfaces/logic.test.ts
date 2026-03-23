import { describe, expect, it } from 'vitest'
import { deriveQuadricSurfacesResult } from './logic'

describe('quadric surfaces logic', () => {
  it('creates the expected sphere cross-section near z = 0', () => {
    const result = deriveQuadricSurfacesResult({
      quadricType: 'sphere',
      sliceVariable: 'z',
      sliceValue: 0,
    })

    const center = result.sectionData.find((point) => Math.abs(point.u) < 0.05)
    expect(center?.upper ?? 0).toBeGreaterThan(1.9)
  })

  it('keeps ellipsoid z-sections wide along the x-axis', () => {
    const result = deriveQuadricSurfacesResult({
      quadricType: 'ellipsoid',
      sliceVariable: 'z',
      sliceValue: 0,
    })

    const nearEdge = result.sectionData.find((point) => Math.abs(point.u - 1.9) < 0.05)
    expect(nearEdge?.upper ?? 0).toBeGreaterThan(0.2)
  })
})
