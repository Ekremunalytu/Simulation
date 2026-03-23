import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  derivePolarAreaResult,
  type PolarAreaParams,
  type PolarAreaResult,
} from './logic'

const PolarAreaVisualization = lazy(async () => ({
  default: (await import('./Visualization')).PolarAreaVisualization,
}))

const defaultParams: PolarAreaParams = {
  curveType: 'rose',
  scale: 2,
  sectors: 12,
}

const presets: PresetConfig<PolarAreaParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { curveType: 'cardioid', scale: 1.6, sectors: 14 } },
  { name: 'Karşılaştırmalı', params: { curveType: 'spiral', scale: 1.4, sectors: 16 } },
]

const polarAreaDefinition = {
  id: 'polar-area',
  title: 'Polar Alan',
  subtitle: 'Sektörlerle Alan Topla',
  category: 'math',
  description:
    'Polar koordinatlarda alanın sektörler üzerinden nasıl biriktiğini gözlemle. Rose, cardioid ve spiral gibi eğrilerde aynı temel alan fikrinin nasıl çalıştığını karşılaştır.',
  icon: 'θ',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'curveType',
      label: 'Eğri',
      type: 'select',
      options: [
        { label: 'Rose', value: 'rose' },
        { label: 'Cardioid', value: 'cardioid' },
        { label: 'Spiral', value: 'spiral' },
      ],
    },
    { key: 'scale', label: 'Ölçek', type: 'slider', min: 0.8, max: 2.5, step: 0.1 },
    { key: 'sectors', label: 'Sektör Sayısı', type: 'slider', min: 6, max: 20, step: 1 },
  ],
  formulaTeX: 'A = 1/2 ∫ r(θ)^2 dθ',
  theory: {
    primaryFormula: 'A = (1/2) ∫[α,β] r(θ)^2 dθ',
    formulaLabel: 'Polar alan formülü',
    symbols: [
      { symbol: 'r(θ)', meaning: 'Açıya bağlı yarıçap' },
      { symbol: 'Δθ', meaning: 'Küçük sektör açısı' },
      { symbol: '1/2 · r² · Δθ', meaning: 'Küçük sektör alanı' },
    ],
    derivationSteps: [
      'Polar eğriyi küçük açı dilimlerine ayır.',
      'Her dilimde yarıçapı kullanarak sektör alanı hesapla.',
      'Bu küçük sektörleri toplayarak yaklaşık alanı bul.',
      'Dilimi küçülttükçe toplam polar alan integraline yakınsar.',
    ],
    interpretation: 'Polar alanda temel yapı Kartezyen dikdörtgen değil sektördür. Bu yüzden r² terimi doğal olarak ortaya çıkar.',
    pitfalls: [
      'r negatif olduğunda alanın işaret değiştirdiğini sanmak.',
      'Polar eğrinin kapandığı açısal aralığı yanlış seçmek.',
    ],
  },
  derive: derivePolarAreaResult,
  VisualizationComponent: PolarAreaVisualization,
} satisfies SimulationModule<PolarAreaParams, PolarAreaResult>

export const polarAreaModule = defineSimulationModule(polarAreaDefinition)
