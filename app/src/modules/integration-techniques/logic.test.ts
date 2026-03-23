import { describe, expect, it } from 'vitest'
import { deriveIntegrationTechniquesResult } from './logic'

describe('integration techniques logic', () => {
  it('builds a deterministic substitution workflow', () => {
    const result = deriveIntegrationTechniquesResult({ technique: 'substitution' })

    expect(result.frames).toHaveLength(4)
    expect(result.finalAntiderivative).toMatch(/sin\(x\^2\)/i)
  })

  it('produces the expected final partial-fractions antiderivative label', () => {
    const result = deriveIntegrationTechniquesResult({ technique: 'partial-fractions' })

    expect(result.finalAntiderivative).toMatch(/ln/i)
  })

  it('keeps the integration-by-parts chart aligned with the displayed integral', () => {
    const result = deriveIntegrationTechniquesResult({ technique: 'parts' })
    const nearestToTwo = result.originalCurve.reduce((best, point) =>
      Math.abs(point.x - 2) < Math.abs(best.x - 2) ? point : best,
    )

    expect(nearestToTwo.y).not.toBeNull()
    expect(nearestToTwo.y ?? 0).toBeCloseTo(nearestToTwo.x * Math.exp(nearestToTwo.x), 3)
  })
})
