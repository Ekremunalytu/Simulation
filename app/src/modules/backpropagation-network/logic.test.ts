import { describe, expect, it } from 'vitest'
import { derivePerceptronTrainerResult } from '../perceptron-trainer/logic'
import {
  deriveBackpropagationNetworkResult,
  runBackpropagationTraining,
} from './logic'

describe('backpropagation network logic', () => {
  it('is deterministic for the same configuration', () => {
    const params = {
      learningRate: 0.12,
      epochs: 24,
      hiddenUnits: 3,
      datasetType: 'xor' as const,
      noise: 0.5,
      activation: 'tanh' as const,
    }

    expect(deriveBackpropagationNetworkResult(params)).toEqual(
      deriveBackpropagationNetworkResult(params),
    )
  })

  it('beats perceptron accuracy on xor data', () => {
    const backprop = deriveBackpropagationNetworkResult({
      learningRate: 0.12,
      epochs: 24,
      hiddenUnits: 3,
      datasetType: 'xor',
      noise: 0.5,
      activation: 'tanh',
    })
    const perceptron = derivePerceptronTrainerResult({
      learningRate: 0.12,
      epochs: 24,
      numPoints: 80,
      separation: 2,
      noise: 0.5,
      datasetType: 'xor',
    })

    expect(backprop.finalAccuracy).toBeGreaterThan(perceptron.finalAccuracy)
  })

  it('generally reduces loss over epochs', () => {
    const snapshots = runBackpropagationTraining({
      learningRate: 0.1,
      epochs: 18,
      hiddenUnits: 3,
      datasetType: 'noisy-xor',
      noise: 0.9,
      activation: 'sigmoid',
    })

    expect((snapshots.at(-1)?.loss ?? 0)).toBeLessThanOrEqual(snapshots[0]?.loss ?? 0)
  })
})
