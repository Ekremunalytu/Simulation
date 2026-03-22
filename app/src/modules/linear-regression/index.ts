import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import { LinearRegressionVisualization } from './Visualization'
import {
  deriveLinearRegressionResult,
  type LinearRegressionDerivedResult,
  type LinearRegressionParams,
} from './logic'

const defaultParams: LinearRegressionParams = {
  numPoints: 30,
  trueSlope: 2.5,
  trueIntercept: 3,
  noise: 5,
}

const presets: PresetConfig<LinearRegressionParams>[] = [
  { name: 'Clean', params: { numPoints: 30, trueSlope: 2.5, trueIntercept: 3, noise: 1 } },
  { name: 'Noisy', params: { numPoints: 30, trueSlope: 2.5, trueIntercept: 3, noise: 15 } },
  { name: 'Sparse', params: { numPoints: 8, trueSlope: 2.5, trueIntercept: 3, noise: 5 } },
  { name: 'Dense', params: { numPoints: 100, trueSlope: 2.5, trueIntercept: 3, noise: 5 } },
  { name: 'Negative', params: { numPoints: 30, trueSlope: -1.5, trueIntercept: 20, noise: 4 } },
]

const linearRegressionDefinition = {
  id: 'linear-regression',
  title: 'Linear Regression',
  subtitle: 'The Foundation of Prediction',
  category: 'ml',
  description:
    'Explore how ordinary least squares fits a line through data. Adjust slope, noise, and sample size to see the effect on fit quality and residuals.',
  icon: '📈',
  difficulty: 'beginner',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'numPoints', label: 'Data Points', type: 'slider', min: 5, max: 150, step: 5 },
    { key: 'trueSlope', label: 'True Slope', type: 'slider', min: -5, max: 5, step: 0.1 },
    { key: 'trueIntercept', label: 'True Intercept', type: 'slider', min: -10, max: 10, step: 0.5 },
    { key: 'noise', label: 'Noise Level', type: 'slider', min: 0, max: 20, step: 0.5 },
  ],
  formulaTeX: 'ŷ = β₀ + β₁x',
  derive: deriveLinearRegressionResult,
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
} satisfies SimulationModule<LinearRegressionParams, LinearRegressionDerivedResult>

export const linearRegressionModule = defineSimulationModule(linearRegressionDefinition)
