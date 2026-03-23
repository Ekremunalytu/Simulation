import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveArcLengthResult,
  type ArcLengthParams,
  type ArcLengthResult,
} from './logic'

const ArcLengthVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ArcLengthVisualization,
}))

const defaultParams: ArcLengthParams = {
  curveType: 'parabola',
  segments: 14,
}

const presets: PresetConfig<ArcLengthParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { curveType: 'circle', segments: 12 } },
  { name: 'Karşılaştırmalı', params: { curveType: 'sine', segments: 16 } },
]

const arcLengthDefinition = {
  id: 'arc-length',
  title: 'Yay Uzunluğu',
  subtitle: 'Eğriyi Segmentlerle Ölç',
  category: 'math',
  description:
    'Bir eğrinin uzunluğunu kırık çizgi yaklaşımıyla hesapla. Segment sayısı arttıkça gerçek yay uzunluğuna nasıl yaklaşıldığını gözlemle.',
  icon: 's',
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
        { label: 'Parabola', value: 'parabola' },
        { label: 'Sine', value: 'sine' },
        { label: 'Circle Arc', value: 'circle' },
      ],
    },
    { key: 'segments', label: 'Segment Sayısı', type: 'slider', min: 6, max: 20, step: 1 },
  ],
  formulaTeX: 'L = ∫ sqrt(1 + (f\'(x))^2) dx',
  theory: {
    primaryFormula: 'L = lim max Δs→0 Σ Δs  = ∫ sqrt(1 + (f\'(x))²) dx',
    formulaLabel: 'Yay uzunluğunun limit ve integral formu',
    symbols: [
      { symbol: 'Δs', meaning: 'Küçük doğrusal parça uzunluğu' },
      { symbol: 'ΣΔs', meaning: 'Poligonal toplam uzunluk' },
      { symbol: 'sqrt(1 + (f\'(x))²)', meaning: 'Yerel uzunluk yoğunluğu' },
    ],
    derivationSteps: [
      'Eğriyi küçük doğrusal segmentlere böl.',
      'Her segmentin Öklidyen uzunluğunu hesapla.',
      'Bu uzunlukları toplayarak poligonal yaklaşımı elde et.',
      'Segmentler inceldikçe toplam gerçek yay uzunluğuna yakınsar.',
    ],
    interpretation: 'Yay uzunluğu, düz çizgi uzunluğunun eğri versiyonudur; limitte her eğri yeterince küçük ölçekte doğrusal davranır.',
    pitfalls: [
      'Sadece yatay aralığı ölçüp eğrinin uzunluğunu tahmin etmeye çalışmak.',
      'Az segmentli poligonal yaklaşımı gerçek uzunluk sanmak.',
    ],
  },
  derive: deriveArcLengthResult,
  VisualizationComponent: ArcLengthVisualization,
} satisfies SimulationModule<ArcLengthParams, ArcLengthResult>

export const arcLengthModule = defineSimulationModule(arcLengthDefinition)
