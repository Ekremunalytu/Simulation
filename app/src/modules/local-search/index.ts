import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveLocalSearchResult,
  type LocalSearchParams,
  type LocalSearchResult,
} from './logic'

const LocalSearchVisualization = lazy(async () => ({
  default: (await import('./Visualization')).LocalSearchVisualization,
}))

const defaultParams: LocalSearchParams = {
  algorithm: 'hill-climbing',
  landscape: 'rugged',
  maxSteps: 40,
  temperature: 2.8,
  coolingRate: 0.96,
  randomRestarts: 1,
}

const presets: PresetConfig<LocalSearchParams>[] = [
  {
    name: 'Tek Zirve',
    params: {
      algorithm: 'hill-climbing',
      landscape: 'smooth',
      maxSteps: 28,
      temperature: 1.6,
      coolingRate: 0.95,
      randomRestarts: 0,
    },
  },
  {
    name: 'Engebeli Tuzak',
    params: {
      algorithm: 'hill-climbing',
      landscape: 'rugged',
      maxSteps: 35,
      temperature: 2.2,
      coolingRate: 0.94,
      randomRestarts: 0,
    },
  },
  {
    name: 'Sıcak Başlangıç',
    params: {
      algorithm: 'simulated-annealing',
      landscape: 'rugged',
      maxSteps: 45,
      temperature: 3.4,
      coolingRate: 0.97,
      randomRestarts: 0,
    },
  },
  {
    name: 'Restart Kurtarıcısı',
    params: {
      algorithm: 'hill-climbing',
      landscape: 'rugged',
      maxSteps: 55,
      temperature: 2.8,
      coolingRate: 0.96,
      randomRestarts: 3,
    },
  },
]

const localSearchDefinition = {
  id: 'local-search',
  title: 'Local Search',
  subtitle: 'Hill Climbing and Simulated Annealing',
  category: 'ml',
  description:
    'Amaç yüzeyi üzerinde local improvement ile stochastic escape arasındaki farkı gör. Yol, skor ve sıcaklık aynı anda izlenebilir.',
  icon: '🏔️',
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
        { label: 'Hill Climbing', value: 'hill-climbing' },
        { label: 'Simulated Annealing', value: 'simulated-annealing' },
      ],
    },
    {
      key: 'landscape',
      label: 'Yüzey',
      type: 'select',
      options: [
        { label: 'Düzgün', value: 'smooth' },
        { label: 'Engebeli', value: 'rugged' },
      ],
    },
    {
      key: 'maxSteps',
      label: 'Maksimum Adım',
      type: 'slider',
      min: 10,
      max: 80,
      step: 1,
    },
    {
      key: 'temperature',
      label: 'Sıcaklık',
      type: 'slider',
      min: 0.4,
      max: 4,
      step: 0.1,
    },
    {
      key: 'coolingRate',
      label: 'Soğuma Oranı',
      type: 'slider',
      min: 0.82,
      max: 0.99,
      step: 0.01,
    },
    {
      key: 'randomRestarts',
      label: 'Rastgele Restart',
      type: 'slider',
      min: 0,
      max: 4,
      step: 1,
    },
  ],
  formulaTeX: 'P(accept worse) = e^(Δ / T), where Δ = score_next - score_current',
  derive: deriveLocalSearchResult,
  VisualizationComponent: LocalSearchVisualization,
  codeExample: `def simulated_annealing(state, temperature):
    current = state
    while temperature > 0.01:
        candidate = random_neighbor(current)
        delta = score(candidate) - score(current)
        if delta > 0 or random.random() < math.exp(delta / temperature):
            current = candidate
        temperature *= 0.96
    return current`,
} satisfies SimulationModule<LocalSearchParams, LocalSearchResult>

export const localSearchModule = defineSimulationModule(localSearchDefinition)
