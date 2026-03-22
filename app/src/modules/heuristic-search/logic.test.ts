import { describe, expect, it } from 'vitest'
import { buildSearchGridFromMatrix } from '../shared/search-grid'
import { runBlindSearch } from '../blind-search/logic'
import { deriveHeuristicSearchResult, runHeuristicSearch } from './logic'

describe('heuristic search logic', () => {
  it('matches UCS optimal cost when A* uses an admissible heuristic', () => {
    const grid = buildSearchGridFromMatrix([
      [1, 1, 4, 4, 4],
      [4, 1, 1, 1, 4],
      [4, 4, 4, 1, 4],
      [4, 1, 1, 1, 1],
      [4, 4, 4, 4, 1],
    ])

    const ucs = runBlindSearch(grid, 'ucs', true)
    const astar = runHeuristicSearch(grid, 'astar', 'manhattan', 'lower-h')

    expect(astar.finalCost).toBeCloseTo(ucs.pathCost, 6)
  })

  it('greedy expands a different search trace than A* on the same map', () => {
    const grid = buildSearchGridFromMatrix([
      [1, 1, 1, 8, 8],
      [8, 8, 1, 8, 1],
      [1, 1, 1, 8, 1],
      [1, 8, 8, 8, 1],
      [1, 1, 1, 1, 1],
    ])

    const greedy = runHeuristicSearch(grid, 'greedy', 'manhattan', 'lower-h')
    const astar = runHeuristicSearch(grid, 'astar', 'manhattan', 'lower-h')

    expect(greedy.steps).not.toEqual(astar.steps)
    expect(astar.finalCost).toBeLessThanOrEqual(greedy.finalCost)
  })

  it('is deterministic for the same parameter set', () => {
    const params = {
      algorithm: 'astar' as const,
      heuristic: 'euclidean' as const,
      obstacleDensity: 0.18,
      weightVariance: 6,
      tieBreakStrategy: 'higher-g' as const,
    }

    const first = deriveHeuristicSearchResult(params)
    const second = deriveHeuristicSearchResult(params)

    expect(second.progress).toEqual(first.progress)
    expect(second.finalPathKeys).toEqual(first.finalPathKeys)
  })
})
