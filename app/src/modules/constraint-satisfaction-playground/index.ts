import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveConstraintSatisfactionResult,
  type ConstraintSatisfactionParams,
  type ConstraintSatisfactionResult,
} from './logic'

const ConstraintSatisfactionVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ConstraintSatisfactionVisualization,
}))

const defaultParams: ConstraintSatisfactionParams = {
  solver: 'mrv-forward-checking',
  graphPreset: 'australia-map',
  colorCount: 3,
  maxSteps: 80,
  variableOrderBias: 'high-degree',
}

const presets: PresetConfig<ConstraintSatisfactionParams>[] = [
  {
    name: 'Triangle Sıkışması',
    params: {
      solver: 'plain-backtracking',
      graphPreset: 'triangle',
      colorCount: 3,
      maxSteps: 40,
      variableOrderBias: 'static',
    },
  },
  {
    name: 'Australia Heuristic',
    params: {
      solver: 'mrv-forward-checking',
      graphPreset: 'australia-map',
      colorCount: 3,
      maxSteps: 80,
      variableOrderBias: 'high-degree',
    },
  },
  {
    name: 'Dense AC-3',
    params: {
      solver: 'ac3-assisted',
      graphPreset: 'dense-six-node',
      colorCount: 3,
      maxSteps: 120,
      variableOrderBias: 'high-degree',
    },
  },
]

const constraintSatisfactionDefinition = {
  id: 'constraint-satisfaction-playground',
  title: 'Constraint Satisfaction Playground',
  subtitle: 'Graph Coloring, Pruning, and Backtracking Tradeoffs',
  category: 'ml',
  description:
    'Graph coloring üzerinden constraint satisfaction mantığını izle. Naive backtracking, MRV + forward checking ve AC-3 destekli arama aynı problem ailesinde karşılaştırılır.',
  icon: '🕸️',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'solver',
      label: 'Solver',
      type: 'select',
      options: [
        { label: 'Plain Backtracking', value: 'plain-backtracking' },
        { label: 'MRV + Forward Checking', value: 'mrv-forward-checking' },
        { label: 'AC-3 Assisted', value: 'ac3-assisted' },
      ],
    },
    {
      key: 'graphPreset',
      label: 'Graph Preset',
      type: 'select',
      options: [
        { label: 'Triangle', value: 'triangle' },
        { label: 'Australia Map', value: 'australia-map' },
        { label: 'Dense Six Node', value: 'dense-six-node' },
      ],
    },
    {
      key: 'colorCount',
      label: 'Color Count',
      type: 'slider',
      min: 2,
      max: 4,
      step: 1,
    },
    {
      key: 'maxSteps',
      label: 'Maksimum Adım',
      type: 'slider',
      min: 10,
      max: 120,
      step: 5,
    },
    {
      key: 'variableOrderBias',
      label: 'Variable Bias',
      type: 'select',
      options: [
        { label: 'Static', value: 'static' },
        { label: 'High Degree', value: 'high-degree' },
      ],
    },
  ],
  formulaTeX: 'CSP = (X, D, C)',
  theory: {
    primaryFormula: 'Backtracking + variable ordering + constraint propagation = smaller search tree',
    formulaLabel: 'CSP çözüm hattı',
    symbols: [
      { symbol: 'X', meaning: 'Atanacak değişken kümesi' },
      { symbol: 'D', meaning: 'Her değişken için domain değerleri' },
      { symbol: 'C', meaning: 'Komşu düğümlerin aynı renge sahip olamayacağı gibi kısıtlar' },
    ],
    derivationSteps: [
      'Graph coloring problemi, her düğümün bir değişken olduğu bir CSP olarak yazılır.',
      'Plain backtracking, atama yapar ve ancak conflict gördüğünde geri sarar.',
      'MRV, domaini en daralan değişkeni önce seçerek darboğazı erken keşfeder.',
      'Forward checking ve AC-3, henüz seçilmemiş düğümlerin domainlerini önceden budar.',
    ],
    interpretation:
      'CSP modüllerinde amaç sadece çözüm bulmak değil, çözümün ne kadar arama maliyetiyle bulunduğunu da görünür kılmaktır.',
    pitfalls: [
      'Backtrack sayısının düşük olması her zaman daha iyi solver anlamına gelmez; consistency check sayısına da bakmak gerekir.',
      'Yetersiz renk sayısında pruning güçlü olsa da çözüm üretilemeyebilir.',
    ],
  },
  derive: deriveConstraintSatisfactionResult,
  VisualizationComponent: ConstraintSatisfactionVisualization,
  codeExample: `def backtrack(assignments):
    if all_assigned(assignments):
        return assignments
    var = select_unassigned_variable()
    for color in domain[var]:
        if consistent(var, color):
            assign(var, color)
            propagate_constraints()
            result = backtrack(assignments)
            if result:
                return result
            undo(var)`,
} satisfies SimulationModule<ConstraintSatisfactionParams, ConstraintSatisfactionResult>

export const constraintSatisfactionPlaygroundModule = defineSimulationModule(
  constraintSatisfactionDefinition,
)
