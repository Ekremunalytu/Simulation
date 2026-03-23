import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  derivePolicyIterationResult,
  type PolicyIterationParams,
  type PolicyIterationResult,
} from './logic'

const PolicyIterationVisualization = lazy(async () => ({
  default: (await import('./Visualization')).PolicyIterationVisualization,
}))

const defaultParams: PolicyIterationParams = {
  mapLayout: 'easy-goal',
  gamma: 0.92,
  stepReward: -0.08,
  wallPenalty: -0.25,
  goalReward: 1,
  iterations: 8,
}

const presets: PresetConfig<PolicyIterationParams>[] = [
  { name: 'Kolay Hedef', params: defaultParams },
  {
    name: 'Cliff Walk',
    params: { ...defaultParams, mapLayout: 'cliff-walk', stepReward: -0.12, iterations: 9 },
  },
  {
    name: 'Seyrek Ödül',
    params: { ...defaultParams, mapLayout: 'sparse-reward', gamma: 0.95, iterations: 10 },
  },
]

const policyIterationDefinition = {
  id: 'policy-iteration',
  title: 'Policy Iteration',
  subtitle: 'Policy Evaluation and Improvement',
  category: 'ml',
  description:
    'Bir grid-MDP üzerinde policy evaluation ve policy improvement döngüsünü ayrı fazlar halinde izle. Value yüzeyi ile greedy oklar birlikte kararlılaşır.',
  icon: 'π',
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
    { key: 'iterations', label: 'Policy Iterations', type: 'slider', min: 2, max: 12, step: 1 },
  ],
  formulaTeX: 'π_{new}(s)=argmax_a [r + γV^{π}(s\')]',
  theory: {
    primaryFormula: 'Önce sabit bir policy için V^π hesaplanır, sonra her state için greedy improvement yapılır.',
    formulaLabel: 'Evaluation -> improvement',
    symbols: [
      { symbol: 'π', meaning: 'Policy' },
      { symbol: 'V^π', meaning: 'Verilen policy altındaki değer fonksiyonu' },
      { symbol: 'argmax', meaning: 'En iyi eylemi seçen iyileştirme adımı' },
    ],
    derivationSteps: [
      'Başlangıç policy ile grid üzerinde value tahmini yapılır.',
      'Policy evaluation fazı bu policy altında state değerlerini rafine eder.',
      'Policy improvement, her state için en iyi eylemi yeniden seçer.',
      'Policy değişmeyi bıraktığında süreç kararlı bir çözüme yaklaşır.',
    ],
    interpretation:
      'Policy iteration, değeri ve kararı ayrı ayrı ele alır; bu yüzden convergence dinamiği value iterationdan farklı, daha fazlı bir görünüm üretir.',
    pitfalls: [
      'Evaluation ve improvement fazlarını aynı şey sanmak.',
      'Kararlı policy ile tam optimum valueyi otomatik olarak eşitlemek.',
    ],
  },
  derive: derivePolicyIterationResult,
  VisualizationComponent: PolicyIterationVisualization,
} satisfies SimulationModule<PolicyIterationParams, PolicyIterationResult>

export const policyIterationModule = defineSimulationModule(policyIterationDefinition)
