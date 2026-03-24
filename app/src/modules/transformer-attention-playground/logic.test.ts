import { describe, expect, it } from 'vitest'
import { deriveTransformerAttentionPlaygroundResult } from './logic'

describe('transformer attention playground logic', () => {
  it('normalizes every attention row to one', () => {
    const result = deriveTransformerAttentionPlaygroundResult({
      scenario: 'pronoun-resolution',
      attentionTemperature: 0.9,
      positionEncoding: true,
      positionStrength: 0.8,
    })

    result.attentionMatrix.forEach((row) => {
      const total = row.reduce((sum, value) => sum + value, 0)
      expect(total).toBeCloseTo(1, 3)
    })
  })

  it('changes repeated-token attention when positional encoding is toggled', () => {
    const withPositions = deriveTransformerAttentionPlaygroundResult({
      scenario: 'order-sensitive',
      attentionTemperature: 1,
      positionEncoding: true,
      positionStrength: 1.1,
    })
    const withoutPositions = deriveTransformerAttentionPlaygroundResult({
      scenario: 'order-sensitive',
      attentionTemperature: 1,
      positionEncoding: false,
      positionStrength: 0,
    })

    expect(withPositions.positionalDrift).toBeGreaterThan(0.008)
    expect(withPositions.attentionMatrix[1]).not.toEqual(withoutPositions.attentionMatrix[1])
  })
})
