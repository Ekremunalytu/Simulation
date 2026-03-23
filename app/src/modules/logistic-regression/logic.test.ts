import { describe, expect, it } from 'vitest'
import {
  deriveLogisticRegressionResult,
  runLogisticRegressionTraining,
  type LogisticRegressionParams,
} from './logic'

const baseParams: LogisticRegressionParams = {
  numPoints: 70,
  separation: 2.4,
  noise: 0.8,
  learningRate: 0.12,
  epochs: 24,
  regularization: 0.05,
  datasetType: 'separable',
}

describe('logistic regression logic', () => {
  it('reduces loss on low-noise data', () => {
    const frames = runLogisticRegressionTraining(baseParams)

    expect(frames.at(0)?.loss ?? 0).toBeGreaterThan(frames.at(-1)?.loss ?? 0)
  })

  it('improves accuracy during training', () => {
    const frames = runLogisticRegressionTraining(baseParams)

    expect(frames.at(-1)?.accuracy ?? 0).toBeGreaterThanOrEqual(frames.at(0)?.accuracy ?? 0)
  })

  it('is deterministic for the same parameters', () => {
    expect(deriveLogisticRegressionResult(baseParams)).toEqual(
      deriveLogisticRegressionResult(baseParams),
    )
  })
})
