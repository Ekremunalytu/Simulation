import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  derivePartialDerivativesResult,
  type PartialDerivativesParams,
  type PartialDerivativesResult,
} from './logic'

const PartialDerivativesVisualization = lazy(async () => ({
  default: (await import('./Visualization')).PartialDerivativesVisualization,
}))

const defaultParams: PartialDerivativesParams = {
  surfaceType: 'paraboloid',
  pointX: 1,
  pointY: -0.5,
}

const presets: PresetConfig<PartialDerivativesParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { surfaceType: 'saddle', pointX: 0.5, pointY: 0.5 } },
  { name: 'Karşılaştırmalı', params: { surfaceType: 'wave', pointX: 1.2, pointY: 1 } },
]

const partialDerivativesDefinition = {
  id: 'partial-derivatives',
  title: 'Kısmi Türevler',
  subtitle: 'Yüzeyin Yerel Eğimi',
  category: 'math',
  description:
    'İki değişkenli fonksiyonlarda x ve y doğrultularındaki yerel eğimi ayrı ayrı incele. Kısmi türevlerden tangent düzlem ve lineerleştirme sezgisi kur.',
  icon: '∇',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'surfaceType',
      label: 'Yüzey',
      type: 'select',
      options: [
        { label: 'Paraboloid', value: 'paraboloid' },
        { label: 'Saddle', value: 'saddle' },
        { label: 'Wave', value: 'wave' },
      ],
    },
    { key: 'pointX', label: 'x₀', type: 'slider', min: -2, max: 2, step: 0.1 },
    { key: 'pointY', label: 'y₀', type: 'slider', min: -2, max: 2, step: 0.1 },
  ],
  formulaTeX: 'L(x,y) = f(a,b) + fₓ(a,b)(x-a) + fᵧ(a,b)(y-b)',
  theory: {
    primaryFormula: 'L(x,y) = f(a,b) + fₓ(a,b)(x-a) + fᵧ(a,b)(y-b)',
    formulaLabel: 'Tangent düzlemin lineerleştirmesi',
    symbols: [
      { symbol: 'fₓ, fᵧ', meaning: 'Sırasıyla x ve y doğrultusundaki kısmi türevler' },
      { symbol: '(a,b)', meaning: 'İncelenen yüzey noktası' },
      { symbol: 'L(x,y)', meaning: 'Yüzeyi yerelde yaklaşık temsil eden tangent düzlem' },
    ],
    derivationSteps: [
      'Yüzey üzerinde bir (a,b) noktası seç.',
      'Önce x sabitken y boyunca, sonra y sabitken x boyunca eğimleri ölç.',
      'Bu iki kısmi türevi kullanarak yerel lineer model kur.',
      'Ortaya çıkan lineer model, tangent düzlem olarak yüzeyin yerel davranışını yaklaşıklar.',
    ],
    interpretation:
      'Tek değişkenli tangent doğrusunun çok değişkenli analoğu tangent düzlemdir. Kısmi türevler bu düzlemin eğim katsayılarını belirler.',
    pitfalls: [
      'Kısmi türevlerin küçük olmasını otomatik olarak ekstremum sanmak.',
      'Yalnızca tek eksen boyunca bakıp yüzeyin yerel lineer modelini eksiksiz anladığını düşünmek.',
    ],
  },
  derive: derivePartialDerivativesResult,
  VisualizationComponent: PartialDerivativesVisualization,
} satisfies SimulationModule<PartialDerivativesParams, PartialDerivativesResult>

export const partialDerivativesModule = defineSimulationModule(partialDerivativesDefinition)
