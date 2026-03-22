import { describe, expect, it } from 'vitest'
import {
  deriveQLearningGridworldResult,
  evaluateGreedyPolicy,
  trainQLearning,
} from './logic'

describe('q-learning gridworld logic', () => {
  it('improves reward over training on the easy map', () => {
    const training = trainQLearning(
      {
        alpha: 0.2,
        gamma: 0.92,
        epsilon: 0.2,
        episodes: 100,
        stepPenalty: -0.1,
        mapLayout: 'easy-goal',
      },
      42,
    )

    const firstWindow =
      training.episodeStats.slice(0, 20).reduce((sum, item) => sum + item.totalReward, 0) / 20
    const lastWindow =
      training.episodeStats.slice(-20).reduce((sum, item) => sum + item.totalReward, 0) / 20

    expect(lastWindow).toBeGreaterThan(firstWindow)
  })

  it('learned greedy policy reaches terminal state on the easy map', () => {
    const training = trainQLearning(
      {
        alpha: 0.2,
        gamma: 0.92,
        epsilon: 0.18,
        episodes: 90,
        stepPenalty: -0.12,
        mapLayout: 'easy-goal',
      },
      42,
    )
    const path = evaluateGreedyPolicy(training.qTable, training.grid, -0.12)

    expect(path.length).toBeGreaterThan(1)
    expect(path.at(-1)?.action).toBeNull()
  })

  it('is deterministic for the same parameter set', () => {
    const params = {
      alpha: 0.18,
      gamma: 0.95,
      epsilon: 0.28,
      episodes: 120,
      stepPenalty: -0.08,
      mapLayout: 'sparse-reward' as const,
    }

    expect(deriveQLearningGridworldResult(params)).toEqual(deriveQLearningGridworldResult(params))
  })
})
