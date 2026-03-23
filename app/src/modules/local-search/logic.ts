import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { createSeededRandom, randomBetween, pickOne } from '../shared/random'

export interface LocalSearchParams extends SimulationParamsBase {
  algorithm: 'hill-climbing' | 'simulated-annealing'
  landscape: 'smooth' | 'rugged'
  maxSteps: number
  temperature: number
  coolingRate: number
  randomRestarts: number
}

export interface SurfacePoint {
  x: number
  y: number
  score: number
}

export interface LocalSearchStep {
  step: number
  x: number
  y: number
  score: number
  temperature: number
  restartCount: number
  acceptedWorse: boolean
}

export interface LocalSearchResult extends SimulationResultBase {
  surface: SurfacePoint[]
  steps: LocalSearchStep[]
  bestStep: LocalSearchStep
  finalStep: LocalSearchStep
  acceptedWorseMoves: number
  localOptimumHit: boolean
  approximateGlobalBest: number
}

interface SearchState {
  x: number
  y: number
  score: number
}

interface LocalSearchRun {
  steps: LocalSearchStep[]
  bestStep: LocalSearchStep
  finalStep: LocalSearchStep
  acceptedWorseMoves: number
  localOptimumHit: boolean
}

const STEP_SIZE = 0.35
const SEARCH_BOUNDS = 4

const neighborDirections = [
  { dx: STEP_SIZE, dy: 0 },
  { dx: -STEP_SIZE, dy: 0 },
  { dx: 0, dy: STEP_SIZE },
  { dx: 0, dy: -STEP_SIZE },
  { dx: STEP_SIZE, dy: STEP_SIZE },
  { dx: STEP_SIZE, dy: -STEP_SIZE },
  { dx: -STEP_SIZE, dy: STEP_SIZE },
  { dx: -STEP_SIZE, dy: -STEP_SIZE },
]

export function scoreLandscape(
  x: number,
  y: number,
  landscape: LocalSearchParams['landscape'],
): number {
  const smoothBasin = 10 - (x - 1.4) ** 2 - (y + 1.2) ** 2

  if (landscape === 'smooth') {
    return smoothBasin
  }

  const globalPeak = 11 * Math.exp(-(((x - 2.35) ** 2) + ((y + 1.15) ** 2)) / 1.2)
  const localPeak = 8.1 * Math.exp(-(((x + 2.05) ** 2) + ((y - 1.7) ** 2)) / 0.65)
  const waves = 1.2 * Math.sin(2.3 * x) * Math.cos(1.6 * y)
  const penalty = 0.18 * (x * x + y * y)

  return globalPeak + localPeak + waves - penalty
}

function clampPosition(value: number): number {
  return Math.max(-SEARCH_BOUNDS, Math.min(SEARCH_BOUNDS, value))
}

function createStartState(
  random: ReturnType<typeof createSeededRandom>,
  landscape: LocalSearchParams['landscape'],
): SearchState {
  if (landscape === 'smooth') {
    const x = -3 + random() * 0.35
    const y = 3 - random() * 0.35
    return { x, y, score: scoreLandscape(x, y, landscape) }
  }

  const x = -2.55 + random() * 0.25
  const y = 1.55 + random() * 0.2
  return { x, y, score: scoreLandscape(x, y, landscape) }
}

function randomState(
  random: ReturnType<typeof createSeededRandom>,
  landscape: LocalSearchParams['landscape'],
): SearchState {
  const x = randomBetween(random, -SEARCH_BOUNDS, SEARCH_BOUNDS)
  const y = randomBetween(random, -SEARCH_BOUNDS, SEARCH_BOUNDS)

  return { x, y, score: scoreLandscape(x, y, landscape) }
}

function buildNeighbors(
  state: SearchState,
  landscape: LocalSearchParams['landscape'],
): SearchState[] {
  return neighborDirections.map((direction) => {
    const x = clampPosition(state.x + direction.dx)
    const y = clampPosition(state.y + direction.dy)

    return {
      x,
      y,
      score: scoreLandscape(x, y, landscape),
    }
  })
}

function buildExploratoryCandidate(
  random: ReturnType<typeof createSeededRandom>,
  state: SearchState,
  landscape: LocalSearchParams['landscape'],
  temperature: number,
): SearchState {
  const angle = randomBetween(random, 0, Math.PI * 2)
  const radius = STEP_SIZE * Math.max(1.8, temperature)
  const x = clampPosition(state.x + Math.cos(angle) * radius)
  const y = clampPosition(state.y + Math.sin(angle) * radius)

  return {
    x,
    y,
    score: scoreLandscape(x, y, landscape),
  }
}

export function runLocalSearch(
  params: LocalSearchParams,
  seed: number = 42,
): LocalSearchRun {
  const random = createSeededRandom(seed)
  let current = createStartState(random, params.landscape)
  let temperature = params.temperature
  let restartCount = 0
  let acceptedWorseMoves = 0
  let localOptimumHit = false
  const steps: LocalSearchStep[] = [
    {
      step: 0,
      x: current.x,
      y: current.y,
      score: current.score,
      temperature,
      restartCount,
      acceptedWorse: false,
    },
  ]

  let bestStep = steps[0] as LocalSearchStep
  let stagnation = 0

  for (let stepIndex = 1; stepIndex <= params.maxSteps; stepIndex += 1) {
    const neighbors = buildNeighbors(current, params.landscape)
    let next = current
    let acceptedWorse = false

    if (params.algorithm === 'hill-climbing') {
      const bestNeighbor = neighbors.reduce((best, candidate) =>
        candidate.score > best.score ? candidate : best,
      )

      if (bestNeighbor.score <= current.score + 1e-6) {
        if (restartCount < params.randomRestarts) {
          restartCount += 1
          current = randomState(random, params.landscape)
          stagnation = 0
          steps.push({
            step: stepIndex,
            x: current.x,
            y: current.y,
            score: current.score,
            temperature,
            restartCount,
            acceptedWorse: false,
          })
          if (current.score > bestStep.score) {
            bestStep = steps[steps.length - 1] as LocalSearchStep
          }
          continue
        }

        localOptimumHit = true
        break
      }

      next = bestNeighbor
    } else {
      const candidates =
        temperature > 1.2
          ? [...neighbors, buildExploratoryCandidate(random, current, params.landscape, temperature)]
          : neighbors
      const candidate = pickOne(random, candidates)
      const delta = candidate.score - current.score

      if (delta >= 0) {
        next = candidate
      } else if (temperature > 1e-4 && random() < Math.exp(delta / temperature)) {
        next = candidate
        acceptedWorse = true
        acceptedWorseMoves += 1
      }

      if (next.score <= current.score + 1e-6) {
        stagnation += 1
      } else {
        stagnation = 0
      }

      if (stagnation >= 9 && restartCount < params.randomRestarts) {
        restartCount += 1
        current = randomState(random, params.landscape)
        temperature = Math.max(params.temperature * 0.7, temperature)
        stagnation = 0
        steps.push({
          step: stepIndex,
          x: current.x,
          y: current.y,
          score: current.score,
          temperature,
          restartCount,
          acceptedWorse: false,
        })
        if (current.score > bestStep.score) {
          bestStep = steps[steps.length - 1] as LocalSearchStep
        }
        continue
      }
    }

    current = next
    temperature *= params.coolingRate

    const recorded: LocalSearchStep = {
      step: stepIndex,
      x: current.x,
      y: current.y,
      score: current.score,
      temperature,
      restartCount,
      acceptedWorse,
    }
    steps.push(recorded)

    if (recorded.score > bestStep.score) {
      bestStep = recorded
    }
  }

  return {
    steps,
    bestStep,
    finalStep: steps[steps.length - 1] as LocalSearchStep,
    acceptedWorseMoves,
    localOptimumHit,
  }
}

function buildSurface(landscape: LocalSearchParams['landscape']): SurfacePoint[] {
  const surface: SurfacePoint[] = []

  for (let y = -SEARCH_BOUNDS; y <= SEARCH_BOUNDS; y += 0.35) {
    for (let x = -SEARCH_BOUNDS; x <= SEARCH_BOUNDS; x += 0.35) {
      surface.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        score: scoreLandscape(x, y, landscape),
      })
    }
  }

  return surface
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Rugged Tuzak',
      change: 'Landscape i rugged sec, sonra Hill Climbing ile restart sayisini 0 yap.',
      expectation:
        'Ajan hizli sekilde yakin bir local optimuma oturur; score bir noktadan sonra artis gostermez cunku downhill adimlara izin verilmez.',
    },
    {
      title: 'Sicak Baslangic',
      change: 'Simulated Annealing secip temperature degerini yuksek tut, cooling rate i 0.97 civarina getir.',
      expectation:
        'Erken adimlarda accepted worse move gorursun; bu gecici geri adimlar daha iyi basinlara gecis icin exploration alanini buyutur.',
    },
    {
      title: 'Restart Kurtaricisi',
      change: 'Random restart sayisini 2 veya 3 yap ve Hill Climbing ile yeniden calistir.',
      expectation:
        'Her restart yeni bir basin dener; tek bir yerel tepeye bagli kalmak yerine daha yuksek best score yakalama sansi artar.',
    },
  ]
}

function buildTimeline(steps: LocalSearchStep[]): SimulationTimeline {
  return {
    frames: steps.map((step) => ({
      label: `Adım ${step.step} -> skor ${step.score.toFixed(2)}`,
    })),
  }
}

function deriveSeed(params: LocalSearchParams): number {
  return (
    5000 +
    params.maxSteps * 7 +
    Math.round(params.temperature * 100) * 11 +
    Math.round(params.coolingRate * 100) * 13 +
    params.randomRestarts * 17 +
    (params.algorithm === 'simulated-annealing' ? 23 : 0) +
    (params.landscape === 'rugged' ? 29 : 0)
  )
}

export function deriveLocalSearchResult(
  params: LocalSearchParams,
): LocalSearchResult {
  const run = runLocalSearch(params, deriveSeed(params))
  const surface = buildSurface(params.landscape)
  const approximateGlobalBest = surface.reduce(
    (best, point) => (point.score > best ? point.score : best),
    Number.NEGATIVE_INFINITY,
  )
  const bestGap = approximateGlobalBest - run.bestStep.score

  return {
    surface,
    steps: run.steps,
    bestStep: run.bestStep,
    finalStep: run.finalStep,
    acceptedWorseMoves: run.acceptedWorseMoves,
    localOptimumHit: run.localOptimumHit || bestGap > 1,
    approximateGlobalBest,
    metrics: [
      {
        label: 'En İyi Skor',
        value: run.bestStep.score.toFixed(2),
        tone: 'primary',
      },
      {
        label: 'Son Skor',
        value: run.finalStep.score.toFixed(2),
        tone: 'secondary',
      },
      {
        label: 'Yerel Optimum',
        value: run.localOptimumHit || bestGap > 1 ? 'Yakalandı' : 'Aşıldı',
        tone: run.localOptimumHit || bestGap > 1 ? 'warning' : 'secondary',
      },
      {
        label: 'Kabul Edilen Kötü Hamleler',
        value: String(run.acceptedWorseMoves),
        tone: params.algorithm === 'simulated-annealing' ? 'tertiary' : 'neutral',
      },
    ],
    learning: {
      summary: `${params.algorithm === 'hill-climbing' ? 'Hill Climbing' : 'Simulated Annealing'} ${params.landscape} landscape ustunde skor optimize ediyor ve her adim cozum uzayinda bir hareket olarak izleniyor.`,
      interpretation:
        params.algorithm === 'hill-climbing'
          ? 'Hill Climbing yalnizca daha iyi komsulara gittigi icin hizlidir, fakat rugged yuzeylerde basin degistiremez. Yerel tepeye ulasmak global optimum anlamina gelmez.'
          : 'Simulated Annealing sicaklik yardimiyla bazen daha kotu gorunen adimlari kabul eder. Bu kontrollu rastlantisallik exploration kapasitesini belirgin sekilde artirir.',
      warnings:
        params.coolingRate < 0.9
          ? 'Cooling cok hizli olursa annealing erken doner ve davranis Hill Climbing e yaklasir.'
          : 'Restart yoksa tek bir baslangic noktasi sonucu cok etkiler; ozellikle rugged landscape bu duyarliligi arttirir.',
      tryNext:
        params.landscape === 'rugged'
          ? 'Ayni rugged yuzeyde algoritmayi degistirip accepted bad move sayisi ile best score arasindaki iliskiyi incele.'
          : 'Rugged landscape e gec ve ayni parametrelerin neden daha dengesiz hale geldigini gozlemle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(run.steps),
  }
}
