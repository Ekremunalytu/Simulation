import { describe, expect, it } from 'vitest'
import {
  buildTreeWithOrder,
  calculateEntropy,
  calculateGini,
  countLeaves,
  countNodes,
  generateClassificationData,
  treeDepth,
} from './logic'

describe('decision tree logic', () => {
  it('computes gini and entropy for a balanced split', () => {
    const sample = [
      { x: 0, y: 0, label: 0 },
      { x: 1, y: 1, label: 0 },
      { x: 2, y: 2, label: 1 },
      { x: 3, y: 3, label: 1 },
    ]

    expect(calculateGini(sample)).toBeCloseTo(0.5, 6)
    expect(calculateEntropy(sample)).toBeCloseTo(1, 6)
  })

  it('respects stopping conditions from max depth', () => {
    const data = generateClassificationData(40, 2, 42)
    const { tree } = buildTreeWithOrder(data, 1, 1, 'gini')

    expect(treeDepth(tree)).toBeLessThanOrEqual(1)
  })

  it('respects stopping conditions from min samples', () => {
    const data = generateClassificationData(12, 2, 42)
    const { tree } = buildTreeWithOrder(data, 5, 50, 'gini')

    expect(tree.left).toBeUndefined()
    expect(tree.right).toBeUndefined()
  })

  it('returns stable counts and build order metadata', () => {
    const data = generateClassificationData(60, 2.5, 42)
    const { tree, buildOrder } = buildTreeWithOrder(data, 4, 3, 'entropy')

    expect(buildOrder[0]).toBe('0')
    expect(countNodes(tree)).toBeGreaterThanOrEqual(countLeaves(tree))
    expect(buildOrder).toHaveLength(countNodes(tree))
  })
})
