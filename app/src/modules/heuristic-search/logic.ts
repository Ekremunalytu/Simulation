import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  generateSearchGrid,
  heuristicDistance,
  type HeuristicKind,
  type SearchGrid,
  pointKey,
  parsePointKey,
  getNeighbors,
} from '../shared/search-grid'

export interface HeuristicSearchParams extends SimulationParamsBase {
  algorithm: 'greedy' | 'astar'
  heuristic: HeuristicKind
  obstacleDensity: number
  weightVariance: number
  tieBreakStrategy: 'lower-h' | 'higher-g'
}

export interface HeuristicFrontierEntry {
  key: string
  x: number
  y: number
  g: number
  h: number
  f: number
}

export interface HeuristicSearchStep {
  expandedKey: string
  frontier: HeuristicFrontierEntry[]
  expandedKeys: string[]
  currentPathKeys: string[]
  currentPathCost: number
  currentEstimate: number
}

export interface HeuristicProgressPoint {
  step: number
  expanded: number
  frontier: number
  pathCost: number
  estimate: number
}

export interface HeuristicSearchResult extends SimulationResultBase {
  grid: SearchGrid
  steps: HeuristicSearchStep[]
  progress: HeuristicProgressPoint[]
  finalPathKeys: string[]
  finalCost: number
  expandedCount: number
  heuristicEstimate: number
  efficiency: number
}

interface SearchNode {
  key: string
  point: { x: number; y: number }
  g: number
  h: number
  f: number
}

interface HeuristicSearchRun {
  steps: HeuristicSearchStep[]
  finalPathKeys: string[]
  finalCost: number
  expandedCount: number
}

function reconstructPath(parents: Map<string, string | null>, key: string): string[] {
  const path: string[] = []
  let cursor: string | null = key

  while (cursor) {
    path.unshift(cursor)
    cursor = parents.get(cursor) ?? null
  }

  return path
}

function compareNodes(
  left: SearchNode,
  right: SearchNode,
  tieBreakStrategy: HeuristicSearchParams['tieBreakStrategy'],
) {
  const priorityDiff = left.f - right.f
  if (priorityDiff !== 0) {
    return priorityDiff
  }

  if (tieBreakStrategy === 'lower-h') {
    return left.h - right.h || right.g - left.g
  }

  return right.g - left.g || left.h - right.h
}

function sortFrontierForDisplay(
  frontier: SearchNode[],
  tieBreakStrategy: HeuristicSearchParams['tieBreakStrategy'],
): HeuristicFrontierEntry[] {
  return [...frontier]
    .sort((left, right) => compareNodes(left, right, tieBreakStrategy))
    .slice(0, 10)
    .map((node) => ({
      key: node.key,
      x: node.point.x,
      y: node.point.y,
      g: node.g,
      h: node.h,
      f: node.f,
    }))
}

export function runHeuristicSearch(
  grid: SearchGrid,
  algorithm: HeuristicSearchParams['algorithm'],
  heuristic: HeuristicKind,
  tieBreakStrategy: HeuristicSearchParams['tieBreakStrategy'],
): HeuristicSearchRun {
  const startKey = pointKey(grid.start)
  const goalKey = pointKey(grid.goal)
  const startHeuristic = heuristicDistance(grid.start, grid.goal, heuristic)
  const frontier: SearchNode[] = [
    {
      key: startKey,
      point: grid.start,
      g: 0,
      h: startHeuristic,
      f: algorithm === 'astar' ? startHeuristic : startHeuristic,
    },
  ]
  const parents = new Map<string, string | null>([[startKey, null]])
  const bestCosts = new Map<string, number>([[startKey, 0]])
  const closed = new Set<string>()
  const expandedOrder: string[] = []
  const steps: HeuristicSearchStep[] = []
  let finalPathKeys: string[] = []
  let finalCost = 0

  while (frontier.length > 0) {
    frontier.sort((left, right) => compareNodes(left, right, tieBreakStrategy))
    const current = frontier.shift()

    if (!current || closed.has(current.key)) {
      continue
    }

    const bestKnownCost = bestCosts.get(current.key)
    if (bestKnownCost !== undefined && current.g > bestKnownCost) {
      continue
    }

    closed.add(current.key)
    expandedOrder.push(current.key)

    if (current.key === goalKey) {
      finalPathKeys = reconstructPath(parents, current.key)
      finalCost = current.g
      steps.push({
        expandedKey: current.key,
        frontier: sortFrontierForDisplay(frontier, tieBreakStrategy),
        expandedKeys: [...expandedOrder],
        currentPathKeys: finalPathKeys,
        currentPathCost: finalCost,
        currentEstimate: current.h,
      })
      break
    }

    for (const neighbor of getNeighbors(grid, current.point)) {
      const nextG = current.g + neighbor.weight
      const existing = bestCosts.get(neighbor.key)

      if (existing !== undefined && nextG >= existing) {
        continue
      }

      const nextH = heuristicDistance(neighbor, grid.goal, heuristic)

      bestCosts.set(neighbor.key, nextG)
      parents.set(neighbor.key, current.key)
      frontier.push({
        key: neighbor.key,
        point: neighbor,
        g: nextG,
        h: nextH,
        f: algorithm === 'astar' ? nextG + nextH : nextH,
      })
    }

    const currentPathKeys = reconstructPath(parents, current.key)
    steps.push({
      expandedKey: current.key,
      frontier: sortFrontierForDisplay(frontier, tieBreakStrategy),
      expandedKeys: [...expandedOrder],
      currentPathKeys,
      currentPathCost: current.g,
      currentEstimate: current.h,
    })
  }

  return {
    steps,
    finalPathKeys,
    finalCost,
    expandedCount: expandedOrder.length,
  }
}

function buildProgress(steps: HeuristicSearchStep[]): HeuristicProgressPoint[] {
  return steps.map((step, index) => ({
    step: index + 1,
    expanded: step.expandedKeys.length,
    frontier: step.frontier.length,
    pathCost: step.currentPathCost,
    estimate: step.currentEstimate,
  }))
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Sezgisel Değişimi',
      change: 'Ayni grid ustunde Manhattan ve Euclidean heuristic arasinda gecis yap.',
      expectation:
        'A* iki durumda da cozum kalitesini korurken expanded region sekli degisir; heuristic ne kadar bilgilendiriciyse frontier daha odakli kalir.',
    },
    {
      title: 'Greedy Yanilgisi',
      change: 'Obstacle density ve weight variance degerlerini birlikte artirip Greedy sec.',
      expectation:
        'Goal a geometrik olarak yakin gorunen koridorlar agir ya da kapali olabilir; Greedy az node acar ama final cost dalgalanir.',
    },
    {
      title: 'Tie-Break Etkisi',
      change: 'Tie break stratejisini lower-h ile higher-g arasinda degistir.',
      expectation:
        'Ayni f(n) skorunda frontier order degisince acilan node sirasi fark eder; bu ozellikle dar koridorlarda gorsel olarak belirginlesir.',
    },
  ]
}

function buildTimeline(steps: HeuristicSearchStep[]): SimulationTimeline {
  return {
    frames: steps.map((step, index) => {
      const point = parsePointKey(step.expandedKey)

      return {
        label: `${index + 1}. değerlendir (${point.x}, ${point.y})`,
      }
    }),
  }
}

function deriveSeed(params: HeuristicSearchParams): number {
  return (
    3000 +
    Math.round(params.obstacleDensity * 100) * 31 +
    params.weightVariance * 17 +
    (params.algorithm === 'astar' ? 43 : 37) +
    (params.heuristic === 'euclidean' ? 13 : 7) +
    (params.tieBreakStrategy === 'higher-g' ? 19 : 0)
  )
}

export function deriveHeuristicSearchResult(
  params: HeuristicSearchParams,
): HeuristicSearchResult {
  const grid = generateSearchGrid({
    size: 10,
    obstacleDensity: params.obstacleDensity,
    weightVariance: params.weightVariance,
    branchBias: 0.65,
    seed: deriveSeed(params),
  })
  const run = runHeuristicSearch(
    grid,
    params.algorithm,
    params.heuristic,
    params.tieBreakStrategy,
  )
  const progress = buildProgress(run.steps)
  const heuristicEstimate = heuristicDistance(grid.start, grid.goal, params.heuristic)
  const efficiency = run.expandedCount === 0 ? 0 : run.finalPathKeys.length / run.expandedCount

  return {
    grid,
    steps: run.steps,
    progress,
    finalPathKeys: run.finalPathKeys,
    finalCost: run.finalCost,
    expandedCount: run.expandedCount,
    heuristicEstimate,
    efficiency,
    metrics: [
      {
        label: 'Açılan Düğümler',
        value: String(run.expandedCount),
        tone: 'primary',
      },
      {
        label: 'Nihai Maliyet',
        value: run.finalPathKeys.length > 0 ? run.finalCost.toFixed(1) : 'Yol yok',
        tone: run.finalPathKeys.length > 0 ? 'secondary' : 'warning',
      },
      {
        label: 'Sezgisel Tahmin',
        value: heuristicEstimate.toFixed(2),
        tone: 'tertiary',
      },
      {
        label: 'Arama Verimliliği',
        value: `${(efficiency * 100).toFixed(1)}%`,
        tone: efficiency > 0.4 ? 'secondary' : 'neutral',
      },
    ],
    learning: {
      summary: `${params.algorithm === 'astar' ? 'A*' : 'Greedy Best-First'} arama, goal yonune bakarken ${params.heuristic} heuristic ile frontier'i siraliyor.`,
      interpretation:
        params.algorithm === 'astar'
          ? 'A* g(n) ve h(n) bilgisini birlestirdigi icin hem simdiki maliyeti hem de kalan tahmini dikkate alir; admissible heuristic ile optimaliteyi korur.'
          : 'Greedy Best-First sadece h(n) odakli oldugu icin hedefe hizli yaklasiyor gibi gorunur; fakat ucuz olmayan koridorlara erken sapabilir.',
      warnings:
        params.weightVariance > 5
          ? 'Weight variance yuksekse geometrik olarak yakin gorunen rota ucuz olmak zorunda degildir. Heuristic yalnizca hedefe mesafeyi, edge cost dagilimini degil tahmin eder.'
          : 'Obstacle density arttikca heuristic bilgi tek basina yeterli olmaz; frontier acisindan dar bogazlar daha baskin hale gelir.',
      tryNext:
        params.algorithm === 'astar'
          ? 'Ayni haritayi Greedy ile acip daha az node expansion karsiliginda final cost nasil degisiyor incele.'
          : 'Ayni ayarlari A* ile tekrar calistir ve f(n)=g(n)+h(n) kullanimiyla path quality nasil duzeliyor bak.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(run.steps),
  }
}
