import { describe, expect, it } from 'vitest'
import { deriveNaiveBayesClassifierResult } from './logic'

describe('naive bayes classifier logic', () => {
  it('is deterministic for the same parameter set', () => {
    const params = {
      numPoints: 70,
      separation: 2.3,
      noise: 1,
      distributionType: 'balanced' as const,
      queryX: 0.4,
      queryY: 0.2,
      smoothing: true,
    }

    expect(deriveNaiveBayesClassifierResult(params)).toEqual(
      deriveNaiveBayesClassifierResult(params),
    )
  })

  it('produces posterior probabilities that sum to one', () => {
    const result = deriveNaiveBayesClassifierResult({
      numPoints: 80,
      separation: 2.1,
      noise: 0.9,
      distributionType: 'balanced',
      queryX: 0.3,
      queryY: 0.1,
      smoothing: true,
    })

    const totalPosterior = result.classStats.reduce((sum, item) => sum + item.posterior, 0)
    expect(totalPosterior).toBeCloseTo(1, 6)
  })

  it('changes variance floor when smoothing is toggled', () => {
    const withSmoothing = deriveNaiveBayesClassifierResult({
      numPoints: 80,
      separation: 2.4,
      noise: 0.6,
      distributionType: 'imbalanced',
      queryX: 0.1,
      queryY: 0.1,
      smoothing: true,
    })
    const withoutSmoothing = deriveNaiveBayesClassifierResult({
      numPoints: 80,
      separation: 2.4,
      noise: 0.6,
      distributionType: 'imbalanced',
      queryX: 0.1,
      queryY: 0.1,
      smoothing: false,
    })

    expect(withSmoothing.classStats[0]?.varianceX).toBeGreaterThan(
      withoutSmoothing.classStats[0]?.varianceX ?? 0,
    )
  })

  it('does not inject an extra variance floor when smoothing is disabled', () => {
    const withSmoothing = deriveNaiveBayesClassifierResult({
      numPoints: 80,
      separation: 2.4,
      noise: 0.6,
      distributionType: 'imbalanced',
      queryX: 0.1,
      queryY: 0.1,
      smoothing: true,
    })
    const withoutSmoothing = deriveNaiveBayesClassifierResult({
      numPoints: 80,
      separation: 2.4,
      noise: 0.6,
      distributionType: 'imbalanced',
      queryX: 0.1,
      queryY: 0.1,
      smoothing: false,
    })

    withSmoothing.classStats.forEach((stats, index) => {
      expect(stats.varianceX - (withoutSmoothing.classStats[index]?.varianceX ?? 0)).toBeCloseTo(
        0.18,
        6,
      )
      expect(stats.varianceY - (withoutSmoothing.classStats[index]?.varianceY ?? 0)).toBeCloseTo(
        0.18,
        6,
      )
    })
  })
})
