import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveTransformerAttentionPlaygroundResult,
  type TransformerAttentionPlaygroundParams,
  type TransformerAttentionPlaygroundResult,
} from './logic'

const TransformerAttentionPlaygroundVisualization = lazy(async () => ({
  default: (await import('./Visualization')).TransformerAttentionPlaygroundVisualization,
}))

const defaultParams: TransformerAttentionPlaygroundParams = {
  scenario: 'pronoun-resolution',
  attentionTemperature: 0.9,
  positionEncoding: true,
  positionStrength: 0.8,
}

const presets: PresetConfig<TransformerAttentionPlaygroundParams>[] = [
  {
    name: 'Pronoun Resolution',
    params: {
      scenario: 'pronoun-resolution',
      attentionTemperature: 0.9,
      positionEncoding: true,
      positionStrength: 0.75,
    },
  },
  {
    name: 'Negation Scope',
    params: {
      scenario: 'negation-scope',
      attentionTemperature: 0.8,
      positionEncoding: true,
      positionStrength: 0.6,
    },
  },
  {
    name: 'Order Sensitive',
    params: {
      scenario: 'order-sensitive',
      attentionTemperature: 1.05,
      positionEncoding: true,
      positionStrength: 1.15,
    },
  },
  {
    name: 'No Positions',
    params: {
      scenario: 'order-sensitive',
      attentionTemperature: 1.05,
      positionEncoding: false,
      positionStrength: 0,
    },
  },
]

const transformerAttentionPlaygroundDefinition = {
  id: 'transformer-attention-playground',
  title: 'Transformer Attention Playground',
  subtitle: 'Q, K, V and Positional Encoding',
  category: 'ml',
  description:
    'Token embeddinglerinden query, key ve value projeksiyonlarının nasıl üretildiğini ve tek bir attention head içinde hangi tokenin hangisine neden baktığını izle. Pozisyon sinyali kapatıldığında tekrar eden tokenların nasıl karıştığı görünür hale gelir.',
  icon: '🧠',
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
        { label: 'Pronoun Resolution', value: 'pronoun-resolution' },
        { label: 'Negation Scope', value: 'negation-scope' },
        { label: 'Order Sensitive', value: 'order-sensitive' },
      ],
    },
    {
      key: 'attentionTemperature',
      label: 'Attention Temperature',
      type: 'slider',
      min: 0.55,
      max: 1.6,
      step: 0.05,
    },
    {
      key: 'positionEncoding',
      label: 'Positional Encoding',
      type: 'toggle',
    },
    {
      key: 'positionStrength',
      label: 'Position Strength',
      type: 'slider',
      min: 0,
      max: 1.4,
      step: 0.05,
    },
  ],
  formulaTeX: 'Attention(Q, K, V) = softmax(QK^T / √d) V',
  theory: {
    primaryFormula: 'Bir tokenin query vektörü, diğer tokenlerin key vektörleriyle eşleşir; softmax bu eşleşmeyi normalize ederek hangi value bilgisinin taşınacağını belirler.',
    formulaLabel: 'Scaled dot-product attention',
    symbols: [
      { symbol: 'Q', meaning: 'Aktif tokenin ne aradığını temsil eden sorgu vektörü' },
      { symbol: 'K', meaning: 'Her tokenin sunduğu eşleşme anahtarı' },
      { symbol: 'V', meaning: 'Eşleşme başarılı olursa taşınacak içerik vektörü' },
      { symbol: 'positional encoding', meaning: 'Aynı tokenin farklı konumlarda farklı davranmasını sağlayan sinyal' },
    ],
    derivationSteps: [
      'Önce her token embeddingi isteğe bağlı positional encoding ile zenginleştirilir.',
      'Aynı embedding, üç farklı lineer dönüşümle query, key ve value uzaylarına taşınır.',
      'Her query, tüm key vektörleriyle noktasal çarpım yaparak ham attention skorları üretir.',
      'Softmax, bu skorları ağırlıklara çevirir ve context vector value vektörlerinin ağırlıklı toplamı olur.',
    ],
    interpretation:
      'Attention map sadece “hangi tokene bakıldı” bilgisini değil, hangi bilginin context vector içine ne şiddette taşındığını da açıklar.',
    pitfalls: [
      'Yüksek attention ağırlığı tek başına semantik önem anlamına gelmez; projeksiyon matrisi de sonucu belirler.',
      'Positional encoding kapalıyken aynı embeddinge sahip tekrarlar ayırt edilemeyebilir.',
    ],
  },
  derive: deriveTransformerAttentionPlaygroundResult,
  VisualizationComponent: TransformerAttentionPlaygroundVisualization,
  codeExample: `encoded = token_embedding + positional_encoding
Q = encoded @ W_q
K = encoded @ W_k
V = encoded @ W_v

scores = (Q @ K.T) / math.sqrt(d_model)
weights = softmax(scores, axis=-1)
context = weights @ V`,
} satisfies SimulationModule<
  TransformerAttentionPlaygroundParams,
  TransformerAttentionPlaygroundResult
>

export const transformerAttentionPlaygroundModule = defineSimulationModule(
  transformerAttentionPlaygroundDefinition,
)
