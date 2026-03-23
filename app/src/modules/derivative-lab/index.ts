import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveDerivativeLabResult,
  type DerivativeLabParams,
  type DerivativeLabResult,
} from './logic'

const DerivativeLabVisualization = lazy(async () => ({
  default: (await import('./Visualization')).DerivativeLabVisualization,
}))

const defaultParams: DerivativeLabParams = {
  functionType: 'cubic',
  point: 0.5,
  initialH: 1.5,
  steps: 7,
}

const presets: PresetConfig<DerivativeLabParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  {
    name: 'Sezgisel',
    params: { functionType: 'sine', point: 0, initialH: 1.2, steps: 6 },
  },
  {
    name: 'Karşılaştırmalı',
    params: { functionType: 'exp', point: 0.2, initialH: 2, steps: 8 },
  },
]

const derivativeLabDefinition = {
  id: 'derivative-lab',
  title: 'Türev Laboratuvarı',
  subtitle: 'Secanttan Tangente',
  category: 'math',
  description:
    'Bir noktadaki anlık değişim oranının secant doğrularının limitinden nasıl doğduğunu izle. h küçüldükçe eğimin tangent doğrusuna yakınsamasını gerçek zamanlı takip et.',
  icon: '∂',
  difficulty: 'beginner',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'functionType',
      label: 'Fonksiyon',
      type: 'select',
      options: [
        { label: 'Cubic', value: 'cubic' },
        { label: 'Sin(x)', value: 'sine' },
        { label: 'e^x', value: 'exp' },
      ],
    },
    { key: 'point', label: 'İncelenen Nokta (a)', type: 'slider', min: -1.5, max: 1.5, step: 0.1 },
    { key: 'initialH', label: 'Başlangıç h', type: 'slider', min: 0.5, max: 2.5, step: 0.1 },
    { key: 'steps', label: 'Yaklaşım Adımı', type: 'slider', min: 4, max: 10, step: 1 },
  ],
  formulaTeX: "f'(a) = lim h→0 [f(a+h) - f(a)] / h",
  theory: {
    primaryFormula: "f'(a) = lim h→0 [f(a+h) - f(a)] / h",
    formulaLabel: 'Türevin limit tanımı',
    symbols: [
      { symbol: 'a', meaning: 'Türevi aranan sabit nokta' },
      { symbol: 'h', meaning: 'İkinci noktayı a noktasına yaklaştıran yatay fark' },
      { symbol: '[f(a+h)-f(a)]/h', meaning: 'Secant doğrusunun eğimi' },
    ],
    derivationSteps: [
      'Fonksiyon üzerinde a ve a+h noktalarını seç.',
      'Bu iki noktayı birleştiren secant doğrusunun eğimini hesapla.',
      'h küçüldükçe ikinci nokta a noktasına yapışır ve secant doğrusu tangent doğrusuna yaklaşır.',
      'Limitte elde edilen eğim, anlık değişim oranı yani türevdir.',
    ],
    interpretation:
      'Türev, bir fonksiyonun tek bir noktadaki yerel eğimini ölçer. Grafikte bu, tangent doğrusunun eğimi olarak görünür.',
    pitfalls: [
      'Büyük h ile hesaplanan ortalama değişimi doğrudan türev sanmak.',
      'Türevin tüm grafiğin değil, seçilen noktanın özelliği olduğunu unutmak.',
    ],
  },
  derive: deriveDerivativeLabResult,
  VisualizationComponent: DerivativeLabVisualization,
} satisfies SimulationModule<DerivativeLabParams, DerivativeLabResult>

export const derivativeLabModule = defineSimulationModule(derivativeLabDefinition)
