import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveBiasVarianceOverfittingLabResult,
  type BiasVarianceOverfittingLabParams,
  type BiasVarianceOverfittingLabResult,
} from './logic'

const BiasVarianceOverfittingLabVisualization = lazy(async () => ({
  default: (await import('./Visualization')).BiasVarianceOverfittingLabVisualization,
}))

const defaultParams: BiasVarianceOverfittingLabParams = {
  scenario: 'balanced',
  sampleCount: 26,
  noise: 0.14,
  maxDegree: 8,
  regularization: 0.02,
}

const presets: PresetConfig<BiasVarianceOverfittingLabParams>[] = [
  { name: 'Dengeli Veri', params: defaultParams },
  {
    name: 'Noisy Data',
    params: { scenario: 'noisy', sampleCount: 28, noise: 0.24, maxDegree: 8, regularization: 0.03 },
  },
  {
    name: 'Sparse Coverage',
    params: { scenario: 'sparse', sampleCount: 22, noise: 0.12, maxDegree: 8, regularization: 0.01 },
  },
]

const biasVarianceOverfittingLabDefinition = {
  id: 'bias-variance-overfitting-lab',
  title: 'Bias-Variance / Overfitting Lab',
  subtitle: 'Train ve Validation Eğrileri Nerede Ayrılıyor?',
  category: 'ml',
  description:
    'Model karmaşıklığını derece derece artır ve train-validation hatalarının ne zaman ayrıştığını izle. Aynı veri üzerinde underfit, sweet spot ve overfit bölgelerini görünür kıl.',
  icon: 'λ',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'scenario',
      label: 'Senaryo',
      type: 'select',
      options: [
        { label: 'Balanced', value: 'balanced' },
        { label: 'Noisy', value: 'noisy' },
        { label: 'Sparse', value: 'sparse' },
      ],
    },
    { key: 'sampleCount', label: 'Train Noktası', type: 'slider', min: 16, max: 42, step: 2 },
    { key: 'noise', label: 'Gürültü', type: 'slider', min: 0.04, max: 0.35, step: 0.01 },
    { key: 'maxDegree', label: 'Maks Derece', type: 'slider', min: 4, max: 10, step: 1 },
    { key: 'regularization', label: 'Ridge', type: 'slider', min: 0, max: 0.1, step: 0.005 },
  ],
  formulaTeX: '\\hat y(x)=\\sum_{k=0}^{d} w_k x^k',
  theory: {
    primaryFormula: 'w = (X^T X + λI)^{-1} X^T y',
    formulaLabel: 'Polinomsal fit ve regularization',
    symbols: [
      { symbol: 'd', meaning: 'Model karmaşıklığını temsil eden polinom derecesi' },
      { symbol: 'λ', meaning: 'Ridge regularization katsayısı' },
      { symbol: 'validation error', meaning: 'Genelleme hatası için ayrı doğrulama ölçümü' },
    ],
    derivationSteps: [
      'Aynı train verisini farklı polinom dereceleriyle fit et.',
      'Her derece için train ve validation hatasını ayrı hesapla.',
      'Karmaşıklık arttıkça önce bias azalır, sonra variance baskın hale gelmeye başlar.',
      'Regularization ile yüksek derecelerdeki aşırı dalgalanmayı yumuşat.',
    ],
    interpretation:
      'Overfitting çoğu zaman tek bir kötü karar değil, karmaşıklık arttıkça train başarısı ile genelleme arasındaki bağın kopmasıdır.',
    pitfalls: [
      'Sadece train hatasına bakarak model seçmek.',
      'Validation eğrisi dönmeye başlamışken daha karmaşık modelin her zaman daha iyi olacağını sanmak.',
    ],
  },
  derive: deriveBiasVarianceOverfittingLabResult,
  VisualizationComponent: BiasVarianceOverfittingLabVisualization,
} satisfies SimulationModule<BiasVarianceOverfittingLabParams, BiasVarianceOverfittingLabResult>

export const biasVarianceOverfittingLabModule = defineSimulationModule(
  biasVarianceOverfittingLabDefinition,
)
