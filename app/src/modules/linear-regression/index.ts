import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveLinearRegressionResult,
  type LinearRegressionDerivedResult,
  type LinearRegressionParams,
} from './logic'

const LinearRegressionVisualization = lazy(async () => ({
  default: (await import('./Visualization')).LinearRegressionVisualization,
}))

const defaultParams: LinearRegressionParams = {
  numPoints: 30,
  trueSlope: 2.5,
  trueIntercept: 3,
  noise: 5,
}

const presets: PresetConfig<LinearRegressionParams>[] = [
  { name: 'Temiz', params: { numPoints: 30, trueSlope: 2.5, trueIntercept: 3, noise: 1 } },
  { name: 'Gürültülü', params: { numPoints: 30, trueSlope: 2.5, trueIntercept: 3, noise: 15 } },
  { name: 'Seyrek', params: { numPoints: 8, trueSlope: 2.5, trueIntercept: 3, noise: 5 } },
  { name: 'Yoğun', params: { numPoints: 100, trueSlope: 2.5, trueIntercept: 3, noise: 5 } },
  { name: 'Negatif', params: { numPoints: 30, trueSlope: -1.5, trueIntercept: 20, noise: 4 } },
]

const linearRegressionDefinition = {
  id: 'linear-regression',
  title: 'Linear Regression',
  subtitle: 'Best-Fit Line',
  category: 'ml',
  description:
    'Ordinary least squares yönteminin veriye nasıl bir doğru oturttuğunu incele. Eğimi, gürültüyü ve örnek sayısını değiştirerek uyum kalitesi ile residual davranışını gözlemle.',
  icon: '📈',
  difficulty: 'beginner',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'numPoints', label: 'Veri Noktaları', type: 'slider', min: 5, max: 150, step: 5 },
    { key: 'trueSlope', label: 'Gerçek Eğim', type: 'slider', min: -5, max: 5, step: 0.1 },
    { key: 'trueIntercept', label: 'Gerçek Kesişim', type: 'slider', min: -10, max: 10, step: 0.5 },
    { key: 'noise', label: 'Gürültü Seviyesi', type: 'slider', min: 0, max: 20, step: 0.5 },
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
