import { describe, expect, it } from 'vitest'
import { deriveMctsGameLabResult } from './logic'

describe('mcts game lab logic', () => {
  it('is deterministic for the same parameter set', () => {
    const params = {
      algorithm: 'mcts' as const,
      boardPreset: 'opening' as const,
      rolloutBudget: 140,
      explorationConstant: 1.2,
      maxDepth: 6,
      playerToMove: 'x' as const,
    }

    expect(deriveMctsGameLabResult(params)).toEqual(deriveMctsGameLabResult(params))
  })

  it('larger rollout budget increases selected move confidence on the same board', () => {
    const lowBudget = deriveMctsGameLabResult({
      algorithm: 'mcts',
      boardPreset: 'opening',
      rolloutBudget: 40,
      explorationConstant: 1.2,
      maxDepth: 6,
      playerToMove: 'x',
    })
    const highBudget = deriveMctsGameLabResult({
      algorithm: 'mcts',
      boardPreset: 'opening',
      rolloutBudget: 240,
      explorationConstant: 1.2,
      maxDepth: 6,
      playerToMove: 'x',
    })

    expect(highBudget.selectedMoveConfidence).toBeGreaterThanOrEqual(lowBudget.selectedMoveConfidence)
  })

  it('minimax and mcts both return legal moves', () => {
    const minimax = deriveMctsGameLabResult({
      algorithm: 'minimax',
      boardPreset: 'endgame',
      rolloutBudget: 80,
      explorationConstant: 1,
      maxDepth: 7,
      playerToMove: 'x',
    })
    const mcts = deriveMctsGameLabResult({
      algorithm: 'mcts',
      boardPreset: 'endgame',
      rolloutBudget: 180,
      explorationConstant: 1.1,
      maxDepth: 7,
      playerToMove: 'x',
    })

    const legalMoves = [5, 6, 7]
    expect(legalMoves).toContain(minimax.selectedMove)
    expect(legalMoves).toContain(mcts.selectedMove)
  })

  it('fork-threat preset selects a blocking or winning move depending on side to play', () => {
    const oTurn = deriveMctsGameLabResult({
      algorithm: 'minimax',
      boardPreset: 'fork-threat',
      rolloutBudget: 120,
      explorationConstant: 1,
      maxDepth: 7,
      playerToMove: 'o',
    })
    const xTurn = deriveMctsGameLabResult({
      algorithm: 'minimax',
      boardPreset: 'fork-threat',
      rolloutBudget: 120,
      explorationConstant: 1,
      maxDepth: 7,
      playerToMove: 'x',
    })

    expect([1, 3, 5, 7]).toContain(oTurn.selectedMove)
    expect([2, 6]).toContain(xTurn.selectedMove)
  })
})
