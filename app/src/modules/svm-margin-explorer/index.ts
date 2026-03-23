import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveSVMMarginExplorerResult,
  type SVMMarginExplorerParams,
  type SVMMarginExplorerResult,
} from './logic'

const SVMMarginExplorerVisualization = lazy(async () => ({
  default: (await import('./Visualization')).SVMMarginExplorerVisualization,
}))

const defaultParams: SVMMarginExplorerParams = {
  numPoints: 70,
  separation: 2.6,
  noise: 0.8,
  cValue: 1,
  datasetType: 'separable',
  kernelMode: 'linear',
}

const presets: PresetConfig<SVMMarginExplorerParams>[] = [
  { name: 'Keskin Marjin', params: defaultParams },
  {
    name: 'Soft Margin',
    params: {
      numPoints: 80,
      separation: 1.8,
      noise: 1.2,
      cValue: 0.45,
      datasetType: 'borderline',
      kernelMode: 'linear',
    },
  },
  {
    name: 'Kernel Önizleme',
    params: {
      numPoints: 84,
      separation: 2,
      noise: 0.9,
      cValue: 1.2,
      datasetType: 'xor',
      kernelMode: 'rbf-preview',
    },
  },
]

const svmMarginExplorerDefinition = {
  id: 'svm-margin-explorer',
  title: 'SVM Margin Explorer',
  subtitle: 'Support Vectors and Decision Boundaries',
  category: 'ml',
  description:
    'Lineer SVM karar sınırını, marjin çizgilerini ve support vectorleri aynı uzayda incele. C parametresi ile soft margin davranışını görünür şekilde karşılaştır.',
  icon: '📐',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'numPoints', label: 'Veri Noktası', type: 'slider', min: 30, max: 120, step: 10 },
    { key: 'separation', label: 'Ayrım', type: 'slider', min: 1, max: 4, step: 0.2 },
    { key: 'noise', label: 'Gürültü', type: 'slider', min: 0, max: 2.5, step: 0.1 },
    { key: 'cValue', label: 'C Değeri', type: 'slider', min: 0.2, max: 2.2, step: 0.05 },
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
    {
      key: 'kernelMode',
      label: 'Kernel Modu',
      type: 'select',
      options: [
        { label: 'Linear', value: 'linear' },
        { label: 'RBF Preview', value: 'rbf-preview' },
      ],
    },
  ],
  formulaTeX: 'min 1/2 ||w||² + C Σ max(0, 1 - y(w·x + b))',
  theory: {
    primaryFormula: 'Karar sınırı: w·x + b = 0, marjin çizgileri: w·x + b = ±1',
    formulaLabel: 'Maksimum marjin geometrisi',
    symbols: [
      { symbol: 'w', meaning: 'Karar sınırının normali' },
      { symbol: 'b', meaning: 'Bias terimi' },
      { symbol: 'C', meaning: 'Hata cezası ile marjin genişliği arasındaki denge' },
      { symbol: 'support vector', meaning: 'Sınıra en yakın ve kararı belirleyen örnekler' },
    ],
    derivationSteps: [
      'Model, sınıfları ayıran doğrusal bir sınır arar.',
      'Amaç yalnızca ayırmak değil, iki sınıf arasındaki marjini mümkün olduğunca büyütmektir.',
      'C parametresi, geniş marjin ile eğitim hatasını azaltma hedefi arasında denge kurar.',
      'Sınıra yakın kalan support vectorler, nihai karar sınırını belirleyen kritik örneklerdir.',
    ],
    interpretation:
      'SVM, tüm veri noktalarını aynı ağırlıkta kullanmak yerine kararı gerçekten belirleyen küçük bir kritik örnek kümesine odaklanır.',
    pitfalls: [
      'Yüksek C değerini otomatik olarak daha iyi genelleme sanmak.',
      'Lineer veriyle kernel önizlemenin zorunlu olduğunu düşünmek.',
    ],
  },
  derive: deriveSVMMarginExplorerResult,
  VisualizationComponent: SVMMarginExplorerVisualization,
  codeExample: `for x, y in data:
    margin = y * (dot(w, x) + b)
    if margin < 1:
        w = w - lr * (w - C * y * x)
        b = b + lr * C * y`,
} satisfies SimulationModule<SVMMarginExplorerParams, SVMMarginExplorerResult>

export const svmMarginExplorerModule = defineSimulationModule(svmMarginExplorerDefinition)
