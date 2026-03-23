import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveBlindSearchResult,
  type BlindSearchParams,
  type BlindSearchResult,
} from './logic'

const BlindSearchVisualization = lazy(async () => ({
  default: (await import('./Visualization')).BlindSearchVisualization,
}))

const defaultParams: BlindSearchParams = {
  algorithm: 'bfs',
  gridSize: 9,
  obstacleDensity: 0.16,
  weightMode: false,
  mazeComplexity: 0.58,
}

const presets: PresetConfig<BlindSearchParams>[] = [
  {
    name: 'Açık Izgara',
    params: {
      algorithm: 'bfs',
      gridSize: 8,
      obstacleDensity: 0.08,
      weightMode: false,
      mazeComplexity: 0.45,
    },
  },
  {
    name: 'Çıkmazlar',
    params: {
      algorithm: 'dfs',
      gridSize: 10,
      obstacleDensity: 0.2,
      weightMode: false,
      mazeComplexity: 0.82,
    },
  },
  {
    name: 'Ağırlıklı Tuzak',
    params: {
      algorithm: 'ucs',
      gridSize: 9,
      obstacleDensity: 0.14,
      weightMode: true,
      mazeComplexity: 0.62,
    },
  },
  {
    name: 'Yoğun Labirent',
    params: {
      algorithm: 'bfs',
      gridSize: 11,
      obstacleDensity: 0.26,
      weightMode: false,
      mazeComplexity: 0.78,
    },
  },
]

const blindSearchDefinition = {
  id: 'blind-search',
  title: 'Kör Arama',
  subtitle: 'Aynı Durum Uzayında BFS, DFS ve UCS',
  category: 'ml',
  description:
    'Klasik uninformed search stratejilerini aynı ızgara üzerinde karşılaştır. Frontier büyüklüğü, açılan düğüm sayısı ve yol maliyeti farkları adım adım görünür.',
  icon: '🧭',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'algorithm',
      label: 'Algoritma',
      type: 'select',
      options: [
        { label: 'BFS', value: 'bfs' },
        { label: 'DFS', value: 'dfs' },
        { label: 'UCS', value: 'ucs' },
      ],
    },
    {
      key: 'gridSize',
      label: 'Izgara Boyutu',
      type: 'slider',
      min: 6,
      max: 12,
      step: 1,
    },
    {
      key: 'obstacleDensity',
      label: 'Engel Yoğunluğu',
      type: 'slider',
      min: 0.05,
      max: 0.32,
      step: 0.01,
    },
    {
      key: 'weightMode',
      label: 'Ağırlıklı Mod',
      type: 'toggle',
    },
    {
      key: 'mazeComplexity',
      label: 'Labirent Karmaşıklığı',
      type: 'slider',
      min: 0.3,
      max: 0.9,
      step: 0.01,
    },
  ],
  formulaTeX:
    'BFS: FIFO frontier, DFS: LIFO frontier, UCS: choose node with minimum g(n)',
  derive: deriveBlindSearchResult,
  VisualizationComponent: BlindSearchVisualization,
  codeExample: `from collections import deque
import heapq

def uniform_cost_search(graph, start, goal):
    frontier = [(0, start)]
    visited = set()

    while frontier:
        cost, node = heapq.heappop(frontier)
        if node in visited:
            continue
        if node == goal:
            return cost
        visited.add(node)

        for neighbor, weight in graph[node]:
            heapq.heappush(frontier, (cost + weight, neighbor))`,
} satisfies SimulationModule<BlindSearchParams, BlindSearchResult>

export const blindSearchModule = defineSimulationModule(blindSearchDefinition)
