import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveGeneticAlgorithmResult,
  type GeneticAlgorithmParams,
  type GeneticAlgorithmResult,
} from './logic'

const GeneticAlgorithmVisualization = lazy(async () => ({
  default: (await import('./Visualization')).GeneticAlgorithmVisualization,
}))

const defaultParams: GeneticAlgorithmParams = {
  cityCount: 12,
  populationSize: 30,
  mutationRate: 0.08,
  crossoverRate: 0.82,
  eliteCount: 2,
  generations: 40,
}

const presets: PresetConfig<GeneticAlgorithmParams>[] = [
  {
    name: 'Balanced',
    params: {
      cityCount: 12,
      populationSize: 32,
      mutationRate: 0.08,
      crossoverRate: 0.82,
      eliteCount: 2,
      generations: 40,
    },
  },
  {
    name: 'High Mutation',
    params: {
      cityCount: 12,
      populationSize: 32,
      mutationRate: 0.18,
      crossoverRate: 0.78,
      eliteCount: 2,
      generations: 40,
    },
  },
  {
    name: 'Fast Convergence',
    params: {
      cityCount: 11,
      populationSize: 26,
      mutationRate: 0.05,
      crossoverRate: 0.9,
      eliteCount: 4,
      generations: 32,
    },
  },
  {
    name: 'Premature Convergence',
    params: {
      cityCount: 13,
      populationSize: 24,
      mutationRate: 0.03,
      crossoverRate: 0.88,
      eliteCount: 5,
      generations: 36,
    },
  },
]

const geneticAlgorithmDefinition = {
  id: 'genetic-algorithm',
  title: 'Genetic Algorithm',
  subtitle: 'Population Search on a Route Problem',
  category: 'ml',
  description:
    'Population, mutation ve crossover dengesini TSP-benzeri route optimization uzerinden izle. Her generation yeni bir secilim ve varyasyon hikayesi anlatir.',
  icon: '🧬',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'cityCount', label: 'City Count', type: 'slider', min: 8, max: 16, step: 1 },
    {
      key: 'populationSize',
      label: 'Population Size',
      type: 'slider',
      min: 12,
      max: 48,
      step: 2,
    },
    {
      key: 'mutationRate',
      label: 'Mutation Rate',
      type: 'slider',
      min: 0.01,
      max: 0.24,
      step: 0.01,
    },
    {
      key: 'crossoverRate',
      label: 'Crossover Rate',
      type: 'slider',
      min: 0.4,
      max: 0.98,
      step: 0.01,
    },
    { key: 'eliteCount', label: 'Elite Count', type: 'slider', min: 1, max: 8, step: 1 },
    {
      key: 'generations',
      label: 'Generations',
      type: 'slider',
      min: 10,
      max: 60,
      step: 1,
    },
  ],
  formulaTeX: 'fitness(route) = 1 / total_distance(route)',
  derive: deriveGeneticAlgorithmResult,
  VisualizationComponent: GeneticAlgorithmVisualization,
  codeExample: `population = initialize_routes()

for generation in range(100):
    scored = sorted(population, key=route_distance)
    elites = scored[:elite_count]
    next_population = elites.copy()

    while len(next_population) < len(population):
        parent_a = tournament_select(scored)
        parent_b = tournament_select(scored)
        child = ordered_crossover(parent_a, parent_b)
        child = mutate(child, mutation_rate)
        next_population.append(child)

    population = next_population`,
} satisfies SimulationModule<GeneticAlgorithmParams, GeneticAlgorithmResult>

export const geneticAlgorithmModule = defineSimulationModule(geneticAlgorithmDefinition)
