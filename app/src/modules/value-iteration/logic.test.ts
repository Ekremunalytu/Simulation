import { describe, expect, it } from 'vitest'
import { deriveValueIterationResult, type ValueIterationParams } from './logic'

const baseParams: ValueIterationParams = {
  mapLayout: 'easy-goal',
  gamma: 0.92,
  stepReward: -0.08,
  wallPenalty: -0.25,
  goalReward: 1,
  sweeps: 12,
}

describe('value iteration logic', () => {
  it('decreases delta over sweeps', () => {
    const result = deriveValueIterationResult(baseParams)

    expect(result.deltaSeries.at(0)?.delta ?? 0).toBeGreaterThan(result.deltaSeries.at(-1)?.delta ?? 0)
  })

  it('produces a greedy path that reaches a terminal cell', () => {
    const result = deriveValueIterationResult(baseParams)
    const lastStep = result.finalPath.at(-1)

    expect(lastStep?.action ?? null).toBeNull()
  })

  it('keeps start value below goal reward', () => {
    const result = deriveValueIterationResult(baseParams)

    expect(result.startValue).toBeLessThan(baseParams.goalReward)
  })
})
