import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveMultivariableSurfacesResult,
  type MultivariableSurfacesParams,
  type MultivariableSurfacesResult,
} from './logic'

const MultivariableSurfacesVisualization = lazy(async () => ({
  default: (await import('./Visualization')).MultivariableSurfacesVisualization,
}))

const defaultParams: MultivariableSurfacesParams = {
  surfaceType: 'paraboloid',
  levelValue: 1.2,
  sliceAxis: 'x',
  sliceValue: 0.5,
}

const presets: PresetConfig<MultivariableSurfacesParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  {
    name: 'Seviye Eğrileri',
    params: { surfaceType: 'saddle', levelValue: 0, sliceAxis: 'y', sliceValue: 0.25 },
  },
  {
    name: 'Dalgalı',
    params: { surfaceType: 'wave', levelValue: 0.5, sliceAxis: 'x', sliceValue: -0.8 },
  },
]

const multivariableSurfacesDefinition = {
  id: 'multivariable-surfaces',
  title: 'Çok Değişkenli Yüzeyler',
  subtitle: 'Contour ve Kesiti Birlikte Oku',
  category: 'math',
  description:
    'İki değişkenli fonksiyonları hem contour haritası hem de tek eksenli kesit üzerinden incele. Seviye eğrileri ile grafik arasında doğrudan bağ kur.',
  icon: '⊞',
  difficulty: 'beginner',
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
    { key: 'levelValue', label: 'Seviye Değeri', type: 'slider', min: -2, max: 4, step: 0.1 },
    {
      key: 'sliceAxis',
      label: 'Sabit Eksen',
      type: 'select',
      options: [
        { label: 'x sabit', value: 'x' },
        { label: 'y sabit', value: 'y' },
      ],
    },
    { key: 'sliceValue', label: 'Kesit Değeri', type: 'slider', min: -2, max: 2, step: 0.1 },
  ],
  formulaTeX: 'Seviye eğrisi: f(x,y)=k',
  theory: {
    primaryFormula: 'Seviye eğrisi: f(x,y)=k',
    formulaLabel: 'Contour fikri',
    symbols: [
      { symbol: 'f(x,y)', meaning: 'İki değişkenli fonksiyon' },
      { symbol: 'k', meaning: 'Sabit seviye değeri' },
      { symbol: 'x = c veya y = c', meaning: 'Tek eksenli kesit' },
    ],
    derivationSteps: [
      'Yüzeyi üstten izleyip aynı yüksekliğe sahip noktaları grupla.',
      'Bu noktalar contour yani seviye eğrisini verir.',
      'Aynı anda x veya y sabit tutup tek değişkenli bir kesit grafiği üret.',
      'Contour ve kesit birlikte, yüzeyin tam davranışını daha okunur hale getirir.',
    ],
    interpretation:
      'Çok değişkenli fonksiyonlar doğrudan 3B düşünülmese bile contour ve kesit kombinasyonu ile güçlü biçimde okunabilir.',
    pitfalls: [
      'Contour yoğunluğunu yükseklik yerine eğimle karıştırmak.',
      'Tek bir kesiti tüm yüzey davranışı sanmak.',
    ],
  },
  derive: deriveMultivariableSurfacesResult,
  VisualizationComponent: MultivariableSurfacesVisualization,
} satisfies SimulationModule<MultivariableSurfacesParams, MultivariableSurfacesResult>

export const multivariableSurfacesModule = defineSimulationModule(
  multivariableSurfacesDefinition,
)
