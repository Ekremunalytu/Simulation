import { describe, expect, it } from 'vitest'
import { deriveVectorFieldsResult } from './logic'

describe('vector fields logic', () => {
  it('matches the analytic rotation field at the selected point', () => {
    const result = deriveVectorFieldsResult({
      fieldType: 'rotation',
      pointX: 1,
      pointY: 2,
    })

    expect(result.selectedVector.vx).toBeCloseTo(-2, 6)
    expect(result.selectedVector.vy).toBeCloseTo(1, 6)
  })

  it('builds timeline frames for streamline progression', () => {
    const result = deriveVectorFieldsResult({
      fieldType: 'rotation',
      pointX: 1,
      pointY: 0.5,
    })

    expect(result.timeline?.frames.length).toBe(result.currentVectorFrames.length)
    expect(result.currentVectorFrames.length).toBeGreaterThan(5)
  })
})
