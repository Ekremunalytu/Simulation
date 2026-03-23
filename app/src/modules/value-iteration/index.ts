import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveValueIterationResult,
  type ValueIterationParams,
  type ValueIterationResult,
} from './logic'

const ValueIterationVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ValueIterationVisualization,
}))

const defaultParams: ValueIterationParams = {
  mapLayout: 'easy-goal',
  gamma: 0.92,
  stepReward: -0.08,
  wallPenalty: -0.25,
  goalReward: 1,
  sweeps: 12,
}

const presets: PresetConfig<ValueIterationParams>[] = [
  { name: 'Kolay Hedef', params: defaultParams },
  {
    name: 'Cliff Walk',
    params: { ...defaultParams, mapLayout: 'cliff-walk', stepReward: -0.12, sweeps: 14 },
  },
  {
    name: 'Seyrek Ödül',
    params: { ...defaultParams, mapLayout: 'sparse-reward', gamma: 0.95, sweeps: 16 },
  },
]

const valueIterationDefinition = {
  id: 'value-iteration',
  title: 'Value Iteration',
  subtitle: 'Bellman Optimality Sweeps',
  category: 'ml',
  description:
    'Grid tabanlı bir MDP üzerinde value yüzeyinin sweep sweep nasıl şekillendiğini izle. Her adım greedy policy ve Bellman breakdown ile okunur.',
  icon: 'V',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'mapLayout',
      label: 'Harita',
      type: 'select',
      options: [
        { label: 'Easy Goal', value: 'easy-goal' },
        { label: 'Cliff Walk', value: 'cliff-walk' },
        { label: 'Sparse Reward', value: 'sparse-reward' },
      ],
    },
    { key: 'gamma', label: 'Gamma', type: 'slider', min: 0.5, max: 0.99, step: 0.01 },
    { key: 'stepReward', label: 'Step Reward', type: 'slider', min: -0.3, max: -0.02, step: 0.01 },
    { key: 'wallPenalty', label: 'Wall Penalty', type: 'slider', min: -0.8, max: -0.05, step: 0.05 },
    { key: 'goalReward', label: 'Goal Reward', type: 'slider', min: 0.5, max: 2, step: 0.1 },
    { key: 'sweeps', label: 'Sweeps', type: 'slider', min: 4, max: 20, step: 1 },
  ],
  formulaTeX: 'V_{k+1}(s)=max_a [r + γV_k(s\') ]',
  theory: {
    primaryFormula: 'Bellman optimality, her durumda en iyi tek-adımlık kararı seçip bunu tekrar tekrar tüm grid üzerinde yayar.',
    formulaLabel: 'Value backup',
    symbols: [
      { symbol: 'V(s)', meaning: 'Durum değeri' },
      { symbol: 'γ', meaning: 'Discount factor' },
      { symbol: 'r', meaning: 'Tek-adımlık ödül' },
    ],
    derivationSteps: [
      'Her state için dört olası eylemin bir-adım sonrası hesaplanır.',
      'En yüksek Q değeri yeni V(s) olarak yazılır.',
      'Bu backup tüm grid üzerinde sweep halinde tekrar edilir.',
      'Greedy policy, her state için o anda en yüksek Q veren eylemden okunur.',
    ],
    interpretation:
      'Value iteration, policyyi doğrudan yazmak yerine önce değer yüzeyini kurar; policy bu yüzeyin yerel en dik inişlerinden okunur.',
    pitfalls: [
      'Az sweep ile çıkan policyyi tam optimum sanmak.',
      'Gamma etkisini sadece hız parametresi gibi yorumlamak.',
    ],
  },
  derive: deriveValueIterationResult,
  VisualizationComponent: ValueIterationVisualization,
} satisfies SimulationModule<ValueIterationParams, ValueIterationResult>

export const valueIterationModule = defineSimulationModule(valueIterationDefinition)
