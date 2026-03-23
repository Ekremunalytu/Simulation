import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveSeriesTestsLabResult,
  type SeriesTestsLabParams,
  type SeriesTestsLabResult,
} from './logic'

const SeriesTestsLabVisualization = lazy(async () => ({
  default: (await import('./Visualization')).SeriesTestsLabVisualization,
}))

const defaultParams: SeriesTestsLabParams = {
  testType: 'geometric',
  parameter: 0.6,
  terms: 16,
}

const presets: PresetConfig<SeriesTestsLabParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { testType: 'p-series', parameter: 1.4, terms: 18 } },
  { name: 'Karşılaştırmalı', params: { testType: 'ratio', parameter: 3, terms: 14 } },
]

const seriesTestsLabDefinition = {
  id: 'series-tests-lab',
  title: 'Seri Testleri Laboratuvarı',
  subtitle: 'Kararı Sayısal Kanıttan Oku',
  category: 'math',
  description:
    'Geometrik seri, p-serisi, alternating, ratio ve comparison testlerini aynı laboratuvarda incele. Hangi testin hangi kanıta baktığını görsel olarak karşılaştır.',
  icon: 'Σ',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'testType',
      label: 'Test Türü',
      type: 'select',
      options: [
        { label: 'Geometric', value: 'geometric' },
        { label: 'p-Series', value: 'p-series' },
        { label: 'Alternating', value: 'alternating' },
        { label: 'Ratio', value: 'ratio' },
        { label: 'Comparison', value: 'comparison' },
      ],
    },
    { key: 'parameter', label: 'Parametre', type: 'slider', min: 0.5, max: 3.5, step: 0.1 },
    { key: 'terms', label: 'Terim Sayısı', type: 'slider', min: 10, max: 24, step: 1 },
  ],
  formulaTeX: 'Karar = terim yapısı + uygun test limiti',
  theory: {
    primaryFormula: 'Yakınsaklık testi = uygun kanıt niceliğinin limiti',
    formulaLabel: 'Testlerin ortak fikri',
    symbols: [
      { symbol: 'aₙ', meaning: 'Serinin n. terimi' },
      { symbol: 'Sₙ', meaning: 'Kısmi toplam' },
      { symbol: 'kanıt', meaning: 'Seçilen teste göre oran, karşılaştırma veya işaret davranışı' },
    ],
    derivationSteps: [
      'Seri ailesini ve test türünü belirle.',
      'İlgili testin baktığı niceliği üret.',
      'Bu niceliğin davranışını terimler ilerledikçe izle.',
      'Kararı yalnızca toplamdan değil, testin kendi mantığından ver.',
    ],
    interpretation: 'Seri testleri farklı görünen araçlar olsa da ortak amaç aynıdır: sonsuz toplamın davranışını daha okunabilir bir yan nicelik üzerinden karar vermek.',
    pitfalls: [
      'Her seri için aynı testi zorla kullanmak.',
      'Kısmi toplam ile test göstergesini karıştırmak.',
    ],
  },
  derive: deriveSeriesTestsLabResult,
  VisualizationComponent: SeriesTestsLabVisualization,
} satisfies SimulationModule<SeriesTestsLabParams, SeriesTestsLabResult>

export const seriesTestsLabModule = defineSimulationModule(seriesTestsLabDefinition)
