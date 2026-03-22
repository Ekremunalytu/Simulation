import { describe, expect, it } from 'vitest'
import { deriveGeneticAlgorithmResult, runGeneticAlgorithm } from './logic'

describe('genetic algorithm logic', () => {
  it('keeps best distance non-increasing with elitism', () => {
    const run = runGeneticAlgorithm(
      {
        cityCount: 10,
        populationSize: 24,
        mutationRate: 0.08,
        crossoverRate: 0.8,
        eliteCount: 2,
        generations: 20,
      },
      42,
    )

    const bestDistances = run.generationsData.map((snapshot) => snapshot.bestDistance)

    expect(bestDistances.every((distance, index) => index === 0 || distance <= (bestDistances[index - 1] as number))).toBe(true)
  })

  it('is deterministic for the same parameter set', () => {
    const params = {
      cityCount: 12,
      populationSize: 28,
      mutationRate: 0.08,
      crossoverRate: 0.84,
      eliteCount: 2,
      generations: 30,
    }

    expect(deriveGeneticAlgorithmResult(params)).toEqual(deriveGeneticAlgorithmResult(params))
  })

  it('reports convergence generation within timeline bounds', () => {
    const result = deriveGeneticAlgorithmResult({
      cityCount: 11,
      populationSize: 26,
      mutationRate: 0.05,
      crossoverRate: 0.88,
      eliteCount: 3,
      generations: 25,
    })

    expect(result.convergenceGeneration).toBeGreaterThanOrEqual(0)
    expect(result.convergenceGeneration).toBeLessThanOrEqual(result.generationsData.length - 1)
  })
})
