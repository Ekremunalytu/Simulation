import type { SimulationModule } from '../../types/simulation'
import { GradientDescentVisualization } from './Visualization'

export const gradientDescentModule: SimulationModule = {
  id: 'gradient-descent',
  title: 'Gradient Descent',
  subtitle: 'The Path of Least Resistance',
  category: 'ml',
  description:
    'An interactive visualization of gradient descent navigating loss surfaces. Tune learning rate, momentum, and observe convergence behavior in real-time.',
  icon: '📉',
  difficulty: 'intermediate',

  defaultParams: {
    learningRate: 0.05,
    iterations: 100,
    startX: 3,
    startY: 3,
    momentum: false,
    stochastic: false,
  },

  presets: [
    { name: 'Default', params: { learningRate: 0.05, iterations: 100, startX: 3, startY: 3, momentum: false, stochastic: false } },
    { name: 'Fast', params: { learningRate: 0.2, iterations: 50, startX: 3, startY: 3, momentum: false, stochastic: false } },
    { name: 'Momentum', params: { learningRate: 0.05, iterations: 100, startX: 3, startY: 3, momentum: true, stochastic: false } },
    { name: 'SGD', params: { learningRate: 0.05, iterations: 200, startX: 3, startY: 3, momentum: false, stochastic: true } },
    { name: 'Diverging', params: { learningRate: 0.8, iterations: 50, startX: 3, startY: 3, momentum: false, stochastic: false } },
  ],

  controlSchema: [
    { key: 'learningRate', label: 'Learning Rate (α)', type: 'slider', min: 0.001, max: 1, step: 0.001 },
    { key: 'iterations', label: 'Iterations', type: 'slider', min: 10, max: 500, step: 10 },
    { key: 'startX', label: 'Start X (θ₀)', type: 'slider', min: -4, max: 4, step: 0.5 },
    { key: 'startY', label: 'Start Y (θ₁)', type: 'slider', min: -4, max: 4, step: 0.5 },
    { key: 'momentum', label: 'Momentum', type: 'toggle' },
    { key: 'stochastic', label: 'Stochastic', type: 'toggle' },
  ],

  formulaTeX: 'θⱼ := θⱼ - α · ∂/∂θⱼ J(θ)',

  explanationGenerator: (params) => {
    const lr = params.learningRate as number
    const iters = params.iterations as number
    const mom = params.momentum as boolean
    const stoch = params.stochastic as boolean

    let text = `Learning rate α = ${lr}. `

    if (lr > 0.5) {
      text += 'Warning: High learning rate may cause divergence — the optimizer overshoots the minimum. '
    } else if (lr < 0.01) {
      text += 'Low learning rate ensures stable convergence but may take many iterations to reach the minimum. '
    } else {
      text += 'This learning rate should provide stable convergence toward the global minimum. '
    }

    if (mom) {
      text += 'Momentum is enabled (β=0.9), which helps accelerate through flat regions and dampens oscillations. '
    }

    if (stoch) {
      text += 'Stochastic mode adds random noise to gradients, simulating mini-batch behavior. The path will be noisier but can escape local minima. '
    }

    text += `Running for ${iters} iterations.`
    return text
  },

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
}
