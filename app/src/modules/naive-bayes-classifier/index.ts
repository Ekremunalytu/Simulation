import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveNaiveBayesClassifierResult,
  type NaiveBayesClassifierParams,
  type NaiveBayesClassifierResult,
} from './logic'

const NaiveBayesClassifierVisualization = lazy(async () => ({
  default: (await import('./Visualization')).NaiveBayesClassifierVisualization,
}))

const defaultParams: NaiveBayesClassifierParams = {
  numPoints: 70,
  separation: 2.3,
  noise: 1,
  distributionType: 'balanced',
  queryX: 0.4,
  queryY: 0.2,
  smoothing: true,
}

const presets: PresetConfig<NaiveBayesClassifierParams>[] = [
  { name: 'Dengeli', params: defaultParams },
  {
    name: 'Örtüşen',
    params: {
      numPoints: 80,
      separation: 1.7,
      noise: 1.5,
      distributionType: 'overlap',
      queryX: 0.2,
      queryY: 0.3,
      smoothing: true,
    },
  },
  {
    name: 'Dengesiz Öncel',
    params: {
      numPoints: 80,
      separation: 2.4,
      noise: 0.9,
      distributionType: 'imbalanced',
      queryX: 0.1,
      queryY: 0.1,
      smoothing: false,
    },
  },
]

const naiveBayesClassifierDefinition = {
  id: 'naive-bayes-classifier',
  title: 'Naive Bayes',
  subtitle: 'Öncel ve Likelihood ile Karar',
  category: 'ml',
  description:
    'Gaussian Naive Bayes kararını sınıf öncülleri ve özellik likelihoodleri üzerinden adım adım izle. Posterior karşılaştırması aynı sorgu noktası için görünür hale gelir.',
  icon: '🧮',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'numPoints', label: 'Veri Noktası', type: 'slider', min: 30, max: 120, step: 10 },
    { key: 'separation', label: 'Ayrım', type: 'slider', min: 1, max: 4, step: 0.2 },
    { key: 'noise', label: 'Gürültü', type: 'slider', min: 0, max: 2.5, step: 0.1 },
    {
      key: 'distributionType',
      label: 'Dağılım Tipi',
      type: 'select',
      options: [
        { label: 'Dengeli', value: 'balanced' },
        { label: 'Örtüşen', value: 'overlap' },
        { label: 'Dengesiz Öncel', value: 'imbalanced' },
      ],
    },
    { key: 'queryX', label: 'Sorgu X', type: 'slider', min: -5, max: 5, step: 0.1 },
    { key: 'queryY', label: 'Sorgu Y', type: 'slider', min: -5, max: 5, step: 0.1 },
    { key: 'smoothing', label: 'Variance Smoothing', type: 'toggle' },
  ],
  formulaTeX: 'P(y|x) ∝ P(y) Πᵢ P(xᵢ|y)',
  theory: {
    primaryFormula: 'Posterior = prior × likelihood_x × likelihood_y / evidence',
    formulaLabel: 'Naive Bayes ayrıştırması',
    symbols: [
      { symbol: 'P(y)', meaning: 'Sınıf öncel olasılığı' },
      { symbol: 'P(xᵢ|y)', meaning: 'Özelliğin sınıf altındaki likelihood değeri' },
      { symbol: 'naive', meaning: 'Özellikler sınıf verildiğinde bağımsız varsayılır' },
    ],
    derivationSteps: [
      'Önce her sınıfın veri içindeki prior oranı hesaplanır.',
      'Sorgu noktasının x ve y özellikleri için sınıf koşullu likelihood hesaplanır.',
      'Bu katkılar çarpılarak sınıf başına joint skor elde edilir.',
      'Joint skorlar normalize edilerek posterior karşılaştırması yapılır.',
    ],
    interpretation:
      'Naive Bayes basit görünür ama veri az olduğunda ve özellikler kısmen bağımsız davrandığında beklenenden güçlü bir taban sınıflandırıcıdır.',
    pitfalls: [
      'Posterioru sadece likelihood ile açıklamaya çalışıp prior etkisini unutmak.',
      'Bağımsızlık varsayımını gerçek dünyanın tam betimi sanmak.',
    ],
  },
  derive: deriveNaiveBayesClassifierResult,
  VisualizationComponent: NaiveBayesClassifierVisualization,
  codeExample: `score_y = prior_y * gaussian(x, mean_x[y], var_x[y]) * gaussian(y0, mean_y[y], var_y[y])
posterior_y = score_y / sum(scores)`,
} satisfies SimulationModule<NaiveBayesClassifierParams, NaiveBayesClassifierResult>

export const naiveBayesClassifierModule = defineSimulationModule(
  naiveBayesClassifierDefinition,
)
