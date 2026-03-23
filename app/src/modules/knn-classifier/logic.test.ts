import { describe, expect, it } from 'vitest'
import {
  calculateDistance,
  deriveKNNClassifierResult,
  rankNeighbors,
  summarizeVotes,
} from './logic'

describe('knn classifier logic', () => {
  it('orders neighbors by increasing distance', () => {
    const neighbors = rankNeighbors(
      [
        { id: 'a', x: 0, y: 0, label: 0 },
        { id: 'b', x: 2, y: 0, label: 1 },
        { id: 'c', x: 1, y: 0, label: 0 },
      ],
      { x: 0, y: 0 },
      { distanceMetric: 'euclidean', weightedVote: false, k: 3 },
    )

    expect(neighbors.map((item) => item.id)).toEqual(['a', 'c', 'b'])
  })

  it('changes vote strength when weighted vote is enabled', () => {
    const unweighted = summarizeVotes(
      rankNeighbors(
        [
          { id: 'a', x: 0, y: 0, label: 0 },
          { id: 'b', x: 0.2, y: 0, label: 1 },
          { id: 'c', x: 5, y: 0, label: 1 },
        ],
        { x: 0, y: 0 },
        { distanceMetric: 'euclidean', weightedVote: false, k: 3 },
      ),
    )
    const weighted = summarizeVotes(
      rankNeighbors(
        [
          { id: 'a', x: 0, y: 0, label: 0 },
          { id: 'b', x: 0.2, y: 0, label: 1 },
          { id: 'c', x: 5, y: 0, label: 1 },
        ],
        { x: 0, y: 0 },
        { distanceMetric: 'euclidean', weightedVote: true, k: 3 },
      ),
    )

    expect(unweighted[0]?.weight).toBe(1)
    expect(weighted[0]?.weight).toBeGreaterThan(1)
  })

  it('produces stable outputs for the same parameters', () => {
    const params = {
      k: 5,
      numPoints: 60,
      separation: 2.4,
      noise: 1.2,
      distanceMetric: 'euclidean' as const,
      queryX: 0.4,
      queryY: 0.2,
      weightedVote: true,
    }

    expect(deriveKNNClassifierResult(params)).toEqual(deriveKNNClassifierResult(params))
    expect(calculateDistance('manhattan', { x: 0, y: 0 }, { x: 2, y: -3 })).toBe(5)
  })
})
