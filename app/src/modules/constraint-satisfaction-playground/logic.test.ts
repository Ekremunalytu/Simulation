import { describe, expect, it } from 'vitest'
import { deriveConstraintSatisfactionResult } from './logic'

describe('constraint satisfaction playground logic', () => {
  it('plain backtracking solves triangle with enough colors', () => {
    const result = deriveConstraintSatisfactionResult({
      solver: 'plain-backtracking',
      graphPreset: 'triangle',
      colorCount: 3,
      maxSteps: 40,
      variableOrderBias: 'static',
    })

    expect(result.solved).toBe(true)
    expect(result.assignmentsByStep.at(-1)?.A).toBeTruthy()
  })

  it('fails triangle cleanly with two colors', () => {
    const result = deriveConstraintSatisfactionResult({
      solver: 'plain-backtracking',
      graphPreset: 'triangle',
      colorCount: 2,
      maxSteps: 40,
      variableOrderBias: 'static',
    })

    expect(result.solved).toBe(false)
    expect(result.conflicts.length).toBeGreaterThan(0)
  })

  it('heuristic solver uses fewer backtracks than plain backtracking on dense graph', () => {
    const plain = deriveConstraintSatisfactionResult({
      solver: 'plain-backtracking',
      graphPreset: 'dense-six-node',
      colorCount: 3,
      maxSteps: 120,
      variableOrderBias: 'static',
    })
    const heuristic = deriveConstraintSatisfactionResult({
      solver: 'mrv-forward-checking',
      graphPreset: 'dense-six-node',
      colorCount: 3,
      maxSteps: 120,
      variableOrderBias: 'high-degree',
    })

    expect(heuristic.backtrackCount).toBeLessThanOrEqual(plain.backtrackCount)
  })

  it('ac3 prunes domains before assignments begin on dense preset', () => {
    const result = deriveConstraintSatisfactionResult({
      solver: 'ac3-assisted',
      graphPreset: 'dense-six-node',
      colorCount: 3,
      maxSteps: 120,
      variableOrderBias: 'high-degree',
    })

    const firstPrune = result.domainsByStep.find((step) => step.type === 'prune')
    const firstAssign = result.domainsByStep.find((step) => step.type === 'assign')

    expect(firstPrune).toBeTruthy()
    expect(firstAssign).toBeTruthy()
    expect((firstPrune?.step ?? 0) < (firstAssign?.step ?? 0)).toBe(true)
  })
})
