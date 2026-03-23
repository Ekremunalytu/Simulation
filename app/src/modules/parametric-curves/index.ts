import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveParametricCurvesResult,
  type ParametricCurvesParams,
  type ParametricCurvesResult,
} from './logic'

const ParametricCurvesVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ParametricCurvesVisualization,
}))

const defaultParams: ParametricCurvesParams = {
  curveType: 'circle',
  samples: 16,
}

const presets: PresetConfig<ParametricCurvesParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { curveType: 'lissajous', samples: 20 } },
  { name: 'Karşılaştırmalı', params: { curveType: 'cycloid', samples: 18 } },
]

const parametricCurvesDefinition = {
  id: 'parametric-curves',
  title: 'Parametrik Eğriler',
  subtitle: 'Hareketle Çizilen Geometri',
  category: 'math',
  description:
    'x(t) ve y(t) ile tanımlanan eğrilerde noktanın hareketini, tangent doğrultusunu ve hız büyüklüğünü aynı anda incele.',
  icon: 'γ',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'curveType',
      label: 'Eğri Türü',
      type: 'select',
      options: [
        { label: 'Circle', value: 'circle' },
        { label: 'Lissajous', value: 'lissajous' },
        { label: 'Cycloid', value: 'cycloid' },
      ],
    },
    { key: 'samples', label: 'Adım Sayısı', type: 'slider', min: 10, max: 28, step: 1 },
  ],
  formulaTeX: 'r(t) = <x(t), y(t)>',
  theory: {
    primaryFormula: 'r(t) = <x(t), y(t)>,   r\'(t) = <x\'(t), y\'(t)>',
    formulaLabel: 'Parametrik konum ve hız',
    symbols: [
      { symbol: 'r(t)', meaning: 'Düzlemdeki konum vektörü' },
      { symbol: 'r\'(t)', meaning: 'Hız / tangent vektörü' },
      { symbol: '|r\'(t)|', meaning: 'Skaler hız büyüklüğü' },
    ],
    derivationSteps: [
      't parametresi ilerledikçe düzlemdeki konumu hesapla.',
      'Konumun türevi tangent yönünü verir.',
      'Bu vektörün normu hız büyüklüğünü üretir.',
      'Böylece şekil, yön ve hız tek bir parametrik akışta birleşir.',
    ],
    interpretation: 'Parametrik gösterim, eğriyi yalnızca şekil olarak değil, zaman benzeri bir ilerleyiş olarak düşünmeyi sağlar.',
    pitfalls: [
      'Tangent yönü ile hız büyüklüğünü aynı şey sanmak.',
      'Aynı geometrik yolun her noktada aynı hızla geçildiğini varsaymak.',
    ],
  },
  derive: deriveParametricCurvesResult,
  VisualizationComponent: ParametricCurvesVisualization,
} satisfies SimulationModule<ParametricCurvesParams, ParametricCurvesResult>

export const parametricCurvesModule = defineSimulationModule(parametricCurvesDefinition)
