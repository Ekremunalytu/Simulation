import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  derivePCAExplorerResult,
  type PCAExplorerParams,
  type PCAExplorerResult,
} from './logic'

const PCAExplorerVisualization = lazy(async () => ({
  default: (await import('./Visualization')).PCAExplorerVisualization,
}))

const defaultParams: PCAExplorerParams = {
  sampleCount: 90,
  datasetShape: 'ellipse',
  rotation: 35,
  spreadX: 2.4,
  spreadY: 0.8,
  noise: 0.8,
  componentCount: 1,
}

const presets: PresetConfig<PCAExplorerParams>[] = [
  { name: 'Elips', params: defaultParams },
  {
    name: 'Çift Küme',
    params: { ...defaultParams, datasetShape: 'two-clusters', rotation: 25, spreadX: 1.8, spreadY: 0.7 },
  },
  {
    name: 'İnce Çizgi',
    params: { ...defaultParams, datasetShape: 'line', rotation: 48, spreadX: 2.1, spreadY: 0.45, componentCount: 2 },
  },
]

const pcaExplorerDefinition = {
  id: 'pca-explorer',
  title: 'PCA Explorer',
  subtitle: 'Variance, Projection, Reconstruction',
  category: 'ml',
  description:
    'Veri bulutunu merkezle, principal component eksenlerini çıkar ve 1B/2B projeksiyonun geometriyi nasıl değiştirdiğini izle.',
  icon: 'λ',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'sampleCount', label: 'Örnek Sayısı', type: 'slider', min: 40, max: 140, step: 10 },
    {
      key: 'datasetShape',
      label: 'Veri Şekli',
      type: 'select',
      options: [
        { label: 'Ellipse', value: 'ellipse' },
        { label: 'Two Clusters', value: 'two-clusters' },
        { label: 'Line', value: 'line' },
      ],
    },
    { key: 'rotation', label: 'Rotation', type: 'slider', min: 0, max: 90, step: 1 },
    { key: 'spreadX', label: 'Spread X', type: 'slider', min: 0.6, max: 3.5, step: 0.1 },
    { key: 'spreadY', label: 'Spread Y', type: 'slider', min: 0.2, max: 2.4, step: 0.1 },
    { key: 'noise', label: 'Noise', type: 'slider', min: 0.1, max: 1.8, step: 0.1 },
    { key: 'componentCount', label: 'Component Count', type: 'slider', min: 1, max: 2, step: 1 },
  ],
  formulaTeX: 'C = (1/N) X^T X,  C v = λ v',
  theory: {
    primaryFormula: 'PCA, kovaryans matrisinin özvektörlerini kullanarak veriyi en yüksek varyans yönlerine yeniden ifade eder.',
    formulaLabel: 'Covariance -> eigenvectors -> projection',
    symbols: [
      { symbol: 'C', meaning: 'Kovaryans matrisi' },
      { symbol: 'v', meaning: 'Principal component yönü' },
      { symbol: 'λ', meaning: 'İlgili varyans miktarı' },
    ],
    derivationSteps: [
      'Verinin ortalamasını çıkar ve bulutu merkezle.',
      'Kovaryans matrisini kurarak eksenler arası birlikte değişimi ölç.',
      'En büyük özdeğere sahip özvektör, en baskın varyans yönünü verir.',
      'Projeksiyon ve reconstruction, bu eksenlerin sıkıştırma gücünü görünür hale getirir.',
    ],
    interpretation:
      'PCA sınıfları öğrenmez; sadece veri bulutunun geometriğini ve enerjinin hangi yönlerde yoğunlaştığını açık eder.',
    pitfalls: [
      'Explained variance yüksek diye görevin otomatik olarak çözüldüğünü düşünmek.',
      'PCA eksenlerini sınıf sınırıyla karıştırmak.',
    ],
  },
  derive: derivePCAExplorerResult,
  VisualizationComponent: PCAExplorerVisualization,
} satisfies SimulationModule<PCAExplorerParams, PCAExplorerResult>

export const pcaExplorerModule = defineSimulationModule(pcaExplorerDefinition)
