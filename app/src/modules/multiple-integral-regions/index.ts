import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveMultipleIntegralRegionsResult,
  type MultipleIntegralRegionsParams,
  type MultipleIntegralRegionsResult,
} from './logic'

const MultipleIntegralRegionsVisualization = lazy(async () => ({
  default: (await import('./Visualization')).MultipleIntegralRegionsVisualization,
}))

const defaultParams: MultipleIntegralRegionsParams = {
  regionType: 'triangle',
  subdivisions: 8,
}

const presets: PresetConfig<MultipleIntegralRegionsParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { regionType: 'disk', subdivisions: 9 } },
  { name: 'Karşılaştırmalı', params: { regionType: 'between-curves', subdivisions: 10 } },
]

const multipleIntegralRegionsDefinition = {
  id: 'multiple-integral-regions',
  title: 'Bölgeye Göre Çoklu İntegral',
  subtitle: 'Maske ile Alan Topla',
  category: 'math',
  description:
    'Dikdörtgensel olmayan bölgelerde çoklu integralin asıl zorluğu olan bölge seçimini hücre bazlı bir maske olarak görselleştir.',
  icon: 'R',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'regionType',
      label: 'Bölge',
      type: 'select',
      options: [
        { label: 'Triangle', value: 'triangle' },
        { label: 'Disk', value: 'disk' },
        { label: 'Between Curves', value: 'between-curves' },
      ],
    },
    { key: 'subdivisions', label: 'Grid Yoğunluğu', type: 'slider', min: 5, max: 12, step: 1 },
  ],
  formulaTeX: '∬R 1 dA = Area(R)',
  theory: {
    primaryFormula: '∬ᵣ 1 dA = Area(R)',
    formulaLabel: 'Bölge maskesinin temel yorumu',
    symbols: [
      { symbol: 'R', meaning: 'İntegrasyon bölgesi' },
      { symbol: 'dA', meaning: 'Küçük alan elemanı' },
      { symbol: '1', meaning: 'Birim yükseklik; böylece toplam doğrudan alana eşit olur' },
    ],
    derivationSteps: [
      'Bölgeyi örnekleme ızgarasına yerleştir.',
      'Her hücrenin merkezinin bölge içinde olup olmadığına karar ver.',
      'İçeride olan hücrelerin alan katkılarını topla.',
      'Grid inceldikçe toplam gerçek bölge alanına yaklaşır.',
    ],
    interpretation: 'Bu modül, çoklu integralde sınırların integrand kadar belirleyici olduğunu açık biçimde gösterir.',
    pitfalls: [
      'Bölgeyi dikdörtgen sanıp sınır koşullarını atlamak.',
      'Kaba hücrelemede elde edilen maskeyi gerçek geometriyle karıştırmak.',
    ],
  },
  derive: deriveMultipleIntegralRegionsResult,
  VisualizationComponent: MultipleIntegralRegionsVisualization,
} satisfies SimulationModule<MultipleIntegralRegionsParams, MultipleIntegralRegionsResult>

export const multipleIntegralRegionsModule = defineSimulationModule(multipleIntegralRegionsDefinition)
