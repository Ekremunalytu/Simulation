import type { SimulationModule } from '../../types/simulation'
import { LinearRegressionVisualization } from './Visualization'

export const linearRegressionModule: SimulationModule = {
  id: 'linear-regression',
  title: 'Linear Regression',
  subtitle: 'The Foundation of Prediction',
  category: 'ml',
  description:
    'Explore how ordinary least squares fits a line through data. Adjust slope, noise, and sample size to see the effect on fit quality and residuals.',
  icon: '📈',
  difficulty: 'beginner',

  defaultParams: {
    numPoints: 30,
    trueSlope: 2.5,
    trueIntercept: 3,
    noise: 5,
  },

  presets: [
    { name: 'Clean', params: { numPoints: 30, trueSlope: 2.5, trueIntercept: 3, noise: 1 } },
    { name: 'Noisy', params: { numPoints: 30, trueSlope: 2.5, trueIntercept: 3, noise: 15 } },
    { name: 'Sparse', params: { numPoints: 8, trueSlope: 2.5, trueIntercept: 3, noise: 5 } },
    { name: 'Dense', params: { numPoints: 100, trueSlope: 2.5, trueIntercept: 3, noise: 5 } },
    { name: 'Negative', params: { numPoints: 30, trueSlope: -1.5, trueIntercept: 20, noise: 4 } },
  ],

  controlSchema: [
    { key: 'numPoints', label: 'Data Points', type: 'slider', min: 5, max: 150, step: 5 },
    { key: 'trueSlope', label: 'True Slope', type: 'slider', min: -5, max: 5, step: 0.1 },
    { key: 'trueIntercept', label: 'True Intercept', type: 'slider', min: -10, max: 10, step: 0.5 },
    { key: 'noise', label: 'Noise Level', type: 'slider', min: 0, max: 20, step: 0.5 },
  ],

  formulaTeX: 'ŷ = β₀ + β₁x',

  explanationGenerator: (params) => {
    const noise = params.noise as number
    const n = params.numPoints as number
    const slope = params.trueSlope as number

    let text = `Generating ${n} data points with true relationship y = ${slope}x + ${params.trueIntercept}. `

    if (noise < 3) {
      text += 'Low noise: the fitted line should almost perfectly match the true relationship, giving R² close to 1. '
    } else if (noise > 10) {
      text += 'High noise: the data points scatter widely around the true line. R² will be lower, and residuals larger. '
    } else {
      text += 'Moderate noise provides a realistic scenario for regression. '
    }

    if (n < 15) {
      text += 'With few data points, the fit is less reliable and more sensitive to outliers.'
    } else if (n > 80) {
      text += 'A large sample gives a more stable and reliable estimate of the true parameters.'
    }

    return text
  },

  VisualizationComponent: LinearRegressionVisualization,

  codeExample: `import numpy as np
from sklearn.linear_model import LinearRegression

X = np.random.rand(100, 1) * 10
y = 2.5 * X.squeeze() + 3 + np.random.randn(100) * 5

model = LinearRegression()
model.fit(X, y)

print(f"Slope: {model.coef_[0]:.2f}")
print(f"Intercept: {model.intercept_:.2f}")
print(f"R²: {model.score(X, y):.4f}")`,
}
