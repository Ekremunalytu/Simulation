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
})
