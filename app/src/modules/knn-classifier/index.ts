import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveKNNClassifierResult,
  type KNNClassifierParams,
  type KNNClassifierResult,
} from './logic'

const KNNClassifierVisualization = lazy(async () => ({
  default: (await import('./Visualization')).KNNClassifierVisualization,
}))

const defaultParams: KNNClassifierParams = {
  k: 5,
  numPoints: 60,
  separation: 2.4,
  noise: 1.2,
  distanceMetric: 'euclidean',
  queryX: 0.4,
  queryY: 0.2,
  weightedVote: false,
}

const presets: PresetConfig<KNNClassifierParams>[] = [
  { name: 'Dengeli', params: defaultParams },
  {
    name: 'Sınır Bölgesi',
    params: {
      k: 7,
      numPoints: 70,
      separation: 1.6,
      noise: 1.7,
      distanceMetric: 'euclidean',
      queryX: 0.1,
      queryY: 0.2,
      weightedVote: true,
    },
  },
  {
    name: 'Keskin Sınıflar',
    params: {
      k: 3,
      numPoints: 50,
      separation: 3,
      noise: 0.5,
      distanceMetric: 'manhattan',
      queryX: -1.2,
      queryY: -0.6,
      weightedVote: false,
    },
  },
]

const knnClassifierDefinition = {
  id: 'knn-classifier',
  title: 'K-En Yakın Komşu',
  subtitle: 'Yerel Komşulukla Sınıf Kararı',
  category: 'ml',
  description:
    'Bir sorgu noktasının sınıfını en yakın örnekleri kullanarak tahmin et. K, mesafe metriği ve ağırlıklı oy kararı aynı veri uzayında değiştirilebilir.',
  icon: '📍',
  difficulty: 'beginner',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'k', label: 'K Değeri', type: 'slider', min: 1, max: 11, step: 2 },
    { key: 'numPoints', label: 'Veri Noktası', type: 'slider', min: 20, max: 120, step: 10 },
    { key: 'separation', label: 'Sınıf Ayrımı', type: 'slider', min: 1, max: 4, step: 0.2 },
    { key: 'noise', label: 'Gürültü', type: 'slider', min: 0, max: 3, step: 0.1 },
    {
      key: 'distanceMetric',
      label: 'Mesafe Metriği',
      type: 'select',
      options: [
        { label: 'Euclidean', value: 'euclidean' },
        { label: 'Manhattan', value: 'manhattan' },
      ],
    },
    { key: 'queryX', label: 'Sorgu X', type: 'slider', min: -5, max: 5, step: 0.1 },
    { key: 'queryY', label: 'Sorgu Y', type: 'slider', min: -5, max: 5, step: 0.1 },
    { key: 'weightedVote', label: 'Ağırlıklı Oy', type: 'toggle' },
  ],
  formulaTeX: 'ŷ = mode({y_i | x_i ∈ N_k(x)})',
  theory: {
    primaryFormula: 'N_k(x) = x için en yakın k örnek, karar = majority vote veya distance-weighted vote',
    formulaLabel: 'KNN karar kuralı',
    symbols: [
      { symbol: 'k', meaning: 'Komşu sayısı' },
      { symbol: 'N_k(x)', meaning: 'Sorgu noktasının en yakın k komşusu' },
      { symbol: 'ŷ', meaning: 'Tahmin edilen sınıf etiketi' },
    ],
    derivationSteps: [
      'Sorgu noktasının tüm eğitim örneklerine uzaklığı hesaplanır.',
      'Uzaklığa göre en yakın k komşu seçilir.',
      'Komşular düz ya da mesafe ağırlıklı oy ile bir sınıf önerir.',
      'En yüksek toplam oyu alan sınıf sorgu için tahmin edilir.',
    ],
    interpretation:
      'KNN parametre öğrenmez; kararı doğrudan veri uzayının yerel yapısından çıkarır. Bu yüzden eğitim maliyeti düşüktür ama tahmin anı pahalı olabilir.',
    pitfalls: [
      'K değerini çok küçük seçip gürültüye aşırı duyarlı olmak.',
      'Ölçeklenmemiş özelliklerde mesafe metriğine gereğinden fazla güvenmek.',
    ],
  },
  derive: deriveKNNClassifierResult,
  VisualizationComponent: KNNClassifierVisualization,
  codeExample: `distances = [(distance(query, point), label) for point, label in data]
neighbors = sorted(distances)[:k]
prediction = majority_vote(label for _, label in neighbors)`,
} satisfies SimulationModule<KNNClassifierParams, KNNClassifierResult>

export const knnClassifierModule = defineSimulationModule(knnClassifierDefinition)
