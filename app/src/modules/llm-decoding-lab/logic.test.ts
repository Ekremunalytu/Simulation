import { describe, expect, it } from 'vitest'
import { deriveLlmDecodingLabResult } from './logic'

describe('llm decoding lab logic', () => {
  it('keeps top-k candidate pools within the requested limit', () => {
    const result = deriveLlmDecodingLabResult({
      scenario: 'campfire-story',
      temperature: 0.9,
      topK: 2,
      topP: 0.82,
      beamWidth: 3,
      maxSteps: 4,
    })

    const topKTrace = result.strategies.find((strategy) => strategy.strategyId === 'top-k')
    expect(topKTrace).toBeDefined()
    topKTrace?.steps.forEach((step) => {
      expect(step.candidatePoolSize).toBeLessThanOrEqual(2)
    })
  })

  it('scores top-k traces in the original model distribution', () => {
    const result = deriveLlmDecodingLabResult({
      scenario: 'campfire-story',
      temperature: 0.92,
      topK: 1,
      topP: 0.82,
      beamWidth: 3,
      maxSteps: 4,
    })

    const greedy = result.strategies.find((strategy) => strategy.strategyId === 'greedy')
    const topK = result.strategies.find((strategy) => strategy.strategyId === 'top-k')

    expect(topK?.generatedTokens).toEqual(greedy?.generatedTokens)
    expect(topK?.cumulativeLogProb).toBe(greedy?.cumulativeLogProb)
  })

  it('retains at least the requested cumulative mass for top-p filtering', () => {
    const result = deriveLlmDecodingLabResult({
      scenario: 'sql-assistant',
      temperature: 0.82,
      topK: 4,
      topP: 0.78,
      beamWidth: 3,
      maxSteps: 4,
    })

    const topPTrace = result.strategies.find((strategy) => strategy.strategyId === 'top-p')
    expect(topPTrace).toBeDefined()
    expect(topPTrace?.steps.some((step) => step.candidatePoolSize < step.candidates.length)).toBe(true)
    topPTrace?.steps.forEach((step) => {
      expect(step.retainedProbability).toBeGreaterThanOrEqual(0.78 - 1e-6)
    })
  })

  it('finds a stronger overall sequence with beam search than greedy in the campfire scenario', () => {
    const result = deriveLlmDecodingLabResult({
      scenario: 'campfire-story',
      temperature: 0.92,
      topK: 3,
      topP: 0.82,
      beamWidth: 3,
      maxSteps: 4,
    })

    const greedy = result.strategies.find((strategy) => strategy.strategyId === 'greedy')
    const beam = result.strategies.find((strategy) => strategy.strategyId === 'beam')

    beam?.steps.forEach((step) => {
      expect(step.candidatePoolSize).toBeLessThanOrEqual(3)
    })
    expect(beam?.cumulativeLogProb ?? -Infinity).toBeGreaterThan(greedy?.cumulativeLogProb ?? Infinity)
  })
})
