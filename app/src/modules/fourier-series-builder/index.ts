import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveFourierSeriesBuilderResult,
  type FourierSeriesBuilderParams,
  type FourierSeriesBuilderResult,
} from './logic'

const FourierSeriesBuilderVisualization = lazy(async () => ({
  default: (await import('./Visualization')).FourierSeriesBuilderVisualization,
}))

const defaultParams: FourierSeriesBuilderParams = {
  waveType: 'square',
  harmonics: 9,
  amplitude: 1,
  period: Math.PI,
  phaseShift: 0,
}

const presets: PresetConfig<FourierSeriesBuilderParams>[] = [
  { name: 'Square', params: defaultParams },
  { name: 'Sawtooth', params: { ...defaultParams, waveType: 'sawtooth', harmonics: 12 } },
  { name: 'Triangle', params: { ...defaultParams, waveType: 'triangle', harmonics: 9 } },
]

const fourierSeriesBuilderDefinition = {
  id: 'fourier-series-builder',
  title: 'Fourier Series Builder',
  subtitle: 'Harmonics and Partial Sums',
  category: 'math',
  description:
    'Periyodik bir dalgayı harmonikleri tek tek ekleyerek yeniden kur. Target wave, spectrum ve approximation error aynı anda görünür.',
  icon: '≈',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'waveType',
      label: 'Wave Type',
      type: 'select',
      options: [
        { label: 'Square', value: 'square' },
        { label: 'Sawtooth', value: 'sawtooth' },
        { label: 'Triangle', value: 'triangle' },
      ],
    },
    { key: 'harmonics', label: 'Harmonics', type: 'slider', min: 3, max: 18, step: 1 },
    { key: 'amplitude', label: 'Amplitude', type: 'slider', min: 0.5, max: 2, step: 0.1 },
    { key: 'period', label: 'Period', type: 'slider', min: 1.5, max: 4.5, step: 0.1 },
    { key: 'phaseShift', label: 'Phase Shift', type: 'slider', min: -2, max: 2, step: 0.1 },
  ],
  formulaTeX: 'f(x)≈Σ b_n sin(nωx)',
  theory: {
    primaryFormula: 'Fourier serisi, periyodik bir sinyali trigonometrik temel fonksiyonların ağırlıklı toplamı olarak yazar.',
    formulaLabel: 'Harmonic decomposition',
    symbols: [
      { symbol: 'b_n', meaning: 'n. harmonik katsayısı' },
      { symbol: 'ω', meaning: 'Temel açısal frekans' },
      { symbol: 'partial sum', meaning: 'İlk N harmonikle kurulan yaklaşık sinyal' },
    ],
    derivationSteps: [
      'Hedef dalga için harmonik katsayıları belirlenir.',
      'Her harmonik kendi sinüs bileşeniyle kısmi toplama eklenir.',
      'Kısmi toplam, hedef dalgaya giderek daha çok benzemeye başlar.',
      'Error ve overshoot, yakınsamanın nerede hızlı nerede inatçı olduğunu açığa çıkarır.',
    ],
    interpretation:
      'Fourier yaklaşımı, karmaşık şekilleri tek tek harmoniklerin kolektif davranışı olarak okumayı sağlar.',
    pitfalls: [
      'Harmonik sayısı artınca süreksizlik yakınındaki taşmanın tamamen yok olacağını sanmak.',
      'Spektrum genliğini doğrudan zaman uzayındaki hata ile birebir eşlemek.',
    ],
  },
  derive: deriveFourierSeriesBuilderResult,
  VisualizationComponent: FourierSeriesBuilderVisualization,
} satisfies SimulationModule<FourierSeriesBuilderParams, FourierSeriesBuilderResult>

export const fourierSeriesBuilderModule = defineSimulationModule(fourierSeriesBuilderDefinition)
