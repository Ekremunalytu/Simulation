import { describe, expect, it } from 'vitest'
import { deriveBayesianNetworkInferenceResult } from './logic'

describe('bayesian network inference logic', () => {
  it('prior table sums to 1', () => {
    const result = deriveBayesianNetworkInferenceResult({
      targetNode: 'pass-course',
      studyHabit: 'medium',
      attendance: 'high',
      examDifficulty: 'easy',
      showEvidence: false,
      inferenceFocus: 'prior',
    })

    const total = result.priorTable.reduce((sum, row) => sum + row.probability, 0)
    expect(total).toBeCloseTo(1, 6)
  })

  it('evidence changes target posterior in the expected direction', () => {
    const prior = deriveBayesianNetworkInferenceResult({
      targetNode: 'high-grade',
      studyHabit: 'low',
      attendance: 'low',
      examDifficulty: 'hard',
      showEvidence: false,
      inferenceFocus: 'prior',
    })
    const withEvidence = deriveBayesianNetworkInferenceResult({
      targetNode: 'high-grade',
      studyHabit: 'high',
      attendance: 'high',
      examDifficulty: 'easy',
      showEvidence: true,
      inferenceFocus: 'multi-evidence',
    })

    const priorYes = prior.priorTable.find((row) => row.state === 'yes')?.probability ?? 0
    const posteriorYes = withEvidence.posteriorTable.find((row) => row.state === 'yes')?.probability ?? 0
    expect(posteriorYes).toBeGreaterThan(priorYes)
  })

  it('multi-evidence creates a larger delta than a neutral single evidence case', () => {
    const single = deriveBayesianNetworkInferenceResult({
      targetNode: 'gets-recommendation',
      studyHabit: 'medium',
      attendance: 'high',
      examDifficulty: 'easy',
      showEvidence: true,
      inferenceFocus: 'single-evidence',
    })
    const multi = deriveBayesianNetworkInferenceResult({
      targetNode: 'gets-recommendation',
      studyHabit: 'high',
      attendance: 'high',
      examDifficulty: 'easy',
      showEvidence: true,
      inferenceFocus: 'multi-evidence',
    })

    expect(Math.abs(multi.targetProbabilityDelta)).toBeGreaterThanOrEqual(
      Math.abs(single.targetProbabilityDelta),
    )
  })

  it('is deterministic for the same parameter set', () => {
    const params = {
      targetNode: 'pass-course' as const,
      studyHabit: 'medium' as const,
      attendance: 'high' as const,
      examDifficulty: 'hard' as const,
      showEvidence: true,
      inferenceFocus: 'single-evidence' as const,
    }

    expect(deriveBayesianNetworkInferenceResult(params)).toEqual(
      deriveBayesianNetworkInferenceResult(params),
    )
  })
})
