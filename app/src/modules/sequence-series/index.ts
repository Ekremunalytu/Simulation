import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveSequenceSeriesResult,
  type SequenceSeriesParams,
  type SequenceSeriesResult,
} from './logic'

const SequenceSeriesVisualization = lazy(async () => ({
  default: (await import('./Visualization')).SequenceSeriesVisualization,
}))

const defaultParams: SequenceSeriesParams = {
  seriesType: 'geometric',
  terms: 16,
  ratio: 0.6,
  exponent: 1.5,
}

const presets: PresetConfig<SequenceSeriesParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  {
    name: 'Sezgisel',
    params: { seriesType: 'harmonic', terms: 18, ratio: 0.6, exponent: 1.5 },
  },
  {
    name: 'Karşılaştırmalı',
    params: { seriesType: 'p-series', terms: 20, ratio: 0.6, exponent: 1.3 },
  },
]

const sequenceSeriesDefinition = {
  id: 'sequence-series',
  title: 'Diziler ve Seriler',
  subtitle: 'Kısmi Toplamlarla Yakınsama',
  category: 'math',
  description:
    'Geometrik, harmonik ve p-serilerini aynı arayüzde karşılaştır. Tek tek terimlerin küçülmesinin toplam davranışını garanti etmediğini kısmi toplamlar üzerinden gözlemle.',
  icon: 'Σ',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'seriesType',
      label: 'Seri Türü',
      type: 'select',
      options: [
        { label: 'Geometric', value: 'geometric' },
        { label: 'Harmonic', value: 'harmonic' },
        { label: 'p-Series', value: 'p-series' },
      ],
    },
    { key: 'terms', label: 'Terim Sayısı', type: 'slider', min: 8, max: 30, step: 1 },
    { key: 'ratio', label: 'Geometrik Oran (r)', type: 'slider', min: -0.8, max: 1.2, step: 0.05 },
    { key: 'exponent', label: 'p Üssü', type: 'slider', min: 0.5, max: 2.5, step: 0.1 },
  ],
  formulaTeX: 'Sₙ = Σ[k=1→n] aₖ',
  theory: {
    primaryFormula: 'Sₙ = Σ[k=1→n] aₖ,  S = lim n→∞ Sₙ',
    formulaLabel: 'Serinin kısmi toplam mantığı',
    symbols: [
      { symbol: 'aₖ', meaning: 'Serinin k. terimi' },
      { symbol: 'Sₙ', meaning: 'İlk n terimin toplamı' },
      { symbol: 'S', meaning: 'Varsa serinin sonsuz toplam limiti' },
    ],
    derivationSteps: [
      'Önce terim dizisini oluştur.',
      'İlk n terimin toplamını Sₙ olarak hesapla.',
      'n büyüdükçe Sₙ dizisinin bir limite gidip gitmediğini izle.',
      'Yakınsama kararı, tek tek terimlerden çok kısmi toplam davranışına göre verilir.',
    ],
    interpretation:
      'Seriler, sonsuz nesneleri sonlu kısmi toplamların limitiyle anlamayı öğretir. Yakınsama testi sezgisi burada kısmi toplam eğrisinden doğar.',
    pitfalls: [
      'aₙ → 0 olmasını tek başına yakınsaklık sanmak.',
      'Terim davranışı ile kısmi toplam davranışını karıştırmak.',
    ],
  },
  derive: deriveSequenceSeriesResult,
  VisualizationComponent: SequenceSeriesVisualization,
} satisfies SimulationModule<SequenceSeriesParams, SequenceSeriesResult>

export const sequenceSeriesModule = defineSimulationModule(sequenceSeriesDefinition)
