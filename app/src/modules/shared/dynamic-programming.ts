import type { SimulationResultBase } from '../../types/simulation'

export type GridMapLayout = 'easy-goal' | 'cliff-walk' | 'sparse-reward'
export type DynamicProgrammingAction = 0 | 1 | 2 | 3
export type DynamicProgrammingPhase = 'update' | 'evaluation' | 'improvement'
type CellType = 'empty' | 'start' | 'goal' | 'wall' | 'pit'

export interface DynamicProgrammingCell {
  key: string
  x: number
  y: number
  type: CellType
}

export interface BellmanBreakdownEntry {
  action: DynamicProgrammingAction
  nextKey: string
  reward: number
  nextValue: number
  qValue: number
}

export interface DynamicProgrammingFrame {
  label: string
  phase: DynamicProgrammingPhase
  step: number
  values: Record<string, number>
  policy: Record<string, DynamicProgrammingAction | null>
  delta: number
  selectedCellKey: string
  breakdown: BellmanBreakdownEntry[]
}

export interface DynamicProgrammingDeltaPoint {
  step: number
  delta: number
  phase: DynamicProgrammingPhase
}

export interface DynamicProgrammingPathStep {
  step: number
  key: string
  x: number
  y: number
  action: DynamicProgrammingAction | null
  value: number
}

export interface DynamicProgrammingComputation {
  grid: DynamicProgrammingCell[]
  frames: DynamicProgrammingFrame[]
  deltaSeries: DynamicProgrammingDeltaPoint[]
  finalPath: DynamicProgrammingPathStep[]
  convergenceStep: number
  startValue: number
  stablePolicyRatio: number
}

export interface DynamicProgrammingResultBase extends SimulationResultBase {
  grid: DynamicProgrammingCell[]
  frames: DynamicProgrammingFrame[]
  deltaSeries: DynamicProgrammingDeltaPoint[]
  finalPath: DynamicProgrammingPathStep[]
  convergenceStep: number
  startValue: number
  stablePolicyRatio: number
}

interface GridDefinition {
  width: number
  height: number
  start: { x: number; y: number }
  goal: { x: number; y: number }
  walls: Set<string>
  pits: Set<string>
}

interface DynamicProgrammingConfig {
  mapLayout: GridMapLayout
  gamma: number
  stepReward: number
  wallPenalty: number
  goalReward: number
}

const actionVectors: Array<{ dx: number; dy: number; arrow: string }> = [
  { dx: 0, dy: -1, arrow: '↑' },
  { dx: 1, dy: 0, arrow: '→' },
  { dx: 0, dy: 1, arrow: '↓' },
  { dx: -1, dy: 0, arrow: '←' },
]

function pointKey(x: number, y: number) {
  return `${x},${y}`
}

export function actionToArrow(action: DynamicProgrammingAction | null) {
  return action === null ? '•' : actionVectors[action].arrow
}

function buildGridDefinition(layout: GridMapLayout): GridDefinition {
  switch (layout) {
    case 'cliff-walk':
      return {
        width: 5,
        height: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 4 },
        walls: new Set<string>(),
        pits: new Set<string>(['1,4', '2,4', '3,4']),
      }
    case 'sparse-reward':
      return {
        width: 5,
        height: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        walls: new Set<string>(['1,3', '1,2', '3,2', '3,1']),
        pits: new Set<string>(['4,4']),
      }
    default:
      return {
        width: 5,
        height: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        walls: new Set<string>(['2,2', '1,1']),
        pits: new Set<string>(),
      }
  }
}

export function buildDynamicProgrammingGrid(layout: GridMapLayout): DynamicProgrammingCell[] {
  const grid = buildGridDefinition(layout)
  const cells: DynamicProgrammingCell[] = []

  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      const key = pointKey(x, y)
      let type: CellType = 'empty'

      if (x === grid.start.x && y === grid.start.y) {
        type = 'start'
      } else if (x === grid.goal.x && y === grid.goal.y) {
        type = 'goal'
      } else if (grid.walls.has(key)) {
        type = 'wall'
      } else if (grid.pits.has(key)) {
        type = 'pit'
      }

      cells.push({ key, x, y, type })
    }
  }

  return cells
}

function isTerminal(grid: GridDefinition, key: string) {
  return key === pointKey(grid.goal.x, grid.goal.y) || grid.pits.has(key)
}

function allStateKeys(grid: GridDefinition) {
  return Array.from({ length: grid.height }, (_, y) =>
    Array.from({ length: grid.width }, (_, x) => pointKey(x, y)),
  )
    .flat()
    .filter((key) => !grid.walls.has(key))
}

function emptyValues(grid: GridDefinition) {
  return Object.fromEntries(allStateKeys(grid).map((key) => [key, 0])) as Record<string, number>
}

function emptyPolicy(grid: GridDefinition) {
  const goalKey = pointKey(grid.goal.x, grid.goal.y)
  const policy = {} as Record<string, DynamicProgrammingAction | null>

  for (const key of allStateKeys(grid)) {
    if (grid.pits.has(key) || key === goalKey) {
      policy[key] = null
      continue
    }

    policy[key] = 0
  }

  return policy
}

function transition(
  grid: GridDefinition,
  config: DynamicProgrammingConfig,
  key: string,
  action: DynamicProgrammingAction,
) {
  const [xString, yString] = key.split(',')
  const x = Number(xString)
  const y = Number(yString)
  const vector = actionVectors[action]
  const nextX = Math.max(0, Math.min(grid.width - 1, x + vector.dx))
  const nextY = Math.max(0, Math.min(grid.height - 1, y + vector.dy))
  const nextKey = pointKey(nextX, nextY)

  if (grid.walls.has(nextKey)) {
    return {
      nextKey: key,
      reward: config.wallPenalty,
      terminal: false,
    }
  }

  if (nextKey === pointKey(grid.goal.x, grid.goal.y)) {
    return {
      nextKey,
      reward: config.goalReward,
      terminal: true,
    }
  }

  if (grid.pits.has(nextKey)) {
    return {
      nextKey,
      reward: -Math.abs(config.goalReward),
      terminal: true,
    }
  }

  return {
    nextKey,
    reward: config.stepReward,
    terminal: false,
  }
}

function actionValues(
  grid: GridDefinition,
  config: DynamicProgrammingConfig,
  values: Record<string, number>,
  key: string,
): BellmanBreakdownEntry[] {
  if (isTerminal(grid, key)) {
    return []
  }

  return actionVectors.map((_, actionIndex) => {
    const action = actionIndex as DynamicProgrammingAction
    const next = transition(grid, config, key, action)
    const nextValue = next.terminal ? 0 : (values[next.nextKey] ?? 0)

    return {
      action,
      nextKey: next.nextKey,
      reward: next.reward,
      nextValue,
      qValue: next.reward + config.gamma * nextValue,
    }
  })
}

function greedyPolicyForValues(
  grid: GridDefinition,
  config: DynamicProgrammingConfig,
  values: Record<string, number>,
) {
  const policy = {} as Record<string, DynamicProgrammingAction | null>

  for (const key of allStateKeys(grid)) {
    if (isTerminal(grid, key)) {
      policy[key] = null
      continue
    }

    const ranked = actionValues(grid, config, values, key)
    policy[key] = ranked.reduce((best, current) => (current.qValue > best.qValue ? current : best)).action
  }

  return policy
}

function selectBreakdownKey(grid: GridDefinition) {
  return pointKey(grid.start.x, grid.start.y)
}

function stablePolicyRatio(
  grid: GridDefinition,
  previousPolicy: Record<string, DynamicProgrammingAction | null>,
  nextPolicy: Record<string, DynamicProgrammingAction | null>,
) {
  const comparableKeys = allStateKeys(grid).filter((key) => !isTerminal(grid, key))

  if (comparableKeys.length === 0) {
    return 1
  }

  const unchanged = comparableKeys.filter((key) => previousPolicy[key] === nextPolicy[key]).length
  return unchanged / comparableKeys.length
}

function deriveGreedyPath(
  grid: GridDefinition,
  config: DynamicProgrammingConfig,
  values: Record<string, number>,
  policy: Record<string, DynamicProgrammingAction | null>,
) {
  const path: DynamicProgrammingPathStep[] = []
  let key = pointKey(grid.start.x, grid.start.y)
  const visited = new Set<string>()

  for (let step = 0; step < 16; step += 1) {
    const [xString, yString] = key.split(',')
    const x = Number(xString)
    const y = Number(yString)
    const action = policy[key] ?? null

    path.push({
      step: step + 1,
      key,
      x,
      y,
      action,
      value: values[key] ?? 0,
    })

    if (action === null || visited.has(key)) {
      break
    }

    visited.add(key)
    const next = transition(grid, config, key, action)
    key = next.nextKey

    if (next.terminal) {
      const [nextXString, nextYString] = key.split(',')
      path.push({
        step: step + 2,
        key,
        x: Number(nextXString),
        y: Number(nextYString),
        action: null,
        value: values[key] ?? 0,
      })
      break
    }
  }

  return path
}

export function runValueIteration(
  config: DynamicProgrammingConfig & { sweeps: number },
): DynamicProgrammingComputation {
  const grid = buildGridDefinition(config.mapLayout)
  const values = emptyValues(grid)
  const frames: DynamicProgrammingFrame[] = []
  const deltaSeries: DynamicProgrammingDeltaPoint[] = []
  let previousPolicy = emptyPolicy(grid)
  let finalPolicy = previousPolicy
  let lastStableRatio = 0

  for (let sweep = 1; sweep <= config.sweeps; sweep += 1) {
    const nextValues = { ...values }
    let delta = 0

    for (const key of allStateKeys(grid)) {
      if (isTerminal(grid, key)) {
        continue
      }

      const best = actionValues(grid, config, values, key).reduce((winner, candidate) =>
        candidate.qValue > winner.qValue ? candidate : winner,
      )
      nextValues[key] = best.qValue
      delta = Math.max(delta, Math.abs(nextValues[key] - values[key]))
    }

    Object.assign(values, nextValues)
    finalPolicy = greedyPolicyForValues(grid, config, values)
    lastStableRatio = stablePolicyRatio(grid, previousPolicy, finalPolicy)
    const selectedCellKey = selectBreakdownKey(grid)

    frames.push({
      label: `${sweep}. sweep`,
      phase: 'update',
      step: sweep,
      values: { ...values },
      policy: finalPolicy,
      delta,
      selectedCellKey,
      breakdown: actionValues(grid, config, values, selectedCellKey),
    })
    deltaSeries.push({ step: sweep, delta, phase: 'update' })
    previousPolicy = finalPolicy
  }

  return {
    grid: buildDynamicProgrammingGrid(config.mapLayout),
    frames,
    deltaSeries,
    finalPath: deriveGreedyPath(grid, config, values, finalPolicy),
    convergenceStep: deltaSeries.find((point) => point.delta < 0.01)?.step ?? config.sweeps,
    startValue: values[pointKey(grid.start.x, grid.start.y)] ?? 0,
    stablePolicyRatio: lastStableRatio,
  }
}

export function runPolicyIteration(
  config: DynamicProgrammingConfig & { iterations: number; evaluationSweeps?: number },
): DynamicProgrammingComputation {
  const grid = buildGridDefinition(config.mapLayout)
  const values = emptyValues(grid)
  let policy = emptyPolicy(grid)
  const frames: DynamicProgrammingFrame[] = []
  const deltaSeries: DynamicProgrammingDeltaPoint[] = []
  const evaluationSweeps = config.evaluationSweeps ?? 6
  let lastStableRatio = 0

  for (let iteration = 1; iteration <= config.iterations; iteration += 1) {
    let evaluationDelta = 0

    for (let sweep = 0; sweep < evaluationSweeps; sweep += 1) {
      const nextValues = { ...values }

      for (const key of allStateKeys(grid)) {
        if (isTerminal(grid, key)) {
          continue
        }

        const action = policy[key] ?? 0
        const next = transition(grid, config, key, action)
        const nextValue = next.terminal ? 0 : (values[next.nextKey] ?? 0)
        nextValues[key] = next.reward + config.gamma * nextValue
        evaluationDelta = Math.max(evaluationDelta, Math.abs(nextValues[key] - values[key]))
      }

      Object.assign(values, nextValues)
    }

    const selectedCellKey = selectBreakdownKey(grid)

    frames.push({
      label: `${iteration}. değerlendirme`,
      phase: 'evaluation',
      step: frames.length + 1,
      values: { ...values },
      policy: { ...policy },
      delta: evaluationDelta,
      selectedCellKey,
      breakdown: actionValues(grid, config, values, selectedCellKey),
    })
    deltaSeries.push({ step: frames.length, delta: evaluationDelta, phase: 'evaluation' })

    const improvedPolicy = greedyPolicyForValues(grid, config, values)
    lastStableRatio = stablePolicyRatio(grid, policy, improvedPolicy)
    policy = improvedPolicy

    frames.push({
      label: `${iteration}. iyileştirme`,
      phase: 'improvement',
      step: frames.length + 1,
      values: { ...values },
      policy: { ...policy },
      delta: 1 - lastStableRatio,
      selectedCellKey,
      breakdown: actionValues(grid, config, values, selectedCellKey),
    })
    deltaSeries.push({ step: frames.length, delta: 1 - lastStableRatio, phase: 'improvement' })

    if (lastStableRatio === 1) {
      break
    }
  }

  return {
    grid: buildDynamicProgrammingGrid(config.mapLayout),
    frames,
    deltaSeries,
    finalPath: deriveGreedyPath(grid, config, values, policy),
    convergenceStep: deltaSeries.find((point) => point.phase === 'improvement' && point.delta === 0)?.step ?? frames.length,
    startValue: values[pointKey(grid.start.x, grid.start.y)] ?? 0,
    stablePolicyRatio: lastStableRatio,
  }
}
