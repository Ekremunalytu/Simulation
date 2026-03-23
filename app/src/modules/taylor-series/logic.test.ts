import { describe, expect, it } from 'vitest'
import { deriveTaylorSeriesResult } from './logic'

describe('taylor series logic', () => {
  it('reduces the focus-point error as degree increases near the center', () => {
    const result = deriveTaylorSeriesResult({
      functionType: 'exp',
      degree: 7,
      focusX: 1,
    })

    expect(result.frames[0]?.errorAtFocus ?? 1).toBeGreaterThan(result.frames.at(-1)?.errorAtFocus ?? 0)
  })
})
