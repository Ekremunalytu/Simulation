import { describe, expect, it } from 'vitest'
import { derivePolicyIterationResult, type PolicyIterationParams } from './logic'

const baseParams: PolicyIterationParams = {
  mapLayout: 'easy-goal',
  gamma: 0.92,
  stepReward: -0.08,
  wallPenalty: -0.25,
  goalReward: 1,
  iterations: 8,
}

describe('policy iteration logic', () => {
  it('contains both evaluation and improvement phases', () => {
    const result = derivePolicyIterationResult(baseParams)

    expect(result.frames.some((frame) => frame.phase === 'evaluation')).toBe(true)
    expect(result.frames.some((frame) => frame.phase === 'improvement')).toBe(true)
  })

  it('keeps policy stability between 0 and 1', () => {
    const result = derivePolicyIterationResult(baseParams)

    expect(result.stablePolicyRatio).toBeGreaterThanOrEqual(0)
    expect(result.stablePolicyRatio).toBeLessThanOrEqual(1)
  })

  it('reaches a terminal state on the final greedy path', () => {
    const result = derivePolicyIterationResult(baseParams)

    expect(result.finalPath.at(-1)?.action ?? null).toBeNull()
  })
})
