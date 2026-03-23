import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveLimitExplorerResult,
  type LimitExplorerParams,
  type LimitExplorerResult,
} from './logic'

const LimitExplorerVisualization = lazy(async () => ({
  default: (await import('./Visualization')).LimitExplorerVisualization,
}))

const defaultParams: LimitExplorerParams = {
  functionType: 'removable',
  approachPoint: 1,
  direction: 'both',
  zoom: 2,
}

const presets: PresetConfig<LimitExplorerParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  {
    name: 'Sezgisel',
    params: { functionType: 'jump', approachPoint: 0, direction: 'both', zoom: 2 },
  },
  {
    name: 'Karşılaştırmalı',
    params: { functionType: 'asymptote', approachPoint: 1, direction: 'left', zoom: 1 },
  },
]

const limitExplorerDefinition = {
  id: 'limit-explorer',
  title: 'Limit Kaşifi',
  subtitle: 'Yaklaşımın Anatomisi',
  category: 'math',
  description:
    'Fonksiyonun bir noktaya yaklaşırken nasıl davrandığını sağ ve sol taraftan ayrı ayrı incele. Delik, sıçrama ve asimptot davranışlarını aynı arayüzde karşılaştır.',
  icon: '∞',
  difficulty: 'beginner',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'functionType',
      label: 'Fonksiyon Davranışı',
      type: 'select',
      options: [
        { label: 'Removable', value: 'removable' },
        { label: 'Jump', value: 'jump' },
        { label: 'Asymptote', value: 'asymptote' },
      ],
    },
    {
      key: 'approachPoint',
      label: 'Yaklaşım Noktası (a)',
      type: 'slider',
      min: -2,
      max: 2,
      step: 0.25,
    },
    {
      key: 'direction',
      label: 'Yaklaşım Yönü',
      type: 'select',
      options: [
        { label: 'İki Taraflı', value: 'both' },
        { label: 'Soldan', value: 'left' },
        { label: 'Sağdan', value: 'right' },
      ],
    },
    {
      key: 'zoom',
      label: 'Yerel Pencere',
      type: 'slider',
      min: 0.5,
      max: 4,
      step: 0.25,
    },
  ],
  formulaTeX: 'lim x→a f(x) = L',
  theory: {
    primaryFormula: 'lim x→a f(x) = L  iff  lim x→a⁻ f(x) = lim x→a⁺ f(x) = L',
    formulaLabel: 'İki taraflı limitin oluşma koşulu',
    symbols: [
      { symbol: 'a', meaning: 'Yaklaşım yapılan x değeri' },
      { symbol: 'L', meaning: 'Yaklaşılan limit değeri' },
      { symbol: 'a⁻ / a⁺', meaning: 'Sırasıyla soldan ve sağdan yaklaşım' },
    ],
    derivationSteps: [
      'Önce x değerlerini a noktasının solundan ve sağından seç.',
      'Fonksiyon değerlerinin her iki tarafta hangi sayıya yöneldiğini incele.',
      'Sol ve sağ davranış aynı sayıya yaklaşıyorsa iki taraflı limit vardır.',
      'Noktadaki fonksiyon değeri farklı olsa bile limit değişmeyebilir; bu removable discontinuity üretir.',
    ],
    interpretation:
      'Limit, noktanın üzerindeki değeri değil komşu değerlerin ortak eğilimini ölçer. Bu yüzden süreksizlik türünü ayırt etmenin ana aracı tek taraflı limitlerdir.',
    pitfalls: [
      'Sadece f(a) değerine bakıp limit kararı vermek.',
      'Sol ve sağ limiti ayrı kontrol etmeden iki taraflı limit var sanmak.',
    ],
  },
  derive: deriveLimitExplorerResult,
  VisualizationComponent: LimitExplorerVisualization,
} satisfies SimulationModule<LimitExplorerParams, LimitExplorerResult>

export const limitExplorerModule = defineSimulationModule(limitExplorerDefinition)
