import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveRiemannIntegralResult,
  type RiemannIntegralParams,
  type RiemannIntegralResult,
} from './logic'

const RiemannIntegralVisualization = lazy(async () => ({
  default: (await import('./Visualization')).RiemannIntegralVisualization,
}))

const defaultParams: RiemannIntegralParams = {
  functionType: 'parabola',
  startX: 0,
  endX: 3,
  subdivisions: 10,
  method: 'left',
}

const presets: PresetConfig<RiemannIntegralParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  {
    name: 'Sezgisel',
    params: { functionType: 'wave', startX: 0, endX: 3.14, subdivisions: 12, method: 'midpoint' },
  },
  {
    name: 'Karşılaştırmalı',
    params: { functionType: 'growth', startX: 0, endX: 2.5, subdivisions: 8, method: 'right' },
  },
]

const riemannIntegralDefinition = {
  id: 'riemann-integral',
  title: 'Riemann İntegrali',
  subtitle: 'Alanı Dikdörtgenlerle Yakala',
  category: 'math',
  description:
    'Belirli integralin, eğri altındaki alanı Riemann toplamlarının limiti olarak nasıl ürettiğini incele. Sol, sağ ve orta nokta toplamlarını adım adım karşılaştır.',
  icon: '∫',
  difficulty: 'beginner',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'functionType',
      label: 'Fonksiyon',
      type: 'select',
      options: [
        { label: 'Parabola', value: 'parabola' },
        { label: 'Wave', value: 'wave' },
        { label: 'Growth', value: 'growth' },
      ],
    },
    { key: 'startX', label: 'Başlangıç', type: 'slider', min: -1, max: 1, step: 0.25 },
    { key: 'endX', label: 'Bitiş', type: 'slider', min: 1.5, max: 4, step: 0.25 },
    { key: 'subdivisions', label: 'Bölme Sayısı', type: 'slider', min: 4, max: 16, step: 1 },
    {
      key: 'method',
      label: 'Toplam Türü',
      type: 'select',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Midpoint', value: 'midpoint' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
  formulaTeX: '∫[a,b] f(x)dx = lim n→∞ Σ f(xᵢ*)Δx',
  theory: {
    primaryFormula: '∫[a,b] f(x) dx = lim n→∞ Σᵢ f(xᵢ*) Δx',
    formulaLabel: 'Belirli integralin Riemann tanımı',
    symbols: [
      { symbol: 'Δx', meaning: 'Her alt aralığın genişliği' },
      { symbol: 'xᵢ*', meaning: 'İlgili dikdörtgenin yüksekliğini belirleyen örnek nokta' },
      { symbol: 'Σ', meaning: 'Tüm dikdörtgen alanlarının toplamı' },
    ],
    derivationSteps: [
      'İntegral aralığını küçük alt aralıklara böl.',
      'Her alt aralıkta bir örnek nokta seçip yüksekliği f(xᵢ*) ile belirle.',
      'Dikdörtgen alanlarını toplayarak yaklaşık alanı elde et.',
      'Bölme sayısı arttıkça toplam, gerçek belirli integrale yakınsar.',
    ],
    interpretation:
      'Belirli integral, sürekli alan fikrini sonlu toplamların limitiyle kurar. Riemann toplamları bu köprüyü görselleştirmenin en doğrudan yoludur.',
    pitfalls: [
      'Örnek nokta seçiminin sonucu etkilediğini göz ardı etmek.',
      'Az sayıda dikdörtgenle elde edilen yaklaşık alanı tam integral sanmak.',
    ],
  },
  derive: deriveRiemannIntegralResult,
  VisualizationComponent: RiemannIntegralVisualization,
} satisfies SimulationModule<RiemannIntegralParams, RiemannIntegralResult>

export const riemannIntegralModule = defineSimulationModule(riemannIntegralDefinition)
