import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveQuadricSurfacesResult,
  type QuadricSurfacesParams,
  type QuadricSurfacesResult,
} from './logic'

const QuadricSurfacesVisualization = lazy(async () => ({
  default: (await import('./Visualization')).QuadricSurfacesVisualization,
}))

const defaultParams: QuadricSurfacesParams = {
  quadricType: 'sphere',
  sliceVariable: 'z',
  sliceValue: 0,
}

const presets: PresetConfig<QuadricSurfacesParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  {
    name: 'Elipsoid',
    params: { quadricType: 'ellipsoid', sliceVariable: 'z', sliceValue: 0.3 },
  },
  {
    name: 'Açık Yüzey',
    params: { quadricType: 'elliptic-paraboloid', sliceVariable: 'x', sliceValue: 0.8 },
  },
]

const quadricSurfacesDefinition = {
  id: 'quadric-surfaces',
  title: 'Kuadratik Yüzeyler',
  subtitle: 'Kesitlerle Şekli Oku',
  category: 'math',
  description:
    'Düzlem, küre, elipsoid, paraboloid, silindir ve koni gibi kuadratik yüzeyleri ardışık kesitler üzerinden incele.',
  icon: '◔',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'quadricType',
      label: 'Yüzey',
      type: 'select',
      options: [
        { label: 'Plane', value: 'plane' },
        { label: 'Sphere', value: 'sphere' },
        { label: 'Ellipsoid', value: 'ellipsoid' },
        { label: 'Elliptic Paraboloid', value: 'elliptic-paraboloid' },
        { label: 'Cylinder', value: 'cylinder' },
        { label: 'Cone', value: 'cone' },
      ],
    },
    {
      key: 'sliceVariable',
      label: 'Sabit Değişken',
      type: 'select',
      options: [
        { label: 'x sabit', value: 'x' },
        { label: 'y sabit', value: 'y' },
        { label: 'z sabit', value: 'z' },
      ],
    },
    { key: 'sliceValue', label: 'Kesit Değeri', type: 'slider', min: -2, max: 2, step: 0.1 },
  ],
  formulaTeX: 'Kuadratik yüzey = ikinci dereceden terimler',
  theory: {
    primaryFormula: 'Ax² + By² + Cz² + Dxy + Exz + Fyz + Gx + Hy + Iz + J = 0',
    formulaLabel: 'Genel kuadratik yüzey formu',
    symbols: [
      { symbol: 'x, y, z', meaning: 'Uzay koordinatları' },
      { symbol: 'A...J', meaning: 'Yüzey ailesini belirleyen katsayılar' },
      { symbol: 'kesit', meaning: 'Bir değişken sabitlenerek elde edilen 2B eğri' },
    ],
    derivationSteps: [
      'Kanonik denklemi seç.',
      'Bir değişkeni sabit tutup 3B yüzeyi bir düzlemle kes.',
      'Ortaya çıkan 2B eğrinin tipini incele.',
      'Kesit ailesi, yüzeyin kapalı mı açık mı olduğunu hızlıca anlatır.',
    ],
    interpretation:
      'Kuadratik yüzeylerin sınıflandırılması çoğu zaman doğrudan 3B çizmekten çok kesit mantığıyla daha kolay anlaşılır.',
    pitfalls: [
      'Her z-sabit kesitin yeterli olduğunu sanmak.',
      'Elipsoitte z-sabit kesitlerin x ve y eksenlerinde aynı yarıçapa sahip olduğunu varsaymak.',
      'Silindir gibi z’den bağımsız yüzeylerde kesit davranışını yanlış genellemek.',
    ],
  },
  derive: deriveQuadricSurfacesResult,
  VisualizationComponent: QuadricSurfacesVisualization,
} satisfies SimulationModule<QuadricSurfacesParams, QuadricSurfacesResult>

export const quadricSurfacesModule = defineSimulationModule(quadricSurfacesDefinition)
