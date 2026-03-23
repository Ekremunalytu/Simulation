import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveKMeansClusteringResult,
  type KMeansClusteringParams,
  type KMeansClusteringResult,
} from './logic'

const KMeansClusteringVisualization = lazy(async () => ({
  default: (await import('./Visualization')).KMeansClusteringVisualization,
}))

const defaultParams: KMeansClusteringParams = {
  clusterCount: 3,
  numPoints: 90,
  spread: 1.2,
  datasetShape: 'blobs',
  initStrategy: 'farthest-first',
  maxIterations: 10,
}

const presets: PresetConfig<KMeansClusteringParams>[] = [
  { name: 'Belirgin Bloblar', params: defaultParams },
  {
    name: 'Örtüşen Kümeler',
    params: {
      clusterCount: 3,
      numPoints: 90,
      spread: 1.5,
      datasetShape: 'overlap',
      initStrategy: 'random',
      maxIterations: 12,
    },
  },
  {
    name: 'Uzamış Yapılar',
    params: {
      clusterCount: 4,
      numPoints: 100,
      spread: 1,
      datasetShape: 'elongated',
      initStrategy: 'farthest-first',
      maxIterations: 12,
    },
  },
]

const kMeansClusteringDefinition = {
  id: 'k-means-clustering',
  title: 'K-Means Kümeleme',
  subtitle: 'Centroid Tabanlı Gruplama',
  category: 'ml',
  description:
    'Veri noktalarını centroidlere göre kümelere ayır ve her iterasyonda merkezlerin nasıl güncellendiğini izle. Inertia eğrisi ile görsel uzay aynı anda okunur.',
  icon: '🎯',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'clusterCount', label: 'Küme Sayısı', type: 'slider', min: 2, max: 5, step: 1 },
    { key: 'numPoints', label: 'Veri Noktası', type: 'slider', min: 40, max: 140, step: 10 },
    { key: 'spread', label: 'Yayılım', type: 'slider', min: 0.6, max: 2.2, step: 0.1 },
    {
      key: 'datasetShape',
      label: 'Veri Biçimi',
      type: 'select',
      options: [
        { label: 'Blobs', value: 'blobs' },
        { label: 'Overlap', value: 'overlap' },
        { label: 'Elongated', value: 'elongated' },
      ],
    },
    {
      key: 'initStrategy',
      label: 'Başlangıç Merkezi',
      type: 'select',
      options: [
        { label: 'Random', value: 'random' },
        { label: 'Farthest First', value: 'farthest-first' },
      ],
    },
    {
      key: 'maxIterations',
      label: 'Maksimum İterasyon',
      type: 'slider',
      min: 3,
      max: 16,
      step: 1,
    },
  ],
  formulaTeX: 'arg min Σ ||x - μ_c||²',
  theory: {
    primaryFormula: 'Atama: c = arg min_j ||x - μ_j||², Güncelleme: μ_j = mean(cluster_j)',
    formulaLabel: 'K-Means iki adımlı döngüsü',
    symbols: [
      { symbol: 'x', meaning: 'Veri noktası' },
      { symbol: 'μ_j', meaning: 'j. kümenin centroidi' },
      { symbol: 'inertia', meaning: 'Kare hata toplamı' },
    ],
    derivationSteps: [
      'Her nokta en yakın centroid’e atanır.',
      'Her küme için yeni centroid o kümedeki noktaların ortalaması olur.',
      'Atama ve güncelleme adımları inertia düşene kadar tekrar eder.',
      'Merkez hareketi durduğunda algoritma lokal bir çözüme yakınsamış olur.',
    ],
    interpretation:
      'K-Means geometrik olarak küresel kümeleri iyi ayırır; fakat kümeler uzamış ya da iç içe geçmişse centroid varsayımı zayıflar.',
    pitfalls: [
      'Küme sayısını sadece inertia düşüyor diye büyütmek.',
      'Başlangıç merkezlerinin etkisini göz ardı etmek.',
    ],
  },
  derive: deriveKMeansClusteringResult,
  VisualizationComponent: KMeansClusteringVisualization,
  codeExample: `centroids = init_centroids(data, k)
for _ in range(max_iter):
    clusters = assign_points(data, centroids)
    centroids = recompute_means(clusters)`,
} satisfies SimulationModule<KMeansClusteringParams, KMeansClusteringResult>

export const kMeansClusteringModule = defineSimulationModule(kMeansClusteringDefinition)
