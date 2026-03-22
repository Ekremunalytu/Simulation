import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  generateSearchGrid,
  type SearchGrid,
  type SearchGridCell,
  pointKey,
  parsePointKey,
  getNeighbors,
} from '../shared/search-grid'

export interface BlindSearchParams extends SimulationParamsBase {
  algorithm: 'bfs' | 'dfs' | 'ucs'
  gridSize: number
  obstacleDensity: number
  weightMode: boolean
  mazeComplexity: number
}

export interface FrontierEntry {
  key: string
  x: number
  y: number
  priority: number
  cost: number
}

export interface BlindSearchStep {
  expandedKey: string
  frontier: FrontierEntry[]
  expandedKeys: string[]
  currentPathKeys: string[]
  currentPathCost: number
  frontierPeak: number
}

export interface BlindSearchProgressPoint {
  step: number
  expanded: number
  frontier: number
  pathCost: number
}

export interface BlindSearchResult extends SimulationResultBase {
  grid: SearchGrid
  steps: BlindSearchStep[]
  progress: BlindSearchProgressPoint[]
  finalPathKeys: string[]
  pathCost: number
  pathLength: number
  expandedCount: number
  frontierPeak: number
  solutionFound: boolean
}

interface SearchNode {
  key: string
  point: { x: number; y: number }
  cost: number
  priority: number
}

interface BlindSearchRun {
  steps: BlindSearchStep[]
  finalPathKeys: string[]
  pathCost: number
  pathLength: number
  expandedCount: number
  frontierPeak: number
  solutionFound: boolean
}

function reconstructPath(
  parents: Map<string, string | null>,
  currentKey: string,
): string[] {
  const path: string[] = []
  let cursor: string | null = currentKey

  while (cursor) {
    path.unshift(cursor)
    cursor = parents.get(cursor) ?? null
  }

  return path
}

function sortFrontierForDisplay(frontier: SearchNode[]): FrontierEntry[] {
  return [...frontier]
    .sort((left, right) => left.priority - right.priority || left.cost - right.cost)
    .slice(0, 10)
    .map((node) => ({
      key: node.key,
      x: node.point.x,
      y: node.point.y,
      priority: node.priority,
      cost: node.cost,
    }))
}

function nextNodesForAlgorithm(
  algorithm: BlindSearchParams['algorithm'],
  frontier: SearchNode[],
): SearchNode | undefined {
  if (algorithm === 'dfs') {
    return frontier.pop()
  }

  if (algorithm === 'ucs') {
    frontier.sort((left, right) => left.priority - right.priority || left.cost - right.cost)
  }

  return frontier.shift()
}

function neighborTraversalOrder(
  algorithm: BlindSearchParams['algorithm'],
  neighbors: SearchGridCell[],
): SearchGridCell[] {
  if (algorithm === 'dfs') {
    return [...neighbors].reverse()
  }

  return neighbors
}

export function runBlindSearch(
  grid: SearchGrid,
  algorithm: BlindSearchParams['algorithm'],
  weightMode: boolean,
): BlindSearchRun {
  const startKey = pointKey(grid.start)
  const goalKey = pointKey(grid.goal)
  const frontier: SearchNode[] = [
    {
      key: startKey,
      point: grid.start,
      cost: 0,
      priority: 0,
    },
  ]
  const parents = new Map<string, string | null>([[startKey, null]])
  const bestCosts = new Map<string, number>([[startKey, 0]])
  const discovered = new Set<string>([startKey])
  const expandedSet = new Set<string>()
  const expandedOrder: string[] = []
  const steps: BlindSearchStep[] = []
  let finalPathKeys: string[] = []
  let pathCost = 0
  let frontierPeak = 1

  while (frontier.length > 0) {
    frontierPeak = Math.max(frontierPeak, frontier.length)
    const current = nextNodesForAlgorithm(algorithm, frontier)

    if (!current || expandedSet.has(current.key)) {
      continue
    }

    const bestKnownCost = bestCosts.get(current.key)
    if (algorithm === 'ucs' && bestKnownCost !== undefined && current.cost > bestKnownCost) {
      continue
    }

    expandedSet.add(current.key)
    expandedOrder.push(current.key)

    if (current.key === goalKey) {
      finalPathKeys = reconstructPath(parents, current.key)
      pathCost = current.cost
      steps.push({
        expandedKey: current.key,
        frontier: sortFrontierForDisplay(frontier),
        expandedKeys: [...expandedOrder],
        currentPathKeys: finalPathKeys,
        currentPathCost: pathCost,
        frontierPeak,
      })
      break
    }

    const neighbors = neighborTraversalOrder(
      algorithm,
      getNeighbors(grid, current.point),
    )

    for (const neighbor of neighbors) {
      const stepCost = weightMode ? neighbor.weight : 1
      const nextCost = current.cost + stepCost
      const recordedCost = bestCosts.get(neighbor.key)

      if (algorithm === 'ucs') {
        if (recordedCost !== undefined && nextCost >= recordedCost) {
          continue
        }

        bestCosts.set(neighbor.key, nextCost)
        parents.set(neighbor.key, current.key)
        frontier.push({
          key: neighbor.key,
          point: neighbor,
          cost: nextCost,
          priority: nextCost,
        })
        continue
      }

      if (discovered.has(neighbor.key)) {
        continue
      }

      discovered.add(neighbor.key)
      bestCosts.set(neighbor.key, nextCost)
      parents.set(neighbor.key, current.key)
      frontier.push({
        key: neighbor.key,
        point: neighbor,
        cost: nextCost,
        priority: algorithm === 'bfs' ? expandedOrder.length : expandedOrder.length + 0.5,
      })
    }

    const currentPathKeys = reconstructPath(parents, current.key)
    steps.push({
      expandedKey: current.key,
      frontier: sortFrontierForDisplay(frontier),
      expandedKeys: [...expandedOrder],
      currentPathKeys,
      currentPathCost: current.cost,
      frontierPeak,
    })
  }

  return {
    steps,
    finalPathKeys,
    pathCost,
    pathLength: finalPathKeys.length > 0 ? finalPathKeys.length - 1 : 0,
    expandedCount: expandedOrder.length,
    frontierPeak,
    solutionFound: finalPathKeys.length > 0,
  }
}

function buildProgress(steps: BlindSearchStep[]): BlindSearchProgressPoint[] {
  return steps.map((step, index) => ({
    step: index + 1,
    expanded: step.expandedKeys.length,
    frontier: step.frontier.length,
    pathCost: step.currentPathCost,
  }))
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Frontier Baskisi',
      change: 'Grid size ve obstacle density degerlerini birlikte artir, sonra BFS ile yeniden calistir.',
      expectation:
        'BFS genis bir katman yayilimi yaptigi icin frontier peak hizla buyur; bu, memory maliyetini gozle gorulur hale getirir.',
    },
    {
      title: 'DFS Tuzagi',
      change: 'Maze complexity yuksek bir durumda DFS sec ve weighted modu kapali tut.',
      expectation:
        'DFS erken bir koridora sapip goal yolunu gec bulabilir; expanded node sayisi bazen dusuk olsa da path quality garanti edilmez.',
    },
    {
      title: 'Cost Duyarliligi',
      change: 'Weighted modu ac, sonra ayni haritada BFS ile UCS arasinda gecis yap.',
      expectation:
        'UCS daha dusuk total path cost icin bazen daha uzun route secer; BFS ise adim sayisini takip eder ama agir huceleri gormezden gelir.',
    },
  ]
}

function buildTimeline(steps: BlindSearchStep[]): SimulationTimeline {
  return {
    frames: steps.map((step, index) => {
      const point = parsePointKey(step.expandedKey)

      return {
        label: `${index + 1}. expansion -> (${point.x}, ${point.y})`,
      }
    }),
  }
}

function deriveSeed(params: BlindSearchParams): number {
  return (
    1000 +
    params.gridSize * 13 +
    Math.round(params.obstacleDensity * 100) * 17 +
    Math.round(params.mazeComplexity * 100) * 19 +
    (params.weightMode ? 23 : 0) +
    (params.algorithm === 'dfs' ? 29 : params.algorithm === 'ucs' ? 31 : 0)
  )
}

export function deriveBlindSearchResult(
  params: BlindSearchParams,
): BlindSearchResult {
  const grid = generateSearchGrid({
    size: params.gridSize,
    obstacleDensity: params.obstacleDensity,
    weightVariance: params.weightMode ? 8 : 1,
    branchBias: params.mazeComplexity,
    seed: deriveSeed(params),
  })
  const run = runBlindSearch(grid, params.algorithm, params.weightMode)
  const progress = buildProgress(run.steps)
  const efficiency =
    run.expandedCount === 0
      ? 0
      : ((run.pathLength + 1) / run.expandedCount) * 100

  return {
    grid,
    steps: run.steps,
    progress,
    finalPathKeys: run.finalPathKeys,
    pathCost: run.pathCost,
    pathLength: run.pathLength,
    expandedCount: run.expandedCount,
    frontierPeak: run.frontierPeak,
    solutionFound: run.solutionFound,
    metrics: [
      {
        label: 'Expanded Nodes',
        value: String(run.expandedCount),
        tone: 'primary',
      },
      {
        label: 'Frontier Peak',
        value: String(run.frontierPeak),
        tone: 'secondary',
      },
      {
        label: 'Path Length',
        value: run.solutionFound ? String(run.pathLength) : 'No path',
        tone: run.solutionFound ? 'neutral' : 'warning',
      },
      {
        label: 'Path Cost',
        value: run.solutionFound ? run.pathCost.toFixed(1) : 'Blocked',
        tone: params.algorithm === 'ucs' ? 'secondary' : 'tertiary',
      },
      {
        label: 'Search Efficiency',
        value: `${efficiency.toFixed(1)}%`,
        tone: efficiency > 45 ? 'secondary' : 'neutral',
      },
    ],
    learning: {
      summary: `${params.algorithm.toUpperCase()} ayni grid ustunde ${params.gridSize}x${params.gridSize} durum uzayini geziyor ve frontier davranisini adim adim gorunur hale getiriyor.`,
      interpretation:
        params.algorithm === 'bfs'
          ? 'BFS katman katman ilerledigi icin unweighted ortamlarda shortest path bulur; bunun bedeli ise genis frontier ve yuksek memory baskisidir.'
          : params.algorithm === 'dfs'
            ? 'DFS derine inmeyi tercih ettigi icin bazen hizli bir cozum bulur, bazen de uzun koridorlarda takilir; completeness ve path quality haritaya daha duyarli hale gelir.'
            : 'UCS frontier icinde en dusuk g(n) degerini sectigi icin weighted ortamlarda optimal path cost hedefler; bu, ekstra queue bookkeeping karsiliginda gelir.',
      warnings:
        params.weightMode && params.algorithm !== 'ucs'
          ? 'Weighted mode acikken BFS ve DFS edge maliyetlerini optimize etmez. Gorsel olarak cozum bulsalar da en ucuz route bu olmayabilir.'
          : 'Obstacle density arttikca cozumun bulunmasi frontier stratejisinden daha cok haritanin baglanirliliga bagli hale gelir.',
      tryNext:
        params.algorithm === 'ucs'
          ? 'Ayni haritayi BFS ile tekrar calistir ve adim sayisi daha kisa olsa bile total cost farkini karsilastir.'
          : 'Ayni parametrelerle UCS secip frontier buyuklugu ile path cost arasindaki degis tokuşu incele.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(run.steps),
  }
}
