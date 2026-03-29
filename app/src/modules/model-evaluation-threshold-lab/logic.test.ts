import { describe, expect, it } from 'vitest'
import { deriveModelEvaluationThresholdLabResult } from './logic'

describe('deriveModelEvaluationThresholdLabResult', () => {
  it('builds a threshold sweep with stable frame count', () => {
    const result = deriveModelEvaluationThresholdLabResult({
      scenario: 'balanced',
      threshold: 0.5,
      sampleCount: 120,
    })

    expect(result.frames).toHaveLength(9)
    expect(result.timeline?.initialFrameIndex).toBeGreaterThanOrEqual(0)
  })

  it('keeps recall high enough at lower thresholds on imbalanced data', () => {
    const result = deriveModelEvaluationThresholdLabResult({
      scenario: 'imbalanced',
      threshold: 0.3,
      sampleCount: 120,
    })

    expect(result.frames[2]?.recall).toBeGreaterThan(0.7)
  })
})
