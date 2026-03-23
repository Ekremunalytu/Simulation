import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveQLearningGridworldResult,
  type QLearningGridworldParams,
  type QLearningGridworldResult,
} from './logic'

const QLearningGridworldVisualization = lazy(async () => ({
  default: (await import('./Visualization')).QLearningGridworldVisualization,
}))

const defaultParams: QLearningGridworldParams = {
  alpha: 0.2,
  gamma: 0.92,
  epsilon: 0.18,
  episodes: 90,
  stepPenalty: -0.12,
  mapLayout: 'easy-goal',
}

const presets: PresetConfig<QLearningGridworldParams>[] = [
  {
    name: 'Kolay Hedef',
    params: {
      alpha: 0.2,
      gamma: 0.92,
      epsilon: 0.16,
      episodes: 80,
      stepPenalty: -0.1,
      mapLayout: 'easy-goal',
    },
  },
  {
    name: 'Uçurum Yürüyüşü',
    params: {
      alpha: 0.2,
      gamma: 0.95,
      epsilon: 0.22,
      episodes: 110,
      stepPenalty: -0.15,
      mapLayout: 'cliff-walk',
    },
  },
  {
    name: 'Seyrek Ödül',
    params: {
      alpha: 0.18,
      gamma: 0.96,
      epsilon: 0.28,
      episodes: 130,
      stepPenalty: -0.08,
      mapLayout: 'sparse-reward',
    },
  },
  {
    name: 'Keşifçi Ajan',
    params: {
      alpha: 0.22,
      gamma: 0.9,
      epsilon: 0.34,
      episodes: 120,
      stepPenalty: -0.12,
      mapLayout: 'exploratory',
    },
  },
]

const qLearningGridworldDefinition = {
  id: 'q-learning-gridworld',
  title: 'Q-Learning Gridworld',
  subtitle: 'Ödül Sinyallerinden Politika Öğrenimi',
  category: 'ml',
  description:
    'Ödül, exploration ve öğrenilmiş politika arasındaki ilişkiyi gridworld üzerinde izle. Episode ödül eğrisi ile son greedy yol aynı senaryoda buluşur.',
  icon: '🤖',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'alpha', label: 'Alpha', type: 'slider', min: 0.05, max: 0.5, step: 0.01 },
    { key: 'gamma', label: 'Gamma', type: 'slider', min: 0.5, max: 0.99, step: 0.01 },
    { key: 'epsilon', label: 'Epsilon', type: 'slider', min: 0.01, max: 0.5, step: 0.01 },
    { key: 'episodes', label: 'Episode Sayısı', type: 'slider', min: 20, max: 160, step: 5 },
    { key: 'stepPenalty', label: 'Adım Cezası', type: 'slider', min: -0.5, max: -0.02, step: 0.01 },
    {
      key: 'mapLayout',
      label: 'Harita Düzeni',
      type: 'select',
      options: [
        { label: 'Kolay Hedef', value: 'easy-goal' },
        { label: 'Uçurum Yürüyüşü', value: 'cliff-walk' },
        { label: 'Seyrek Ödül', value: 'sparse-reward' },
        { label: 'Keşifçi', value: 'exploratory' },
      ],
    },
  ],
  formulaTeX: 'Q(s,a) ← Q(s,a) + α [r + γ max_a Q(s\',a) - Q(s,a)]',
  derive: deriveQLearningGridworldResult,
  VisualizationComponent: QLearningGridworldVisualization,
  codeExample: `for episode in range(num_episodes):
    state = start
    done = False
    while not done:
        action = epsilon_greedy(Q[state], epsilon)
        next_state, reward, done = env.step(action)
        target = reward + gamma * np.max(Q[next_state])
        Q[state, action] += alpha * (target - Q[state, action])
        state = next_state`,
} satisfies SimulationModule<QLearningGridworldParams, QLearningGridworldResult>

export const qLearningGridworldModule = defineSimulationModule(qLearningGridworldDefinition)
