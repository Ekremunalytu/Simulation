import { describe, expect, it } from 'vitest'
import { deriveExpertSystemInferenceResult } from './logic'

describe('expert system inference logic', () => {
  it('is deterministic for the same parameter set', () => {
    const params = {
      strategy: 'forward' as const,
      scenario: 'device-diagnosis' as const,
      goal: 'batarya-degistir',
      maxSteps: 6,
    }

    expect(deriveExpertSystemInferenceResult(params)).toEqual(
      deriveExpertSystemInferenceResult(params),
    )
  })

  it('produces a coherent proof chain when the target is reached', () => {
    const result = deriveExpertSystemInferenceResult({
      strategy: 'forward',
      scenario: 'device-diagnosis',
      goal: 'batarya-degistir',
      maxSteps: 6,
    })

    expect(result.targetReached).toBe(true)
    expect(result.proofChain.at(-1)).toContain('batarya-degistir')
  })

  it('supports both forward and backward reasoning on the same reachable goal', () => {
    const forward = deriveExpertSystemInferenceResult({
      strategy: 'forward',
      scenario: 'medical-triage',
      goal: 'acil-mudahale',
      maxSteps: 6,
    })
    const backward = deriveExpertSystemInferenceResult({
      strategy: 'backward',
      scenario: 'medical-triage',
      goal: 'acil-mudahale',
      maxSteps: 6,
    })

    expect(forward.targetReached).toBe(true)
    expect(backward.targetReached).toBe(true)
  })
})
