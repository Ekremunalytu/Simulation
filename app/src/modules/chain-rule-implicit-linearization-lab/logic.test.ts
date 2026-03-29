import { describe, expect, it } from 'vitest'
import { deriveChainRuleImplicitLinearizationLabResult } from './logic'

describe('deriveChainRuleImplicitLinearizationLabResult', () => {
  it('builds a centered timeline for chain rule exploration', () => {
    const result = deriveChainRuleImplicitLinearizationLabResult({
      scenario: 'chain',
      anchor: 0.8,
      neighborhood: 0.9,
      steps: 7,
    })

    expect(result.frames).toHaveLength(7)
    expect(result.timeline?.initialFrameIndex).toBe(3)
    expect(result.metrics[0]?.value).toBe('Chain Rule')
  })

  it('computes non-zero approximation error for linearization away from the anchor', () => {
    const result = deriveChainRuleImplicitLinearizationLabResult({
      scenario: 'linearization',
      anchor: 0.6,
      neighborhood: 1.1,
      steps: 7,
    })

    expect(result.frames.some((frame) => frame.error > 0.01)).toBe(true)
  })
})
