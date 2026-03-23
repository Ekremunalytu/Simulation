import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveLogisticRegressionResult,
  type LogisticRegressionParams,
  type LogisticRegressionResult,
} from './logic'

const LogisticRegressionVisualization = lazy(async () => ({
  default: (await import('./Visualization')).LogisticRegressionVisualization,
}))

const defaultParams: LogisticRegressionParams = {
  numPoints: 70,
  separation: 2.4,
  noise: 0.9,
  learningRate: 0.12,
  epochs: 24,
  regularization: 0.05,
  datasetType: 'separable',
}

const presets: PresetConfig<LogisticRegressionParams>[] = [
  { name: 'Temel', params: defaultParams },
  {
    name: 'Borderline',
    params: { ...defaultParams, datasetType: 'borderline', separation: 1.8, noise: 1.4 },
  },
  {
    name: 'Dengesiz',
    params: { ...defaultParams, datasetType: 'imbalanced', numPoints: 80, epochs: 28 },
  },
]

const logisticRegressionDefinition = {
  id: 'logistic-regression',
  title: 'Logistic Regression',
  subtitle: 'Probability-Based Classification',
  category: 'ml',
  description:
    'Sigmoid karar sınırının epoch ilerledikçe nasıl öğrenildiğini izle. Olasılık yüzeyi, decision boundary ve training curves aynı görsel dilde birleşir.',
  icon: 'σ',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'numPoints', label: 'Veri Noktası', type: 'slider', min: 30, max: 120, step: 10 },
    { key: 'separation', label: 'Ayrım', type: 'slider', min: 1, max: 4, step: 0.2 },
    { key: 'noise', label: 'Gürültü', type: 'slider', min: 0.2, max: 2.4, step: 0.1 },
    { key: 'learningRate', label: 'Learning Rate', type: 'slider', min: 0.02, max: 0.3, step: 0.01 },
    { key: 'epochs', label: 'Epoch', type: 'slider', min: 8, max: 40, step: 1 },
    { key: 'regularization', label: 'Regularization', type: 'slider', min: 0, max: 0.3, step: 0.01 },
    {
      key: 'datasetType',
      label: 'Dataset',
      type: 'select',
      options: [
        { label: 'Separable', value: 'separable' },
        { label: 'Borderline', value: 'borderline' },
        { label: 'Imbalanced', value: 'imbalanced' },
      ],
    },
  ],
  formulaTeX: 'p(y=1|x)=σ(w·x+b)',
  theory: {
    primaryFormula: 'L = -(1/N) Σ [y log p + (1-y) log (1-p)] + λ||w||²/2',
    formulaLabel: 'Binary cross-entropy ve sigmoid',
    symbols: [
      { symbol: 'σ', meaning: 'Sigmoid aktivasyonu' },
      { symbol: 'p', meaning: 'Pozitif sınıf olasılığı' },
      { symbol: 'λ', meaning: 'Regularization katsayısı' },
    ],
    derivationSteps: [
      'Önce doğrusal skor w·x + b hesaplanır.',
      'Sigmoid bu skoru 0-1 arası olasılığa dönüştürür.',
      'Cross-entropy kaybı, tahmin edilen olasılık ile gerçek etiket arasındaki farkı ölçer.',
      'Gradient descent ağırlıkları bu kaybı azaltacak yönde günceller.',
    ],
    interpretation:
      'Logistic regression, lineer karar sınırını olasılık yorumu ile birlikte sunar; aynı boundary hem sınıf kararı hem güven düzeyi üretir.',
    pitfalls: [
      'Accuracy yüksek diye karar sınırının iyi kalibre olduğunu varsaymak.',
      'Doğrusal olmayan veri için lineer modelden fazlasını beklemek.',
    ],
  },
  derive: deriveLogisticRegressionResult,
  VisualizationComponent: LogisticRegressionVisualization,
} satisfies SimulationModule<LogisticRegressionParams, LogisticRegressionResult>

export const logisticRegressionModule = defineSimulationModule(logisticRegressionDefinition)
