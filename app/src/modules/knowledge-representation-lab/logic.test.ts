import { describe, expect, it } from 'vitest'
import { deriveKnowledgeRepresentationResult } from './logic'

describe('knowledge representation lab logic', () => {
  it('reaches supervised learning with forward chaining when labelled data exists', () => {
    const result = deriveKnowledgeRepresentationResult({
      strategy: 'forward',
      goal: 'supervised-learning',
      labelledDataAvailable: true,
      rewardSignalAvailable: false,
      stateTransitionsKnown: false,
      explanationRequired: false,
      contentGenerationNeeded: false,
      pathCostRelevant: false,
      maxSteps: 6,
    })

    expect(result.goalReached).toBe(true)
    expect(result.derivedFacts).toContain('supervised-learning')
  })

  it('reaches search with backward chaining when transitions and path cost are present', () => {
    const result = deriveKnowledgeRepresentationResult({
      strategy: 'backward',
      goal: 'search',
      labelledDataAvailable: false,
      rewardSignalAvailable: false,
      stateTransitionsKnown: true,
      explanationRequired: false,
      contentGenerationNeeded: false,
      pathCostRelevant: true,
      maxSteps: 6,
    })

    expect(result.goalReached).toBe(true)
    expect(result.proofChain.at(-1)).toContain('Search')
  })

  it('fails generative-ai when generation exists but labelled data is off', () => {
    const result = deriveKnowledgeRepresentationResult({
      strategy: 'forward',
      goal: 'generative-ai',
      labelledDataAvailable: false,
      rewardSignalAvailable: false,
      stateTransitionsKnown: false,
      explanationRequired: false,
      contentGenerationNeeded: true,
      pathCostRelevant: false,
      maxSteps: 6,
    })

    expect(result.goalReached).toBe(false)
    expect(result.blockedRules.some((entry) => entry.unmetFacts.includes('labelled-data-available'))).toBe(true)
  })

  it('halts before completion when maxSteps is too low', () => {
    const result = deriveKnowledgeRepresentationResult({
      strategy: 'forward',
      goal: 'supervised-learning',
      labelledDataAvailable: true,
      rewardSignalAvailable: false,
      stateTransitionsKnown: false,
      explanationRequired: false,
      contentGenerationNeeded: false,
      pathCostRelevant: false,
      maxSteps: 1,
    })

    expect(result.goalReached).toBe(false)
    expect(result.derivedFacts).toContain('pattern-learning-possible')
    expect(result.derivedFacts).not.toContain('supervised-learning')
  })

  it('keeps proof chains with rule ids for successful inference', () => {
    const result = deriveKnowledgeRepresentationResult({
      strategy: 'forward',
      goal: 'generative-ai',
      labelledDataAvailable: true,
      rewardSignalAvailable: false,
      stateTransitionsKnown: false,
      explanationRequired: false,
      contentGenerationNeeded: true,
      pathCostRelevant: false,
      maxSteps: 8,
    })

    expect(result.goalReached).toBe(true)
    expect(result.proofChain.some((item) => item.includes('R9'))).toBe(true)
    expect(result.proofChain.some((item) => item.includes('R10'))).toBe(true)
  })

  it('exposes unmet facts for blocked backward chaining goals', () => {
    const result = deriveKnowledgeRepresentationResult({
      strategy: 'backward',
      goal: 'symbolic-ai',
      labelledDataAvailable: false,
      rewardSignalAvailable: false,
      stateTransitionsKnown: true,
      explanationRequired: false,
      contentGenerationNeeded: false,
      pathCostRelevant: false,
      maxSteps: 6,
    })

    expect(result.goalReached).toBe(false)
    expect(result.blockedRules.some((entry) => entry.unmetFacts.includes('explanation-required'))).toBe(true)
  })
})
