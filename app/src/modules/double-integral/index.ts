import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveDoubleIntegralResult,
  type DoubleIntegralParams,
  type DoubleIntegralResult,
} from './logic'

const DoubleIntegralVisualization = lazy(async () => ({
  default: (await import('./Visualization')).DoubleIntegralVisualization,
}))

const defaultParams: DoubleIntegralParams = {
  surfaceType: 'plane',
  extent: 2,
  subdivisions: 5,
}

const presets: PresetConfig<DoubleIntegralParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { surfaceType: 'bowl', extent: 2, subdivisions: 6 } },
  { name: 'Karşılaştırmalı', params: { surfaceType: 'ripple', extent: 2.5, subdivisions: 6 } },
]

const doubleIntegralDefinition = {
  id: 'double-integral',
  title: 'Çift Katlı İntegral',
  subtitle: 'Hacmi Hücrelerle Topla',
  category: 'math',
  description:
    'Dikdörtgensel bölgedeki yüzey hacmini, küçük taban hücrelerinin katkılarını toplayarak yaklaşıkla. İki boyutlu Riemann toplamının nasıl çalıştığını top-view üzerinden izle.',
  icon: '∬',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'surfaceType',
      label: 'Yüzey',
      type: 'select',
      options: [
        { label: 'Plane', value: 'plane' },
        { label: 'Bowl', value: 'bowl' },
        { label: 'Ripple', value: 'ripple' },
      ],
    },
    { key: 'extent', label: 'Bölge Yarı Genişliği', type: 'slider', min: 1, max: 2.5, step: 0.25 },
    { key: 'subdivisions', label: 'Grid Yoğunluğu', type: 'slider', min: 3, max: 7, step: 1 },
  ],
  formulaTeX: '∬R f(x, y) dA = lim maxΔA→0 Σ f(xᵢ*, yᵢ*)ΔA',
  theory: {
    primaryFormula: '∬ᵣ f(x,y) dA = lim max ΔA→0 Σ f(xᵢ*, yᵢ*) ΔA',
    formulaLabel: 'Çift katlı integralin Riemann yorumu',
    symbols: [
      { symbol: 'R', meaning: 'İntegralin alındığı dikdörtgensel bölge' },
      { symbol: 'ΔA', meaning: 'Her küçük hücrenin taban alanı' },
      { symbol: '(xᵢ*, yᵢ*)', meaning: 'Hücre içindeki örnek nokta' },
    ],
    derivationSteps: [
      'Bölgeyi küçük dikdörtgensel hücrelere ayır.',
      'Her hücre için yüzey yüksekliğini örnek noktada hesapla.',
      'Hücre yüksekliği ile taban alanını çarpıp küçük hacim katkısı üret.',
      'Tüm katkıları toplayıp grid inceldikçe limite git.',
    ],
    interpretation:
      'Çift katlı integral, yüzey altındaki hacmi sayısal olarak hissettirmenin en doğal yolunu sunar: küçük prizma benzeri katkıların toplamı.',
    pitfalls: [
      'Tek değişkenli integralden farklı olarak hem x hem y yönündeki bölmeyi birlikte düşünmemek.',
      'Grid kaba iken elde edilen hacmi tam değer gibi yorumlamak.',
    ],
  },
  derive: deriveDoubleIntegralResult,
  VisualizationComponent: DoubleIntegralVisualization,
} satisfies SimulationModule<DoubleIntegralParams, DoubleIntegralResult>

export const doubleIntegralModule = defineSimulationModule(doubleIntegralDefinition)
