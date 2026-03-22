import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import { GradientDescentVisualization } from './Visualization'
import {
  deriveGradientDescentResult,
  type GradientDescentParams,
  type GradientDescentResult,
} from './logic'

const defaultParams: GradientDescentParams = {
  learningRate: 0.05,
  iterations: 100,
  startX: 3,
  startY: 3,
  momentum: false,
  stochastic: false,
}

const presets: PresetConfig<GradientDescentParams>[] = [
  {
    name: 'Default',
    params: {
      learningRate: 0.05,
      iterations: 100,
      startX: 3,
      startY: 3,
      momentum: false,
      stochastic: false,
    },
  },
  {
    name: 'Fast',
    params: {
      learningRate: 0.2,
      iterations: 50,
      startX: 3,
      startY: 3,
      momentum: false,
      stochastic: false,
    },
  },
  {
    name: 'Momentum',
    params: {
      learningRate: 0.05,
      iterations: 100,
      startX: 3,
      startY: 3,
      momentum: true,
      stochastic: false,
    },
  },
  {
    name: 'SGD',
    params: {
      learningRate: 0.05,
      iterations: 200,
      startX: 3,
      startY: 3,
      momentum: false,
      stochastic: true,
    },
  },
  {
    name: 'Diverging',
    params: {
      learningRate: 0.8,
      iterations: 50,
      startX: 3,
      startY: 3,
      momentum: false,
      stochastic: false,
    },
  },
]

const gradientDescentDefinition = {
  id: 'gradient-descent',
  title: 'Gradient Descent',
  subtitle: 'The Path of Least Resistance',
  category: 'ml',
  description:
    'An interactive visualization of gradient descent navigating loss surfaces. Tune learning rate, momentum, and observe convergence behavior in real-time.',
  icon: '📉',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'learningRate',
      label: 'Learning Rate (α)',
      type: 'slider',
      min: 0.001,
      max: 1,
      step: 0.001,
    },
    {
      key: 'iterations',
      label: 'Iterations',
      type: 'slider',
      min: 10,
      max: 500,
      step: 10,
    },
    {
      key: 'startX',
      label: 'Start X (θ₀)',
      type: 'slider',
      min: -4,
      max: 4,
      step: 0.5,
    },
    {
      key: 'startY',
      label: 'Start Y (θ₁)',
      type: 'slider',
      min: -4,
      max: 4,
      step: 0.5,
    },
    { key: 'momentum', label: 'Momentum', type: 'toggle' },
    { key: 'stochastic', label: 'Stochastic', type: 'toggle' },
  ],
  formulaTeX: 'θⱼ := θⱼ - α · ∂/∂θⱼ J(θ)',
  derive: deriveGradientDescentResult,
  VisualizationComponent: GradientDescentVisualization,
  codeExample: `import numpy as np

def gradient_descent(X, y, lr=0.01, epochs=100):
    m = len(y)
    theta = np.zeros(X.shape[1])

    for _ in range(epochs):
        predictions = X @ theta
        errors = predictions - y
        gradient = (1/m) * X.T @ errors
        theta -= lr * gradient

    return theta`,
} satisfies SimulationModule<GradientDescentParams, GradientDescentResult>

export const gradientDescentModule = defineSimulationModule(gradientDescentDefinition)
