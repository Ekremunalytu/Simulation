import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveTaylorSeriesResult,
  type TaylorSeriesParams,
  type TaylorSeriesResult,
} from './logic'

const TaylorSeriesVisualization = lazy(async () => ({
  default: (await import('./Visualization')).TaylorSeriesVisualization,
}))

const defaultParams: TaylorSeriesParams = {
  functionType: 'sine',
  degree: 7,
  focusX: 1,
}

const presets: PresetConfig<TaylorSeriesParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { functionType: 'exp', degree: 6, focusX: 1.5 } },
  { name: 'Karşılaştırmalı', params: { functionType: 'cubic', degree: 4, focusX: 2 } },
]

const taylorSeriesDefinition = {
  id: 'taylor-series',
  title: 'Taylor Serileri',
  subtitle: 'Yerelden Küresele Yaklaşım',
  category: 'math',
  description:
    'Bir fonksiyonu merkez noktadaki türev bilgisiyle polinom olarak yaklaşıkla. Derece arttıkça eğrinin hangi bölgelerde iyi taklit edildiğini ve hatanın nerede büyüdüğünü gözlemle.',
  icon: 'T',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'functionType',
      label: 'Fonksiyon',
      type: 'select',
      options: [
        { label: 'Sin(x)', value: 'sine' },
        { label: 'e^x', value: 'exp' },
        { label: 'Cubic', value: 'cubic' },
      ],
    },
    { key: 'degree', label: 'Maksimum Derece', type: 'slider', min: 2, max: 10, step: 1 },
    { key: 'focusX', label: 'Odak Noktası', type: 'slider', min: -2.5, max: 2.5, step: 0.1 },
  ],
  formulaTeX: 'f(x) ≈ Σ[k=0→n] f^(k)(0) / k! · x^k',
  theory: {
    primaryFormula: 'f(x) ≈ Σ[k=0→n] (f⁽ᵏ⁾(0) / k!) xᵏ',
    formulaLabel: 'Maclaurin polinomu',
    symbols: [
      { symbol: 'f⁽ᵏ⁾(0)', meaning: 'Fonksiyonun merkezdeki k. türevi' },
      { symbol: 'k!', meaning: 'Katsayıları normalize eden faktöriyel' },
      { symbol: 'n', meaning: 'Kullanılan en yüksek derece' },
    ],
    derivationSteps: [
      'Fonksiyonun merkez noktadaki değerini ve türevlerini hesapla.',
      'Her türevden ilgili derece katsayısını üret.',
      'Bu katsayılarla bir polinom kurup gerçek fonksiyonla karşılaştır.',
      'Derece arttıkça polinom, merkez yakınında fonksiyonun yerel şeklini daha iyi yakalar.',
    ],
    interpretation:
      'Taylor serisi, fonksiyonu türev bilgisinden yeniden inşa etmeye çalışır. Bu yüzden merkez yakınında çok güçlü, uzak bölgelerde ise sınırlı olabilir.',
    pitfalls: [
      'Tek bir merkezde kurulan polinomun her yerde aynı kalitede çalışacağını sanmak.',
      'Dereceyi artırmanın yakınsaklık yarıçapı sorunlarını otomatik çözdüğünü düşünmek.',
    ],
  },
  derive: deriveTaylorSeriesResult,
  VisualizationComponent: TaylorSeriesVisualization,
} satisfies SimulationModule<TaylorSeriesParams, TaylorSeriesResult>

export const taylorSeriesModule = defineSimulationModule(taylorSeriesDefinition)
