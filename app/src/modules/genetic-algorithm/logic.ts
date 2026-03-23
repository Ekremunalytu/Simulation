import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { createSeededRandom, randomBetween, randomInt, shuffle } from '../shared/random'

export interface GeneticAlgorithmParams extends SimulationParamsBase {
  cityCount: number
  populationSize: number
  mutationRate: number
  crossoverRate: number
  eliteCount: number
  generations: number
}

export interface City {
  id: number
  x: number
  y: number
}

export interface GenerationSnapshot {
  generation: number
  bestDistance: number
  averageDistance: number
  diversity: number
  bestRoute: number[]
}

export interface GeneticAlgorithmResult extends SimulationResultBase {
  cities: City[]
  generationsData: GenerationSnapshot[]
  finalRoute: number[]
  convergenceGeneration: number
}

type Route = number[]

function generateCities(count: number, seed: number): City[] {
  const random = createSeededRandom(seed)
  const radius = 130
  const center = 160

  return Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count
    const radialNoise = randomBetween(random, -30, 30)
    const x = center + Math.cos(angle) * (radius + radialNoise) + randomBetween(random, -18, 18)
    const y = center + Math.sin(angle) * (radius + radialNoise) + randomBetween(random, -18, 18)

    return { id: index, x, y }
  })
}

function routeDistance(route: Route, cities: City[]): number {
  let distance = 0

  for (let index = 0; index < route.length; index += 1) {
    const current = cities[route[index] as number] as City
    const next = cities[route[(index + 1) % route.length] as number] as City
    distance += Math.hypot(current.x - next.x, current.y - next.y)
  }

  return distance
}

function createInitialPopulation(
  random: ReturnType<typeof createSeededRandom>,
  cityCount: number,
  populationSize: number,
): Route[] {
  const base = Array.from({ length: cityCount }, (_, index) => index)

  return Array.from({ length: populationSize }, () => shuffle(random, base))
}

function tournamentSelection(
  random: ReturnType<typeof createSeededRandom>,
  scoredPopulation: Array<{ route: Route; distance: number }>,
): Route {
  const contenders = Array.from({ length: 3 }, () => {
    const index = randomInt(random, 0, scoredPopulation.length - 1)
    return scoredPopulation[index] as { route: Route; distance: number }
  }).sort((left, right) => left.distance - right.distance)

  return [...(contenders[0]?.route ?? [])]
}

function orderedCrossover(
  random: ReturnType<typeof createSeededRandom>,
  left: Route,
  right: Route,
): Route {
  const child = new Array<number>(left.length).fill(-1)
  const start = randomInt(random, 0, left.length - 2)
  const end = randomInt(random, start + 1, left.length - 1)

  for (let index = start; index <= end; index += 1) {
    child[index] = left[index] as number
  }

  let cursor = 0
  for (const city of right) {
    if (child.includes(city)) {
      continue
    }

    while (child[cursor] !== -1) {
      cursor += 1
    }

    child[cursor] = city
  }

  return child
}

function mutateRoute(
  random: ReturnType<typeof createSeededRandom>,
  route: Route,
): Route {
  const clone = [...route]
  const first = randomInt(random, 0, clone.length - 1)
  const second = randomInt(random, 0, clone.length - 1)
  const temp = clone[first]
  clone[first] = clone[second] as number
  clone[second] = temp as number
  return clone
}

export function runGeneticAlgorithm(
  params: GeneticAlgorithmParams,
  seed: number = 42,
): { cities: City[]; generationsData: GenerationSnapshot[] } {
  const random = createSeededRandom(seed)
  const cities = generateCities(params.cityCount, seed + 7)
  let population = createInitialPopulation(random, params.cityCount, params.populationSize)
  const generationsData: GenerationSnapshot[] = []

  for (let generation = 0; generation <= params.generations; generation += 1) {
    const scoredPopulation = population
      .map((route) => ({
        route,
        distance: routeDistance(route, cities),
      }))
      .sort((left, right) => left.distance - right.distance)

    const bestDistance = (scoredPopulation[0]?.distance ?? 0)
    const averageDistance =
      scoredPopulation.reduce((sum, item) => sum + item.distance, 0) / scoredPopulation.length
    const uniqueRoutes = new Set(scoredPopulation.map((item) => item.route.join('-')))
    const diversity = uniqueRoutes.size / scoredPopulation.length

    generationsData.push({
      generation,
      bestDistance,
      averageDistance,
      diversity,
      bestRoute: [...((scoredPopulation[0]?.route ?? []) as Route)],
    })

    if (generation === params.generations) {
      break
    }

    const nextPopulation: Route[] = scoredPopulation
      .slice(0, Math.min(params.eliteCount, scoredPopulation.length))
      .map((item) => [...item.route])

    while (nextPopulation.length < params.populationSize) {
      const parentA = tournamentSelection(random, scoredPopulation)
      const parentB = tournamentSelection(random, scoredPopulation)
      let child =
        random() < params.crossoverRate
          ? orderedCrossover(random, parentA, parentB)
          : [...parentA]

      if (random() < params.mutationRate) {
        child = mutateRoute(random, child)
      }

      nextPopulation.push(child)
    }

    population = nextPopulation
  }

  return { cities, generationsData }
}

function findConvergenceGeneration(generationsData: GenerationSnapshot[]): number {
  const finalBest = generationsData.at(-1)?.bestDistance ?? 0

  for (const snapshot of generationsData) {
    const converged = generationsData
      .slice(snapshot.generation)
      .every((later) => later.bestDistance <= finalBest * 1.01)

    if (converged) {
      return snapshot.generation
    }
  }

  return generationsData.length - 1
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Mutation Baskisi',
      change: 'Mutation rate i 0.18 civarina cek ve diger parametreleri sabit tut.',
      expectation:
        'Population diversity daha uzun sure yuksek kalir, fakat best distance dalgalanmalari artar; exploration ile stability arasindaki tradeoff belirginlesir.',
    },
    {
      title: 'Erken Yakinsama',
      change: 'Elite count i artirip mutation rate i cok dusur.',
      expectation:
        'Best route hizli sekilde sabitlenir ama diversity sert bicimde duser; population birkac benzer route etrafinda donmeye baslar.',
    },
    {
      title: 'Selection Basincli',
      change: 'Population size i dusurup generation sayisini yukselt.',
      expectation:
        'Kucuk population daha hizli ama daha kirilgan bir evrim dinamiği kurar; ortalama fitness ile best fitness arasindaki fark daha sert olabilir.',
    },
  ]
}

function buildTimeline(generationsData: GenerationSnapshot[]): SimulationTimeline {
  return {
    frames: generationsData.map((snapshot) => ({
      label: `Nesil ${snapshot.generation} -> en iyi ${snapshot.bestDistance.toFixed(1)}`,
    })),
  }
}

function deriveSeed(params: GeneticAlgorithmParams): number {
  return (
    7000 +
    params.cityCount * 13 +
    params.populationSize * 17 +
    Math.round(params.mutationRate * 100) * 19 +
    Math.round(params.crossoverRate * 100) * 23 +
    params.eliteCount * 29 +
    params.generations * 31
  )
}

export function deriveGeneticAlgorithmResult(
  params: GeneticAlgorithmParams,
): GeneticAlgorithmResult {
  const { cities, generationsData } = runGeneticAlgorithm(params, deriveSeed(params))
  const final = generationsData.at(-1) as GenerationSnapshot
  const convergenceGeneration = findConvergenceGeneration(generationsData)

  return {
    cities,
    generationsData,
    finalRoute: [...final.bestRoute],
    convergenceGeneration,
    metrics: [
      {
        label: 'En İyi Mesafe',
        value: final.bestDistance.toFixed(1),
        tone: 'primary',
      },
      {
        label: 'Ortalama Fitness',
        value: (1 / final.averageDistance).toFixed(5),
        tone: 'secondary',
      },
      {
        label: 'Popülasyon Çeşitliliği',
        value: `${(final.diversity * 100).toFixed(1)}%`,
        tone: final.diversity > 0.3 ? 'tertiary' : 'warning',
      },
      {
        label: 'Yakınsama Nesli',
        value: String(convergenceGeneration),
        tone: 'neutral',
      },
    ],
    learning: {
      summary: `${params.populationSize} rotalik bir population, ${params.generations} generation boyunca route distance minimize ediyor.`,
      interpretation:
        params.mutationRate > 0.12
          ? 'Mutation yuksek oldugu icin population daha cesur exploration yapiyor; iyi rotalari korumak ile yeni kombinasyon denemek arasinda daha genis bir hareket alani var.'
          : 'Mutation kontrollu oldugunda elit rotalar daha kararlı korunur; bu da exploitation agirlikli bir evrim akisi yaratir.',
      warnings:
        params.eliteCount >= Math.max(2, Math.floor(params.populationSize / 5))
          ? 'Elite count gorece yuksek. Bu, best route korunumunu guclendirir ama diversity yi hizli eritebilir.'
          : 'Population size kuculdukce rastlantisal varyans artar; ayni operatorler bile daha dengesiz nesil davranisi uretebilir.',
      tryNext:
        final.diversity < 0.2
          ? 'Mutation rate i biraz artirip diversity yi toparla; best route daha gec sabitlense de premature convergence azalabilir.'
          : 'Elite count i arttir ve average distance ile best distance arasindaki farkin nasil kapandigini incele.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(generationsData),
  }
}
