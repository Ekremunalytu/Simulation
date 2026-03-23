import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveMinimaxAlphaBetaResult,
  type MinimaxAlphaBetaParams,
  type MinimaxAlphaBetaResult,
} from './logic'

const MinimaxAlphaBetaVisualization = lazy(async () => ({
  default: (await import('./Visualization')).MinimaxAlphaBetaVisualization,
}))

const defaultParams: MinimaxAlphaBetaParams = {
  pruning: true,
  depthLimit: 4,
  scenario: 'forced-block',
  opponentStyle: 'optimal',
}

const presets: PresetConfig<MinimaxAlphaBetaParams>[] = [
  {
    name: 'Anında Kazanma',
    params: {
      pruning: true,
      depthLimit: 3,
      scenario: 'immediate-win',
      opponentStyle: 'optimal',
    },
  },
  {
    name: 'Zorunlu Blok',
    params: {
      pruning: true,
      depthLimit: 4,
      scenario: 'forced-block',
      opponentStyle: 'optimal',
    },
  },
  {
    name: 'Çatal Tehdidi',
    params: {
      pruning: true,
      depthLimit: 5,
      scenario: 'fork-threat',
      opponentStyle: 'optimal',
    },
  },
  {
    name: 'Derin Ağaç',
    params: {
      pruning: true,
      depthLimit: 5,
      scenario: 'deep-tree',
      opponentStyle: 'optimal',
    },
  },
]

const minimaxAlphaBetaDefinition = {
  id: 'minimax-alpha-beta',
  title: 'Minimax & Alpha-Beta',
  subtitle: 'Adversarial Search in Tic-Tac-Toe',
  category: 'ml',
  description:
    'Küçük bir oyun ağacı üzerinde adversarial aramayı izle. Tahta durumu ile utility yayılımı yan yana görünür; budama kapandığında maliyet hemen büyür.',
  icon: '♟️',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'pruning', label: 'Alpha-Beta Budama', type: 'toggle' },
    { key: 'depthLimit', label: 'Derinlik Sınırı', type: 'slider', min: 1, max: 6, step: 1 },
    {
      key: 'scenario',
      label: 'Senaryo',
      type: 'select',
      options: [
        { label: 'Anında Kazanma', value: 'immediate-win' },
        { label: 'Zorunlu Blok', value: 'forced-block' },
        { label: 'Çatal Tehdidi', value: 'fork-threat' },
        { label: 'Derin Ağaç', value: 'deep-tree' },
      ],
    },
    {
      key: 'opponentStyle',
      label: 'Rakip Stili',
      type: 'select',
      options: [
        { label: 'Optimal', value: 'optimal' },
        { label: 'Sınırlı Bakış', value: 'imperfect' },
      ],
    },
  ],
  formulaTeX: 'V(s) = max_a min_a V(result(s, a))',
  derive: deriveMinimaxAlphaBetaResult,
  VisualizationComponent: MinimaxAlphaBetaVisualization,
  codeExample: `def minimax(state, depth, maximizing):
    if terminal(state) or depth == 0:
        return evaluate(state)

    if maximizing:
        value = -float("inf")
        for move in legal_moves(state):
            value = max(value, minimax(result(state, move), depth - 1, False))
        return value

    value = float("inf")
    for move in legal_moves(state):
        value = min(value, minimax(result(state, move), depth - 1, True))
    return value`,
} satisfies SimulationModule<MinimaxAlphaBetaParams, MinimaxAlphaBetaResult>

export const minimaxAlphaBetaModule = defineSimulationModule(minimaxAlphaBetaDefinition)
