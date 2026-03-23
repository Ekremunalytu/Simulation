import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveMultivariableLimitPathsResult,
  type MultivariableLimitPathsParams,
  type MultivariableLimitPathsResult,
} from './logic'

const MultivariableLimitPathsVisualization = lazy(async () => ({
  default: (await import('./Visualization')).MultivariableLimitPathsVisualization,
}))

const defaultParams: MultivariableLimitPathsParams = {
  functionType: 'consistent',
  targetX: 0,
  targetY: 0,
  pathPair: 'line-vs-parabola',
}

const presets: PresetConfig<MultivariableLimitPathsParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  {
    name: 'Çift Yol Testi',
    params: { functionType: 'path-dependent', targetX: 0, targetY: 0, pathPair: 'line-vs-parabola' },
  },
  {
    name: 'Diagonal Ayrışması',
    params: { functionType: 'path-dependent', targetX: 0.4, targetY: -0.2, pathPair: 'diagonals' },
  },
]

const multivariableLimitPathsDefinition = {
  id: 'multivariable-limit-paths',
  title: 'İki Değişkenli Limit Yolları',
  subtitle: 'Çift Yol Testini Görselleştir',
  category: 'math',
  description:
    'İki değişkenli fonksiyonlarda hedef noktaya farklı yollarla yaklaş ve limitin varlığına dair kanıtın nasıl oluştuğunu gör.',
  icon: '⇢',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'functionType',
      label: 'Fonksiyon Ailesi',
      type: 'select',
      options: [
        { label: 'Consistent', value: 'consistent' },
        { label: 'Path Dependent', value: 'path-dependent' },
        { label: 'Unbounded', value: 'unbounded' },
      ],
    },
    { key: 'targetX', label: 'Hedef x', type: 'slider', min: -1, max: 1, step: 0.1 },
    { key: 'targetY', label: 'Hedef y', type: 'slider', min: -1, max: 1, step: 0.1 },
    {
      key: 'pathPair',
      label: 'Yol Çifti',
      type: 'select',
      options: [
        { label: 'Axes', value: 'axes' },
        { label: 'Line vs Parabola', value: 'line-vs-parabola' },
        { label: 'Diagonals', value: 'diagonals' },
      ],
    },
  ],
  formulaTeX: 'İki yol farklı limite gidiyorsa limit yoktur',
  theory: {
    primaryFormula: 'Eğer lim_(x,y→(a,b)) f(x,y) varsa, tüm yollar aynı limite gitmelidir.',
    formulaLabel: 'Çift yol testi',
    symbols: [
      { symbol: '(a,b)', meaning: 'Yaklaşım yapılan hedef nokta' },
      { symbol: 'yol', meaning: 'Hedefe yaklaşan parametrik veya örtük eğri' },
      { symbol: 'kanıt', meaning: 'İki yolun limit davranışının karşılaştırılması' },
    ],
    derivationSteps: [
      'Aynı hedefe giden iki farklı yol seç.',
      'Her yol üzerinde fonksiyon değerlerini sırayla örnekle.',
      'İki eğilim aynı sayıya gidiyorsa limit için destekleyici kanıt elde et.',
      'İki farklı sayıya gidiyorsa limitin olmadığı kesinleşir.',
    ],
    interpretation:
      'İki değişkenli limitte uzayda sonsuz farklı yaklaşım yolu vardır; bu yüzden tek yönlü sezgi yeterli olmaz.',
    pitfalls: [
      'Tek bir yol üzerinden limit kararı vermek.',
      'İki yolun aynı sayıya gitmesini kesin ispat sanmak.',
    ],
  },
  derive: deriveMultivariableLimitPathsResult,
  VisualizationComponent: MultivariableLimitPathsVisualization,
} satisfies SimulationModule<MultivariableLimitPathsParams, MultivariableLimitPathsResult>

export const multivariableLimitPathsModule = defineSimulationModule(
  multivariableLimitPathsDefinition,
)
