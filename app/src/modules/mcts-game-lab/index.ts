import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveMctsGameLabResult,
  type MctsGameLabParams,
  type MctsGameLabResult,
} from './logic'

const MctsGameLabVisualization = lazy(async () => ({
  default: (await import('./Visualization')).MctsGameLabVisualization,
}))

const defaultParams: MctsGameLabParams = {
  algorithm: 'mcts',
  boardPreset: 'opening',
  rolloutBudget: 120,
  explorationConstant: 1.2,
  maxDepth: 6,
  playerToMove: 'x',
}

const presets: PresetConfig<MctsGameLabParams>[] = [
  {
    name: 'Opening MCTS',
    params: {
      algorithm: 'mcts',
      boardPreset: 'opening',
      rolloutBudget: 120,
      explorationConstant: 1.2,
      maxDepth: 6,
      playerToMove: 'x',
    },
  },
  {
    name: 'Fork Threat Compare',
    params: {
      algorithm: 'mcts',
      boardPreset: 'fork-threat',
      rolloutBudget: 180,
      explorationConstant: 1.1,
      maxDepth: 7,
      playerToMove: 'o',
    },
  },
  {
    name: 'Endgame Minimax',
    params: {
      algorithm: 'minimax',
      boardPreset: 'endgame',
      rolloutBudget: 80,
      explorationConstant: 1,
      maxDepth: 7,
      playerToMove: 'x',
    },
  },
]

const mctsGameLabDefinition = {
  id: 'mcts-game-lab',
  title: 'MCTS Game Lab',
  subtitle: 'Exploration, Rollouts, and Move Selection in Tic-Tac-Toe',
  category: 'ml',
  description:
    'Tic-tac-toe üzerinde minimax ve Monte Carlo Tree Search davranışlarını karşılaştır. Aynı board state içinde visit counts, win-rate tahmini ve seçilen hamle birlikte görünür.',
  icon: '🎮',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'algorithm',
      label: 'Algorithm',
      type: 'select',
      options: [
        { label: 'MCTS', value: 'mcts' },
        { label: 'Minimax', value: 'minimax' },
      ],
    },
    {
      key: 'boardPreset',
      label: 'Board Preset',
      type: 'select',
      options: [
        { label: 'Opening', value: 'opening' },
        { label: 'Fork Threat', value: 'fork-threat' },
        { label: 'Endgame', value: 'endgame' },
      ],
    },
    {
      key: 'rolloutBudget',
      label: 'Rollout Budget',
      type: 'slider',
      min: 20,
      max: 400,
      step: 10,
    },
    {
      key: 'explorationConstant',
      label: 'Exploration Constant',
      type: 'slider',
      min: 0.2,
      max: 2.5,
      step: 0.1,
    },
    {
      key: 'maxDepth',
      label: 'Max Depth',
      type: 'slider',
      min: 2,
      max: 8,
      step: 1,
    },
    {
      key: 'playerToMove',
      label: 'Player To Move',
      type: 'select',
      options: [
        { label: 'X', value: 'x' },
        { label: 'O', value: 'o' },
      ],
    },
  ],
  formulaTeX: 'UCT = \\bar{X}_j + c \\sqrt{\\frac{\\ln N}{n_j}}',
  theory: {
    primaryFormula: 'MCTS trades exact search for sampled confidence estimates',
    formulaLabel: 'MCTS ve minimax karşılaştırması',
    symbols: [
      { symbol: 'N', meaning: 'Parent node toplam ziyaret sayısı' },
      { symbol: 'n_j', meaning: 'Child node ziyaret sayısı' },
      { symbol: '\\bar{X}_j', meaning: 'Child node ortalama ödül değeri' },
      { symbol: 'c', meaning: 'Exploration ile exploitation arasındaki denge sabiti' },
    ],
    derivationSteps: [
      'Minimax, derinlik sınırı içinde tüm olası hamleleri utility ile puanlar.',
      'MCTS, selection → expansion → rollout → backpropagation döngüsüyle ağaç kurar.',
      'UCT skoru, çok ziyaret edilen güçlü dallar ile az ziyaret edilmiş belirsiz dallar arasında denge kurar.',
      'Aynı tahta üzerinde iki yaklaşım farklı güven sinyalleri üretse de iyi rollout bütçesinde benzer hamlelere yakınsayabilir.',
    ],
    interpretation:
      'Adversarial search içinde soru sadece “en iyi hamle hangisi” değil, bu hamleye hangi arama mantığıyla ulaşıldığıdır.',
    pitfalls: [
      'Düşük rollout budget altında MCTS istikrarsız görünebilir.',
      'Minimax derinlik sınırı düşükse horizon effect yüzünden kısa vadeli hamlelere aşırı güvenebilir.',
    ],
  },
  derive: deriveMctsGameLabResult,
  VisualizationComponent: MctsGameLabVisualization,
  codeExample: `for _ in range(rollout_budget):
    node = select(root, uct)
    child = expand(node)
    reward = rollout(child.state)
    backpropagate(child, reward)

best_move = argmax(root.children, key=lambda child: child.visits)`,
} satisfies SimulationModule<MctsGameLabParams, MctsGameLabResult>

export const mctsGameLabModule = defineSimulationModule(mctsGameLabDefinition)
