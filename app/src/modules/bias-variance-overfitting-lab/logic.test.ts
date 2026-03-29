import { describe, expect, it } from 'vitest'
import { deriveBiasVarianceOverfittingLabResult } from './logic'

describe('deriveBiasVarianceOverfittingLabResult', () => {
  it('builds one frame per degree', () => {
    const result = deriveBiasVarianceOverfittingLabResult({
      scenario: 'balanced',
      sampleCount: 26,
      noise: 0.14,
      maxDegree: 8,
      regularization: 0.02,
    })

    expect(result.frames).toHaveLength(8)
    expect(result.timeline?.initialFrameIndex).toBe(2)
  })

  it('shows a non-zero validation gap at high degrees on noisy data', () => {
    const result = deriveBiasVarianceOverfittingLabResult({
      scenario: 'noisy',
      sampleCount: 28,
      noise: 0.24,
      maxDegree: 8,
      regularization: 0.01,
    })

    expect(result.frames.at(-1)?.varianceProxy).toBeGreaterThan(0)
  })
})
