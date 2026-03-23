import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveBackpropagationNetworkResult,
  type BackpropagationNetworkParams,
  type BackpropagationNetworkResult,
} from './logic'

const BackpropagationNetworkVisualization = lazy(async () => ({
  default: (await import('./Visualization')).BackpropagationNetworkVisualization,
}))

const defaultParams: BackpropagationNetworkParams = {
  learningRate: 0.12,
  epochs: 24,
  hiddenUnits: 3,
  datasetType: 'xor',
  noise: 0.5,
  activation: 'tanh',
}

const presets: PresetConfig<BackpropagationNetworkParams>[] = [
  { name: 'XOR Öğrenimi', params: defaultParams },
  {
    name: 'Ayrılabilir',
    params: {
      learningRate: 0.08,
      epochs: 18,
      hiddenUnits: 2,
      datasetType: 'separable',
      noise: 0.7,
      activation: 'sigmoid',
    },
  },
  {
    name: 'Gürültülü XOR',
    params: {
      learningRate: 0.14,
      epochs: 28,
      hiddenUnits: 4,
      datasetType: 'noisy-xor',
      noise: 1.1,
      activation: 'relu',
    },
  },
]

const backpropagationNetworkDefinition = {
  id: 'backpropagation-network',
  title: 'Backpropagation Ağı',
  subtitle: 'Gizli Katmanla Doğrusal Olmayan Öğrenme',
  category: 'ml',
  description:
    'Küçük bir çok katmanlı ağın epoch ilerledikçe karar yüzeyini nasıl şekillendirdiğini incele. Loss eğrisi, doğruluk ve gizli katman aktivasyonları birlikte görünür.',
  icon: '🕸️',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    { key: 'learningRate', label: 'Öğrenme Oranı', type: 'slider', min: 0.02, max: 0.3, step: 0.01 },
    { key: 'epochs', label: 'Epoch', type: 'slider', min: 6, max: 32, step: 1 },
    { key: 'hiddenUnits', label: 'Gizli Birim', type: 'slider', min: 2, max: 5, step: 1 },
    {
      key: 'datasetType',
      label: 'Veri Tipi',
      type: 'select',
      options: [
        { label: 'Separable', value: 'separable' },
        { label: 'XOR', value: 'xor' },
        { label: 'Noisy XOR', value: 'noisy-xor' },
      ],
    },
    { key: 'noise', label: 'Gürültü', type: 'slider', min: 0, max: 1.8, step: 0.1 },
    {
      key: 'activation',
      label: 'Aktivasyon',
      type: 'select',
      options: [
        { label: 'Sigmoid', value: 'sigmoid' },
        { label: 'Tanh', value: 'tanh' },
        { label: 'ReLU', value: 'relu' },
      ],
    },
  ],
  formulaTeX: 'δ = ∂L/∂z,  w ← w - η∂L/∂w',
  theory: {
    primaryFormula: 'İleri geçiş ile tahmin üret, hatayı hesapla, gradyanı katmanlar boyunca geri yay ve ağırlıkları güncelle.',
    formulaLabel: 'Backpropagation döngüsü',
    symbols: [
      { symbol: 'L', meaning: 'Kayıp fonksiyonu' },
      { symbol: 'η', meaning: 'Öğrenme oranı' },
      { symbol: 'δ', meaning: 'Yerel hata terimi' },
      { symbol: 'hidden unit', meaning: 'Girdiyi doğrusal olmayan temsil uzayına taşıyan ara düğüm' },
    ],
    derivationSteps: [
      'Girdi katmandan gizli katmana, oradan çıkışa ileri taşınır.',
      'Tahmin ile gerçek etiket arasındaki kayıp hesaplanır.',
      'Çıkıştaki hata, zincir kuralı ile gizli katmana doğru geri yayılır.',
      'Her bağlantı ağırlığı, bu hatanın katkısına göre güncellenir.',
    ],
    interpretation:
      'Backpropagation, tek katmanlı modellerin kapasite sınırını aşarak veri için yeni ara temsil biçimleri öğrenir. XOR bunun klasik vitrini olur.',
    pitfalls: [
      'Gizli katman eklenince her veri setinin otomatik çözüldüğünü sanmak.',
      'Loss düşüşünü tek başına genelleme garantisi gibi yorumlamak.',
    ],
  },
  derive: deriveBackpropagationNetworkResult,
  VisualizationComponent: BackpropagationNetworkVisualization,
  codeExample: `hidden = activation(W1 @ x + b1)
output = sigmoid(W2 @ hidden + b2)
loss = binary_cross_entropy(output, y)
backpropagate(loss)`,
} satisfies SimulationModule<BackpropagationNetworkParams, BackpropagationNetworkResult>

export const backpropagationNetworkModule = defineSimulationModule(
  backpropagationNetworkDefinition,
)
