import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveSequenceLimitsMonotoneLabResult,
  type SequenceLimitsMonotoneLabParams,
  type SequenceLimitsMonotoneLabResult,
} from './logic'

const SequenceLimitsMonotoneLabVisualization = lazy(async () => ({
  default: (await import('./Visualization')).SequenceLimitsMonotoneLabVisualization,
}))

const defaultParams: SequenceLimitsMonotoneLabParams = {
  scenario: 'squeeze',
  parameter: 1,
  terms: 16,
}

const presets: PresetConfig<SequenceLimitsMonotoneLabParams>[] = [
  { name: 'Sıkıştırma', params: defaultParams },
  {
    name: 'Recursive',
    params: { scenario: 'recursive', parameter: 2.5, terms: 14 },
  },
  {
    name: 'Monoton',
    params: { scenario: 'monotone', parameter: 0.62, terms: 16 },
  },
]

const sequenceLimitsMonotoneLabDefinition = {
  id: 'sequence-limits-monotone-lab',
  title: 'Sequence Limits & Monotone Lab',
  subtitle: 'Dizilerde Yakınsamayı Kanıt Mantığıyla Oku',
  category: 'math',
  description:
    'Sıkıştırma teoremi, recursive limit ve sınırlı monoton dizi davranışını aynı laboratuvarda incele. Yakınsamanın sadece sayı değil, kanıt biçimi olduğunu gör.',
  icon: 'aₙ',
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
        { label: 'Squeeze', value: 'squeeze' },
        { label: 'Recursive', value: 'recursive' },
        { label: 'Monotone', value: 'monotone' },
      ],
    },
    { key: 'parameter', label: 'Parametre', type: 'slider', min: 0.3, max: 3, step: 0.05 },
    { key: 'terms', label: 'Terim Sayısı', type: 'slider', min: 8, max: 22, step: 1 },
  ],
  formulaTeX: 'a_n \\to L',
  theory: {
    primaryFormula: 'Monoton + sınırlı => yakınsak',
    formulaLabel: 'Diziler için üç ana limit okuması',
    symbols: [
      { symbol: 'aₙ', meaning: 'İncelenen dizi terimi' },
      { symbol: 'L', meaning: 'Dizinin yaklaşmayı hedeflediği limit' },
      { symbol: 'üst/alt sınır', meaning: 'Sıkıştırma veya sınırlılık kanıtında kullanılan bariyerler' },
    ],
    derivationSteps: [
      'Dizinin doğrudan limitini gözlemek yerine onu açıklayan yapıtaşını seç.',
      'Sıkıştırma teoreminde iki sınır dizinin aynı limite gidip gitmediğini izle.',
      'Recursive dizide sabit nokta ve tekrarlı güncelleme ilişkisini çöz.',
      'Monoton dizide tek yönlü hareket ile sınırlılık bilgisini birleştir.',
    ],
    interpretation:
      'Dizi yakınsaması bazen sayısal sezgiyle, bazen de yapı bilgisiyle anlaşılır; bu modül üç farklı kanıt mantığını aynı arayüzde birleştirir.',
    pitfalls: [
      'Terimlerin küçülmesini otomatik olarak yakınsama garantisi sanmak.',
      'Recursive tanımda sabit noktanın neden limit adayı olduğunu açıklamadan sonuca atlamak.',
    ],
  },
  derive: deriveSequenceLimitsMonotoneLabResult,
  VisualizationComponent: SequenceLimitsMonotoneLabVisualization,
} satisfies SimulationModule<
  SequenceLimitsMonotoneLabParams,
  SequenceLimitsMonotoneLabResult
>

export const sequenceLimitsMonotoneLabModule = defineSimulationModule(
  sequenceLimitsMonotoneLabDefinition,
)
