import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveHeuristicSearchResult,
  type HeuristicSearchParams,
  type HeuristicSearchResult,
} from './logic'

const HeuristicSearchVisualization = lazy(async () => ({
  default: (await import('./Visualization')).HeuristicSearchVisualization,
}))

const defaultParams: HeuristicSearchParams = {
  algorithm: 'astar',
  heuristic: 'manhattan',
  obstacleDensity: 0.16,
  weightVariance: 4,
  tieBreakStrategy: 'lower-h',
}

const presets: PresetConfig<HeuristicSearchParams>[] = [
  {
    name: 'Clear Corridor',
    params: {
      algorithm: 'astar',
      heuristic: 'manhattan',
      obstacleDensity: 0.08,
      weightVariance: 3,
      tieBreakStrategy: 'lower-h',
    },
  },
  {
    name: 'Misleading Shortcut',
    params: {
      algorithm: 'greedy',
      heuristic: 'manhattan',
      obstacleDensity: 0.18,
      weightVariance: 6,
      tieBreakStrategy: 'lower-h',
    },
  },
  {
    name: 'Weighted Map',
    params: {
      algorithm: 'astar',
      heuristic: 'euclidean',
      obstacleDensity: 0.14,
      weightVariance: 8,
      tieBreakStrategy: 'higher-g',
    },
  },
  {
    name: 'Tight Maze',
    params: {
      algorithm: 'astar',
      heuristic: 'manhattan',
      obstacleDensity: 0.24,
      weightVariance: 5,
      tieBreakStrategy: 'higher-g',
    },
  },
]

const heuristicSearchDefinition = {
  id: 'heuristic-search',
  title: 'Heuristic Search',
  subtitle: 'Greedy Best-First vs A*',
  category: 'ml',
  description:
    'Heuristic destekli aramayi ayni harita uzerinde izle. g(n), h(n) ve f(n) degerlerinin frontier siralamasini nasil degistirdigini katman katman incele.',
  icon: '✨',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'algorithm',
      label: 'Algorithm',
      type: 'select',
      options: [
        { label: 'Greedy Best-First', value: 'greedy' },
        { label: 'A*', value: 'astar' },
      ],
    },
    {
      key: 'heuristic',
      label: 'Heuristic',
      type: 'select',
      options: [
        { label: 'Manhattan', value: 'manhattan' },
        { label: 'Euclidean', value: 'euclidean' },
      ],
    },
    {
      key: 'obstacleDensity',
      label: 'Obstacle Density',
      type: 'slider',
      min: 0.05,
      max: 0.3,
      step: 0.01,
    },
    {
      key: 'weightVariance',
      label: 'Weight Variance',
      type: 'slider',
      min: 1,
      max: 8,
      step: 1,
    },
    {
      key: 'tieBreakStrategy',
      label: 'Tie Break',
      type: 'select',
      options: [
        { label: 'Lower h(n)', value: 'lower-h' },
        { label: 'Higher g(n)', value: 'higher-g' },
      ],
    },
  ],
  formulaTeX: 'A*: f(n) = g(n) + h(n), Greedy: f(n) = h(n)',
  derive: deriveHeuristicSearchResult,
  VisualizationComponent: HeuristicSearchVisualization,
  codeExample: `import heapq

def a_star(start, goal, heuristic):
    frontier = [(heuristic(start), 0, start)]
    best_cost = {start: 0}

    while frontier:
        _, g_cost, node = heapq.heappop(frontier)
        if node == goal:
            return g_cost

        for neighbor, weight in graph[node]:
            next_cost = g_cost + weight
            if next_cost < best_cost.get(neighbor, float("inf")):
                best_cost[neighbor] = next_cost
                f_cost = next_cost + heuristic(neighbor)
                heapq.heappush(frontier, (f_cost, next_cost, neighbor))`,
} satisfies SimulationModule<HeuristicSearchParams, HeuristicSearchResult>

export const heuristicSearchModule = defineSimulationModule(heuristicSearchDefinition)
