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
    name: 'Immediate Win',
    params: {
      pruning: true,
      depthLimit: 3,
      scenario: 'immediate-win',
      opponentStyle: 'optimal',
    },
  },
  {
    name: 'Forced Block',
    params: {
      pruning: true,
      depthLimit: 4,
      scenario: 'forced-block',
      opponentStyle: 'optimal',
    },
  },
  {
    name: 'Fork Threat',
    params: {
      pruning: true,
      depthLimit: 5,
      scenario: 'fork-threat',
      opponentStyle: 'optimal',
    },
  },
  {
    name: 'Deep Tree',
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
  subtitle: 'Adversarial Search on Tic-Tac-Toe States',
  category: 'ml',
  description:
    'Kucuk bir game tree ustunde adversarial search izle. Board state ile utility propagation yan yana gorunur; pruning kapandiginda maliyet hemen buyur.',
  icon: '♟️',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'pruning', label: 'Alpha-Beta Pruning', type: 'toggle' },
    { key: 'depthLimit', label: 'Depth Limit', type: 'slider', min: 1, max: 6, step: 1 },
    {
      key: 'scenario',
      label: 'Scenario',
      type: 'select',
      options: [
        { label: 'Immediate Win', value: 'immediate-win' },
        { label: 'Forced Block', value: 'forced-block' },
        { label: 'Fork Threat', value: 'fork-threat' },
        { label: 'Deep Tree', value: 'deep-tree' },
      ],
    },
    {
      key: 'opponentStyle',
      label: 'Opponent Style',
      type: 'select',
      options: [
        { label: 'Optimal', value: 'optimal' },
        { label: 'Imperfect', value: 'imperfect' },
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
