import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveLineIntegralsResult,
  type LineIntegralsParams,
  type LineIntegralsResult,
} from './logic'

const LineIntegralsVisualization = lazy(async () => ({
  default: (await import('./Visualization')).LineIntegralsVisualization,
}))

const defaultParams: LineIntegralsParams = {
  curveType: 'circle',
  fieldType: 'rotation',
  integralMode: 'work',
  steps: 24,
}

const presets: PresetConfig<LineIntegralsParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  {
    name: 'Skaler Çember',
    params: { curveType: 'circle', fieldType: 'sink', integralMode: 'scalar', steps: 24 },
  },
  {
    name: 'Parabol Üstünde İş',
    params: { curveType: 'parabola', fieldType: 'radial', integralMode: 'work', steps: 22 },
  },
]

const lineIntegralsDefinition = {
  id: 'line-integrals',
  title: 'Eğrisel İntegraller',
  subtitle: 'Eğri Boyunca Birikimi İzle',
  category: 'math',
  description:
    'Skaler ve vektör alanı eğrisel integrallerini, parametrelenmiş eğri boyunca yerel katkıları biriktirerek incele.',
  icon: '∮',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'curveType',
      label: 'Eğri',
      type: 'select',
      options: [
        { label: 'Circle', value: 'circle' },
        { label: 'Parabola', value: 'parabola' },
        { label: 'Line', value: 'line' },
      ],
    },
    {
      key: 'fieldType',
      label: 'Alan',
      type: 'select',
      options: [
        { label: 'Radial', value: 'radial' },
        { label: 'Rotation', value: 'rotation' },
        { label: 'Sink', value: 'sink' },
      ],
    },
    {
      key: 'integralMode',
      label: 'Mod',
      type: 'select',
      options: [
        { label: 'Work', value: 'work' },
        { label: 'Scalar', value: 'scalar' },
      ],
    },
    { key: 'steps', label: 'Adım Sayısı', type: 'slider', min: 12, max: 36, step: 2 },
  ],
  formulaTeX: '∫_C F · dr  veya  ∫_C g ds',
  theory: {
    primaryFormula: '∫꜀ F · dr   veya   ∫꜀ g ds',
    formulaLabel: 'İki temel eğrisel integral',
    symbols: [
      { symbol: 'C', meaning: 'Parametrelenmiş eğri' },
      { symbol: 'F', meaning: 'Vektör alanı' },
      { symbol: 'ds', meaning: 'Yay uzunluğu elemanı' },
    ],
    derivationSteps: [
      'Eğriyi küçük parametre adımlarına böl.',
      'Her adımda konumu, tangent vektörünü ve alanı değerlendir.',
      'İş modunda F·r\'(t), skaler modda |F| |r\'(t)| katkısını kullan.',
      'Tüm katkıları toplayarak toplam eğrisel integrali elde et.',
    ],
    interpretation:
      'Eğrisel integral, düz bir eksen yerine bir yol boyunca birikim hesabı yapar; bu yüzden eğri geometrisi doğrudan sonuca girer.',
    pitfalls: [
      'Skaler ve work integrallerini aynı nicelik sanmak.',
      'Tangent yönünü hesaba katmadan vektör alanı katkısını yorumlamak.',
    ],
  },
  derive: deriveLineIntegralsResult,
  VisualizationComponent: LineIntegralsVisualization,
} satisfies SimulationModule<LineIntegralsParams, LineIntegralsResult>

export const lineIntegralsModule = defineSimulationModule(lineIntegralsDefinition)
