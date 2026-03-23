import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveVectorFieldsResult,
  type VectorFieldsParams,
  type VectorFieldsResult,
} from './logic'

const VectorFieldsVisualization = lazy(async () => ({
  default: (await import('./Visualization')).VectorFieldsVisualization,
}))

const defaultParams: VectorFieldsParams = {
  fieldType: 'rotation',
  pointX: 1,
  pointY: 0.5,
}

const presets: PresetConfig<VectorFieldsParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { fieldType: 'radial', pointX: 1.2, pointY: 1.2 } },
  { name: 'Karşılaştırmalı', params: { fieldType: 'sink', pointX: -1, pointY: 1 } },
]

const vectorFieldsDefinition = {
  id: 'vector-fields',
  title: 'Vektör Alanları',
  subtitle: 'Her Noktada Bir Yön',
  category: 'math',
  description:
    'İki boyutlu vektör alanlarında her noktaya atanan yön ve büyüklüğü incele. Yerel vektör, streamline ve divergence/curl sezgisini birlikte oku.',
  icon: '→',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'fieldType',
      label: 'Alan Türü',
      type: 'select',
      options: [
        { label: 'Rotation', value: 'rotation' },
        { label: 'Radial', value: 'radial' },
        { label: 'Sink', value: 'sink' },
      ],
    },
    { key: 'pointX', label: 'x₀', type: 'slider', min: -2, max: 2, step: 0.1 },
    { key: 'pointY', label: 'y₀', type: 'slider', min: -2, max: 2, step: 0.1 },
  ],
  formulaTeX: 'F(x,y) = <P(x,y), Q(x,y)>',
  theory: {
    primaryFormula: 'F(x,y) = <P(x,y), Q(x,y)>',
    formulaLabel: 'Vektör alanı tanımı',
    symbols: [
      { symbol: 'P, Q', meaning: 'Sırasıyla x ve y bileşenleri' },
      { symbol: 'div F', meaning: 'Kaynak/sink eğilimi' },
      { symbol: 'curl F', meaning: 'Dönme eğilimi' },
    ],
    derivationSteps: [
      'Düzlemde örnek noktalar seç.',
      'Her noktada alanın verdiği vektörü hesapla.',
      'Seçili noktadaki vektörü ve akış çizgisini ayrı incele.',
      'Divergence ve curl ile alanın genel karakterini özetle.',
    ],
    interpretation: 'Vektör alanı, tek bir eğriden çok daha zengin bir nesnedir; her noktadaki yerel yön bilgisi tüm düzleme yayılır.',
    pitfalls: [
      'Tek bir oka bakıp tüm alanı anlamaya çalışmak.',
      'Divergence ile curl kavramlarını aynı şey sanmak.',
    ],
  },
  derive: deriveVectorFieldsResult,
  VisualizationComponent: VectorFieldsVisualization,
} satisfies SimulationModule<VectorFieldsParams, VectorFieldsResult>

export const vectorFieldsModule = defineSimulationModule(vectorFieldsDefinition)
