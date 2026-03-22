import { describe, expect, it } from 'vitest'
import { buildSearchGridFromMatrix } from '../shared/search-grid'
import { deriveBlindSearchResult, runBlindSearch } from './logic'

describe('blind search logic', () => {
  it('finds a shortest path with BFS on an unweighted grid', () => {
    const grid = buildSearchGridFromMatrix([
      [1, 1, 1, 1],
      [1, -1, -1, 1],
      [1, 1, 1, 1],
      [1, 1, 1, 1],
    ])

    const run = runBlindSearch(grid, 'bfs', false)

    expect(run.solutionFound).toBe(true)
    expect(run.pathLength).toBe(6)
  })

  it('prefers lower total cost with UCS on a weighted trap map', () => {
    const grid = buildSearchGridFromMatrix([
      [1, 9, 9, 9],
      [1, 1, 1, 9],
      [9, 9, 1, 9],
      [9, 9, 1, 1],
    ])

    const bfsRun = runBlindSearch(grid, 'bfs', true)
    const ucsRun = runBlindSearch(grid, 'ucs', true)

    expect(ucsRun.solutionFound).toBe(true)
    expect(ucsRun.pathCost).toBeLessThan(bfsRun.pathCost)
  })

  it('builds deterministic timeline and metrics for the same params', () => {
    const params = {
      algorithm: 'dfs' as const,
      gridSize: 9,
      obstacleDensity: 0.18,
      weightMode: false,
      mazeComplexity: 0.72,
    }

    const first = deriveBlindSearchResult(params)
    const second = deriveBlindSearchResult(params)

    expect(second.steps).toEqual(first.steps)
    expect(second.timeline).toEqual(first.timeline)
    expect(second.metrics[0]?.value).toBe(String(first.expandedCount))
  })
})
