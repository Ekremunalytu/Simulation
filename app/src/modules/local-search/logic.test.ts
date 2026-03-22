import { describe, expect, it } from 'vitest'
import { deriveLocalSearchResult, runLocalSearch, type LocalSearchParams } from './logic'

describe('local search logic', () => {
  it('hill climbing can get trapped in a rugged landscape', () => {
    const params: LocalSearchParams = {
      algorithm: 'hill-climbing',
      landscape: 'rugged',
      maxSteps: 30,
      temperature: 2,
      coolingRate: 0.95,
      randomRestarts: 0,
    }

    const run = runLocalSearch(params, 42)

    expect(run.localOptimumHit).toBe(true)
  })

  it('simulated annealing accepts worse moves and can beat hill climbing on the same rugged start', () => {
    const hill = runLocalSearch(
      {
        algorithm: 'hill-climbing',
        landscape: 'rugged',
        maxSteps: 40,
        temperature: 2.5,
        coolingRate: 0.96,
        randomRestarts: 0,
      },
      42,
    )
    const annealing = runLocalSearch(
      {
        algorithm: 'simulated-annealing',
        landscape: 'rugged',
        maxSteps: 60,
        temperature: 3.6,
        coolingRate: 0.98,
        randomRestarts: 1,
      },
      42,
    )

    expect(annealing.acceptedWorseMoves).toBeGreaterThan(0)
    expect(annealing.bestStep.score).toBeGreaterThan(hill.bestStep.score)
  })

  it('is deterministic for the same parameter set', () => {
    const params: LocalSearchParams = {
      algorithm: 'simulated-annealing',
      landscape: 'smooth',
      maxSteps: 28,
      temperature: 1.8,
      coolingRate: 0.95,
      randomRestarts: 1,
    }

    expect(deriveLocalSearchResult(params)).toEqual(deriveLocalSearchResult(params))
  })
})
