import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  derivePerceptronTrainerResult,
  type PerceptronTrainerParams,
  type PerceptronTrainerResult,
} from './logic'

const PerceptronTrainerVisualization = lazy(async () => ({
  default: (await import('./Visualization')).PerceptronTrainerVisualization,
}))

const defaultParams: PerceptronTrainerParams = {
  learningRate: 0.18,
  epochs: 20,
  numPoints: 60,
  separation: 2.6,
  noise: 0.8,
  datasetType: 'separable',
}

const presets: PresetConfig<PerceptronTrainerParams>[] = [
  { name: 'Ayrılabilir', params: defaultParams },
  {
    name: 'Sınırda',
    params: {
      learningRate: 0.14,
      epochs: 24,
      numPoints: 70,
      separation: 1.6,
      noise: 1.4,
      datasetType: 'borderline',
    },
  },
  {
    name: 'XOR',
    params: {
      learningRate: 0.12,
      epochs: 24,
      numPoints: 80,
      separation: 2,
      noise: 0.7,
      datasetType: 'xor',
    },
  },
]

const perceptronTrainerDefinition = {
  id: 'perceptron-trainer',
  title: 'Perceptron Training',
  subtitle: 'Learning a Linear Decision Boundary',
  category: 'ml',
  description:
    'Tek katmanlı perceptronun epoch ilerledikçe karar doğrusunu nasıl güncellediğini izle. Hata sayısı ve accuracy eğrisi aynı anda görünür.',
  icon: '⚡',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'learningRate', label: 'Öğrenme Oranı', type: 'slider', min: 0.02, max: 0.5, step: 0.02 },
    { key: 'epochs', label: 'Epoch', type: 'slider', min: 4, max: 30, step: 1 },
    { key: 'numPoints', label: 'Veri Noktası', type: 'slider', min: 20, max: 120, step: 10 },
    { key: 'separation', label: 'Ayrım', type: 'slider', min: 1, max: 4, step: 0.2 },
    { key: 'noise', label: 'Gürültü', type: 'slider', min: 0, max: 2.5, step: 0.1 },
    {
      key: 'datasetType',
      label: 'Veri Tipi',
      type: 'select',
      options: [
        { label: 'Separable', value: 'separable' },
        { label: 'Borderline', value: 'borderline' },
        { label: 'XOR', value: 'xor' },
      ],
    },
  ],
  formulaTeX: 'w ← w + η(y - ŷ)x',
  theory: {
    primaryFormula: 'Eğer y · (w·x + b) ≤ 0 ise w ← w + ηyx ve b ← b + ηy',
    formulaLabel: 'Perceptron güncellemesi',
    symbols: [
      { symbol: 'w', meaning: 'Ağırlık vektörü' },
      { symbol: 'b', meaning: 'Bias terimi' },
      { symbol: 'η', meaning: 'Öğrenme oranı' },
      { symbol: 'y', meaning: 'Gerçek sınıf etiketi (-1 / +1)' },
    ],
    derivationSteps: [
      'Her örnek için mevcut doğrusal skor hesaplanır.',
      'Tahmin yanlışsa ağırlıklar örneğin yönüne doğru güncellenir.',
      'Epoch sonunda yeni karar doğrusu tüm veri üzerinde yeniden değerlendirilir.',
      'Lineer ayrılabilir veri için perceptron sonlu adımda yakınsama eğilimi gösterir.',
    ],
    interpretation:
      'Perceptron, doğrusal karar sınırının öğrenilebildiği en temel sinir ağı bileşenidir; bu yüzden kapasite sınırları da aynı derecede öğreticidir.',
    pitfalls: [
      'XOR gibi lineer ayrılmayan veri için sıfır hata beklemek.',
      'Öğrenme oranını artırmanın her zaman daha hızlı yakınsama sağlayacağını düşünmek.',
    ],
  },
  derive: derivePerceptronTrainerResult,
  VisualizationComponent: PerceptronTrainerVisualization,
  codeExample: `for x, y in data:
    prediction = 1 if dot(w, x) + b >= 0 else -1
    if prediction != y:
        w = w + lr * y * x
        b = b + lr * y`,
} satisfies SimulationModule<PerceptronTrainerParams, PerceptronTrainerResult>

export const perceptronTrainerModule = defineSimulationModule(perceptronTrainerDefinition)
