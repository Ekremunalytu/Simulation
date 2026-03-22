import { describe, expect, it } from 'vitest'
import {
  detectOvershooting,
  runGradientDescent,
  type GradientDescentParams,
} from './logic'

const baseParams: GradientDescentParams = {
  learningRate: 0.05,
  iterations: 80,
  startX: 3,
  startY: 3,
  momentum: false,
  stochastic: false,
}

describe('gradient descent logic', () => {
  it('reduces loss with a conservative learning rate', () => {
    const path = runGradientDescent(baseParams)

    expect(path.at(0)?.loss ?? 0).toBeGreaterThan(path.at(-1)?.loss ?? 0)
  })

  it('shows overshooting when the learning rate is too high', () => {
    const path = runGradientDescent({
      ...baseParams,
      learningRate: 0.8,
      iterations: 20,
    })

    expect(detectOvershooting(path)).toBe(true)
  })

  it('is deterministic with momentum enabled', () => {
    const params: GradientDescentParams = {
      ...baseParams,
      momentum: true,
    }

    const firstRun = runGradientDescent(params)
    const secondRun = runGradientDescent(params)

    expect(secondRun).toEqual(firstRun)
  })

  it('keeps stochastic runs reproducible when the seed matches', () => {
    const params: GradientDescentParams = {
      ...baseParams,
      stochastic: true,
    }

    expect(runGradientDescent(params, 123)).toEqual(runGradientDescent(params, 123))
    expect(runGradientDescent(params, 123)).not.toEqual(runGradientDescent(params, 999))
  })
})
