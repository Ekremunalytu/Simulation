import { describe, expect, it } from 'vitest'
import { deriveRiemannIntegralResult } from './logic'

describe('riemann integral logic', () => {
  it('reduces approximation error as subdivisions increase for midpoint sums', () => {
    const result = deriveRiemannIntegralResult({
      functionType: 'parabola',
      startX: 0,
      endX: 3,
      subdivisions: 12,
      method: 'midpoint',
    })

    expect(result.frames[0]?.error ?? 1).toBeGreaterThan(result.frames.at(-1)?.error ?? 0)
  })
})
