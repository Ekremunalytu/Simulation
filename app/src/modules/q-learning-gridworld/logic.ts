import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { createSeededRandom, randomInt } from '../shared/random'

export interface QLearningGridworldParams extends SimulationParamsBase {
  alpha: number
  gamma: number
  epsilon: number
  episodes: number
  stepPenalty: number
  mapLayout: 'easy-goal' | 'cliff-walk' | 'sparse-reward' | 'exploratory'
}

type Action = 0 | 1 | 2 | 3
type CellType = 'empty' | 'start' | 'goal' | 'wall' | 'cliff'

export interface GridCell {
  x: number
  y: number
  type: CellType
}

export interface EpisodeStat {
  episode: number
  totalReward: number
  success: number
}

export interface PolicyStep {
  step: number
  x: number
  y: number
  action: Action | null
  reward: number
}

export interface PolicyArrow {
  key: string
  x: number
  y: number
  bestAction: Action | null
  value: number
}

export interface QLearningGridworldResult extends SimulationResultBase {
  grid: GridCell[]
  episodeStats: EpisodeStat[]
  policyPath: PolicyStep[]
  policyArrows: PolicyArrow[]
  averageReward: number
  successRate: number
  policyStability: number
  convergenceEpisode: number
}

type QTable = Record<string, [number, number, number, number]>

interface GridDefinition {
  width: number
  height: number
  start: { x: number; y: number }
  goal: { x: number; y: number }
  walls: Set<string>
  cliffs: Set<string>
}

interface TrainingResult {
  grid: GridDefinition
  qTable: QTable
  episodeStats: EpisodeStat[]
  policyPath: PolicyStep[]
  policyArrows: PolicyArrow[]
  averageReward: number
  successRate: number
  policyStability: number
  convergenceEpisode: number
}

const actionVectors: Array<{ dx: number; dy: number; arrow: string }> = [
  { dx: 0, dy: -1, arrow: '↑' },
  { dx: 1, dy: 0, arrow: '→' },
  { dx: 0, dy: 1, arrow: '↓' },
  { dx: -1, dy: 0, arrow: '←' },
]

function pointKey(x: number, y: number): string {
  return `${x},${y}`
}

function buildGridDefinition(layout: QLearningGridworldParams['mapLayout']): GridDefinition {
  switch (layout) {
    case 'cliff-walk':
      return {
        width: 5,
        height: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 4 },
        walls: new Set<string>(),
        cliffs: new Set<string>(['1,4', '2,4', '3,4']),
      }
    case 'sparse-reward':
      return {
        width: 5,
        height: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        walls: new Set<string>(['1,3', '1,2', '3,2', '3,1']),
        cliffs: new Set<string>(),
      }
    case 'exploratory':
      return {
        width: 6,
        height: 5,
        start: { x: 0, y: 4 },
        goal: { x: 5, y: 0 },
        walls: new Set<string>(['2,3', '2,2', '4,2']),
        cliffs: new Set<string>(['3,4']),
      }
    default:
      return {
        width: 5,
        height: 5,
        start: { x: 0, y: 4 },
        goal: { x: 4, y: 0 },
        walls: new Set<string>(['2,2', '1,1']),
        cliffs: new Set<string>(),
      }
  }
}

function buildGridCells(grid: GridDefinition): GridCell[] {
  const cells: GridCell[] = []

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
      } else if (grid.cliffs.has(key)) {
        type = 'cliff'
      }

      cells.push({ x, y, type })
    }
  }

  return cells
}

function emptyQTable(grid: GridDefinition): QTable {
  const qTable: QTable = {}

  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      const key = pointKey(x, y)
      if (grid.walls.has(key)) {
        continue
      }
      qTable[key] = [0, 0, 0, 0]
    }
  }

  return qTable
}

function greedyAction(qTable: QTable, x: number, y: number): Action {
  const values = qTable[pointKey(x, y)] ?? [0, 0, 0, 0]
  let bestAction: Action = 0

  for (let action = 1 as Action; action < 4; action = (action + 1) as Action) {
    if (values[action] > values[bestAction]) {
      bestAction = action
    }
  }

  return bestAction
}

function chooseAction(
  random: ReturnType<typeof createSeededRandom>,
  qTable: QTable,
  x: number,
  y: number,
  epsilon: number,
): Action {
  if (random() < epsilon) {
    return randomInt(random, 0, 3) as Action
  }

  return greedyAction(qTable, x, y)
}

function transition(
  grid: GridDefinition,
  x: number,
  y: number,
  action: Action,
  stepPenalty: number,
): { nextX: number; nextY: number; reward: number; done: boolean; success: boolean } {
  const vector = actionVectors[action] as { dx: number; dy: number }
  let nextX = Math.max(0, Math.min(grid.width - 1, x + vector.dx))
  let nextY = Math.max(0, Math.min(grid.height - 1, y + vector.dy))
  const nextKey = pointKey(nextX, nextY)

  if (grid.walls.has(nextKey)) {
    nextX = x
    nextY = y
  }

  if (grid.cliffs.has(nextKey)) {
    return {
      nextX,
      nextY,
      reward: -10,
      done: true,
      success: false,
    }
  }

  if (nextX === grid.goal.x && nextY === grid.goal.y) {
    return {
      nextX,
      nextY,
      reward: 10,
      done: true,
      success: true,
    }
  }

  return {
    nextX,
    nextY,
    reward: stepPenalty,
    done: false,
    success: false,
  }
}

function policySignature(qTable: QTable, grid: GridDefinition): string {
  const signature: string[] = []

  for (let y = 0; y < grid.height; y += 1) {
    for (let x = 0; x < grid.width; x += 1) {
      const key = pointKey(x, y)
      if (grid.walls.has(key) || grid.cliffs.has(key) || key === pointKey(grid.goal.x, grid.goal.y)) {
        continue
      }
      signature.push(`${key}:${greedyAction(qTable, x, y)}`)
    }
  }

  return signature.join('|')
}

export function evaluateGreedyPolicy(
  qTable: QTable,
  grid: GridDefinition,
  stepPenalty: number,
): PolicyStep[] {
  const path: PolicyStep[] = []
  let x = grid.start.x
  let y = grid.start.y

  for (let step = 0; step < grid.width * grid.height; step += 1) {
    const action = greedyAction(qTable, x, y)
    const result = transition(grid, x, y, action, stepPenalty)

    path.push({
      step,
      x,
      y,
      action,
      reward: result.reward,
    })

    x = result.nextX
    y = result.nextY

    if (result.done) {
      path.push({
        step: step + 1,
        x,
        y,
        action: null,
        reward: result.reward,
      })
      break
    }
  }

  return path
}

export function trainQLearning(
  params: QLearningGridworldParams,
  seed: number = 42,
): TrainingResult {
  const random = createSeededRandom(seed)
  const grid = buildGridDefinition(params.mapLayout)
  const qTable = emptyQTable(grid)
  const episodeStats: EpisodeStat[] = []
  const signatures: string[] = []

  for (let episode = 1; episode <= params.episodes; episode += 1) {
    let x = grid.start.x
    let y = grid.start.y
    let totalReward = 0
    let success = 0

    for (let step = 0; step < grid.width * grid.height * 2; step += 1) {
      const action = chooseAction(random, qTable, x, y, params.epsilon)
      const currentKey = pointKey(x, y)
      const currentValues = qTable[currentKey] as [number, number, number, number]
      const result = transition(grid, x, y, action, params.stepPenalty)
      const nextKey = pointKey(result.nextX, result.nextY)
      const nextValues = qTable[nextKey] ?? [0, 0, 0, 0]
      const tdTarget = result.reward + params.gamma * Math.max(...nextValues)
      const tdError = tdTarget - currentValues[action]
      currentValues[action] += params.alpha * tdError

      totalReward += result.reward
      x = result.nextX
      y = result.nextY

      if (result.done) {
        success = result.success ? 1 : 0
        break
      }
    }

    episodeStats.push({
      episode,
      totalReward,
      success,
    })

    if (episode % Math.max(5, Math.floor(params.episodes / 5)) === 0 || episode === params.episodes) {
      signatures.push(policySignature(qTable, grid))
    }
  }

  const policyPath = evaluateGreedyPolicy(qTable, grid, params.stepPenalty)
  const policyArrows = buildGridCells(grid)
    .filter((cell) => cell.type !== 'wall')
    .map((cell) => {
      const key = pointKey(cell.x, cell.y)
      const values = qTable[key] ?? [0, 0, 0, 0]
      const bestAction = cell.type === 'goal' || cell.type === 'cliff' ? null : greedyAction(qTable, cell.x, cell.y)

      return {
        key,
        x: cell.x,
        y: cell.y,
        bestAction,
        value: bestAction === null ? 0 : values[bestAction],
      }
    })
  const tail = episodeStats.slice(-Math.min(20, episodeStats.length))
  const averageReward = tail.reduce((sum, item) => sum + item.totalReward, 0) / tail.length
  const successRate = tail.reduce((sum, item) => sum + item.success, 0) / tail.length
  const policyStability =
    signatures.length < 2
      ? 1
      : signatures.at(-1) === signatures.at(-2)
        ? 1
        : signatures.filter((signature) => signature === signatures.at(-1)).length / signatures.length
  let convergenceEpisode = params.episodes

  for (let index = 9; index < episodeStats.length; index += 1) {
    const window = episodeStats.slice(index - 9, index + 1)
    const rollingSuccess =
      window.reduce((sum, item) => sum + item.success, 0) / window.length

    if (rollingSuccess >= 0.8) {
      convergenceEpisode = window[0]?.episode ?? params.episodes
      break
    }
  }

  return {
    grid,
    qTable,
    episodeStats,
    policyPath,
    policyArrows,
    averageReward,
    successRate,
    policyStability,
    convergenceEpisode,
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Exploration Baskisi',
      change: 'Epsilon degerini yukseltip ayni map i tekrar egit.',
      expectation:
        'Erken donemde reward daha dengesiz olur ama ajan farkli koridorlari denedigi icin uzun vadede policy coverage artabilir.',
    },
    {
      title: 'Discount Etkisi',
      change: 'Gamma yi dusur ve sparse-reward map te yeniden calistir.',
      expectation:
        'Ajan uzak odulleri daha az onemsedigi icin goal e ulasan policy daha gec olusur ya da hic kararlasmayabilir.',
    },
    {
      title: 'Cliff Riski',
      change: 'Cliff-walk map te epsilon sabitken step penalty yi daha negatif yap.',
      expectation:
        'Ajan daha guvenli ama daha uzun bir rota tercih edebilir; toplam reward yalnizca hedefe ulasma degil, yol ustundeki cezalarla da sekillenir.',
    },
  ]
}

function buildTimeline(path: PolicyStep[]): SimulationTimeline {
  return {
    frames: path.map((step) => ({
      label: `Politika adımı ${step.step} -> (${step.x}, ${step.y})`,
    })),
  }
}

function deriveSeed(params: QLearningGridworldParams): number {
  return (
    9000 +
    Math.round(params.alpha * 100) * 11 +
    Math.round(params.gamma * 100) * 13 +
    Math.round(params.epsilon * 100) * 17 +
    params.episodes * 19 +
    Math.round(Math.abs(params.stepPenalty) * 100) * 23 +
    (params.mapLayout === 'cliff-walk'
      ? 29
      : params.mapLayout === 'sparse-reward'
        ? 31
        : params.mapLayout === 'exploratory'
          ? 37
          : 0)
  )
}

export function deriveQLearningGridworldResult(
  params: QLearningGridworldParams,
): QLearningGridworldResult {
  const training = trainQLearning(params, deriveSeed(params))

  return {
    grid: buildGridCells(training.grid),
    episodeStats: training.episodeStats,
    policyPath: training.policyPath,
    policyArrows: training.policyArrows,
    averageReward: training.averageReward,
    successRate: training.successRate,
    policyStability: training.policyStability,
    convergenceEpisode: training.convergenceEpisode,
    metrics: [
      {
        label: 'Ortalama Ödül',
        value: training.averageReward.toFixed(2),
        tone: 'primary',
      },
      {
        label: 'Başarı Oranı',
        value: `${(training.successRate * 100).toFixed(1)}%`,
        tone: training.successRate > 0.7 ? 'secondary' : 'warning',
      },
      {
        label: 'Politika Kararlılığı',
        value: `${(training.policyStability * 100).toFixed(1)}%`,
        tone: training.policyStability > 0.7 ? 'tertiary' : 'neutral',
      },
      {
        label: 'Yakınsama Episode',
        value: String(training.convergenceEpisode),
        tone: 'neutral',
      },
    ],
    learning: {
      summary: `${params.mapLayout} map ustunde ajan ${params.episodes} episode boyunca reward sinyalinden Q-table ogreniyor.`,
      interpretation:
        params.epsilon > 0.25
          ? 'Exploration yuksek oldugu icin ajan daha fazla state-action ciftini deniyor; ogrenme daha gürültülü ama kapsami daha genis hale geliyor.'
          : 'Exploration sinirli oldugunda ajan hizli sekilde bir rotaya kilitlenebilir; bu rota iyi de olabilir, erken yanlis da olabilir.',
      warnings:
        params.mapLayout === 'sparse-reward'
          ? 'Sparse reward ortaminda goal sinyali seyrek oldugu icin ogrenme yavas olabilir. Step penalty ve epsilon burada kritik rol oynar.'
          : 'Cliff ve wall yapilari, sadece en kisa degil ayni zamanda en guvenli policy sorusunu da gundeme getirir.',
      tryNext:
        params.mapLayout === 'cliff-walk'
          ? 'Epsilon i biraz azaltip ayni cliff map te policy nin daha temkinli mi daha riskli mi kaldigini incele.'
          : 'Cliff-walk map e gec ve negatif odullerin policy sekillendirmesini easy-goal ile karsilastir.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(training.policyPath),
  }
}

export function actionToArrow(action: Action | null): string {
  return action === null ? '·' : actionVectors[action].arrow
}
