import { describe, expect, it } from 'vitest'
import { deriveMinimaxAlphaBetaResult } from './logic'

describe('minimax alpha-beta logic', () => {
  it('keeps the same best move with and without pruning', () => {
    const withPruning = deriveMinimaxAlphaBetaResult({
      pruning: true,
      depthLimit: 5,
      scenario: 'fork-threat',
      opponentStyle: 'optimal',
    })
    const withoutPruning = deriveMinimaxAlphaBetaResult({
      pruning: false,
      depthLimit: 5,
      scenario: 'fork-threat',
      opponentStyle: 'optimal',
    })

    expect(withPruning.chosenMove).toBe(withoutPruning.chosenMove)
    expect(withPruning.utilityScore).toBe(withoutPruning.utilityScore)
  })

  it('evaluates fewer or equal nodes when pruning is enabled', () => {
    const withPruning = deriveMinimaxAlphaBetaResult({
      pruning: true,
      depthLimit: 6,
      scenario: 'deep-tree',
      opponentStyle: 'optimal',
    })
    const withoutPruning = deriveMinimaxAlphaBetaResult({
      pruning: false,
      depthLimit: 6,
      scenario: 'deep-tree',
      opponentStyle: 'optimal',
    })

    expect(withPruning.evaluatedNodes).toBeLessThanOrEqual(withoutPruning.evaluatedNodes)
  })

  it('is deterministic for the same scenario', () => {
    const params = {
      pruning: true as const,
      depthLimit: 4,
      scenario: 'forced-block' as const,
      opponentStyle: 'imperfect' as const,
    }

    expect(deriveMinimaxAlphaBetaResult(params)).toEqual(deriveMinimaxAlphaBetaResult(params))
  })
})
