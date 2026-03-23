import { describe, expect, it } from 'vitest'
import { derivePerceptronTrainerResult, runPerceptronTraining } from './logic'
import { generateTwoClassDataset } from '../shared/ml-datasets'

describe('perceptron trainer logic', () => {
  it('reduces mistakes on linearly separable data', () => {
    const params = {
      learningRate: 0.18,
      epochs: 20,
      numPoints: 60,
      separation: 2.6,
      noise: 0.8,
      datasetType: 'separable' as const,
    }
    const data = generateTwoClassDataset({
      numPoints: params.numPoints,
      separation: params.separation,
      noise: params.noise,
      shape: params.datasetType,
    })
    const snapshots = runPerceptronTraining(params, data)

    expect((snapshots.at(-1)?.mistakes ?? 0)).toBeLessThanOrEqual(snapshots[0]?.mistakes ?? 0)
  })

  it('does not fully converge on xor data', () => {
    const result = derivePerceptronTrainerResult({
      learningRate: 0.12,
      epochs: 24,
      numPoints: 80,
      separation: 2,
      noise: 0.7,
      datasetType: 'xor',
    })

    expect(result.finalMistakes).toBeGreaterThan(0)
  })

  it('is deterministic for the same configuration', () => {
    const params = {
      learningRate: 0.14,
      epochs: 18,
      numPoints: 70,
      separation: 1.8,
      noise: 1.1,
      datasetType: 'borderline' as const,
    }

    expect(derivePerceptronTrainerResult(params)).toEqual(derivePerceptronTrainerResult(params))
  })
})
