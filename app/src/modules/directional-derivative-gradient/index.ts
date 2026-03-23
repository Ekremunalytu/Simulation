import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveDirectionalDerivativeGradientResult,
  type DirectionalDerivativeGradientParams,
  type DirectionalDerivativeGradientResult,
} from './logic'

const DirectionalDerivativeGradientVisualization = lazy(async () => ({
  default: (await import('./Visualization')).DirectionalDerivativeGradientVisualization,
}))

const defaultParams: DirectionalDerivativeGradientParams = {
  surfaceType: 'paraboloid',
  pointX: 0.8,
  pointY: 0.4,
  directionAngle: 35,
}

const presets: PresetConfig<DirectionalDerivativeGradientParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  {
    name: 'Gradient Yönü',
    params: { surfaceType: 'paraboloid', pointX: 1, pointY: 0, directionAngle: 0 },
  },
  {
    name: 'Dalgalı Yüzey',
    params: { surfaceType: 'wave', pointX: 0.5, pointY: 1, directionAngle: 120 },
  },
]

const directionalDerivativeGradientDefinition = {
  id: 'directional-derivative-gradient',
  title: 'Yönlü Türev ve Gradyan',
  subtitle: 'Projeksiyonla Artışı Oku',
  category: 'math',
  description:
    'Seçilen bir doğrultuda yüzeyin ne kadar değiştiğini yönlü türev ile ölç ve bunun gradyan vektörünün izdüşümü olduğunu gör.',
  icon: '∇',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'surfaceType',
      label: 'Yüzey',
      type: 'select',
      options: [
        { label: 'Paraboloid', value: 'paraboloid' },
        { label: 'Saddle', value: 'saddle' },
        { label: 'Wave', value: 'wave' },
      ],
    },
    { key: 'pointX', label: 'x₀', type: 'slider', min: -2, max: 2, step: 0.1 },
    { key: 'pointY', label: 'y₀', type: 'slider', min: -2, max: 2, step: 0.1 },
    { key: 'directionAngle', label: 'Yön Açısı', type: 'slider', min: 0, max: 180, step: 5 },
  ],
  formulaTeX: 'D_u f(a,b) = ∇f(a,b) · u',
  theory: {
    primaryFormula: 'Dᵤf(a,b) = ∇f(a,b) · u',
    formulaLabel: 'Yönlü türevin gradyanla ilişkisi',
    symbols: [
      { symbol: 'u', meaning: 'Birim yön vektörü' },
      { symbol: '∇f', meaning: 'Gradyan vektörü' },
      { symbol: 'Dᵤf', meaning: 'u doğrultusundaki yönlü türev' },
    ],
    derivationSteps: [
      'Önce gradyan vektörünü hesapla.',
      'Seçilen yönü birim vektöre dönüştür.',
      'Skaler çarpım ile analitik yönlü türevi bul.',
      'Aynı değeri sonlu fark yaklaşımıyla doğrula.',
    ],
    interpretation:
      'Gradyan, tüm doğrultulardaki yerel değişimi tek vektörde toplar. Yönlü türev, bunun seçilmiş bir yön üzerindeki gölgesidir.',
    pitfalls: [
      'Yön vektörünü normalize etmeden formülü uygulamak.',
      'Gradyanı contour eğrilerine teğet sanmak; gerçekte normaldir.',
    ],
  },
  derive: deriveDirectionalDerivativeGradientResult,
  VisualizationComponent: DirectionalDerivativeGradientVisualization,
} satisfies SimulationModule<
  DirectionalDerivativeGradientParams,
  DirectionalDerivativeGradientResult
>

export const directionalDerivativeGradientModule = defineSimulationModule(
  directionalDerivativeGradientDefinition,
)
