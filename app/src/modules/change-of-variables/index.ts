import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveChangeOfVariablesResult,
  type ChangeOfVariablesParams,
  type ChangeOfVariablesResult,
} from './logic'

const ChangeOfVariablesVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ChangeOfVariablesVisualization,
}))

const defaultParams: ChangeOfVariablesParams = {
  regionType: 'disk',
  integrandType: 'unit',
  subdivisions: 6,
}

const presets: PresetConfig<ChangeOfVariablesParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Halka', params: { regionType: 'annulus', integrandType: 'radius', subdivisions: 6 } },
  { name: 'Sektör', params: { regionType: 'sector', integrandType: 'radial-square', subdivisions: 7 } },
]

const changeOfVariablesDefinition = {
  id: 'change-of-variables',
  title: 'Değişken Dönüşümü ve Jacobian',
  subtitle: 'Polar Hücrelerle Yeniden Topla',
  category: 'math',
  description:
    'Kartezyen bölgeleri polar koordinatlarda yeniden ifade edip alan elemanının Jacobian ile nasıl dönüştüğünü görselleştir.',
  icon: 'r',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'regionType',
      label: 'Bölge',
      type: 'select',
      options: [
        { label: 'Disk', value: 'disk' },
        { label: 'Annulus', value: 'annulus' },
        { label: 'Sector', value: 'sector' },
      ],
    },
    {
      key: 'integrandType',
      label: 'Integrand',
      type: 'select',
      options: [
        { label: '1', value: 'unit' },
        { label: 'r', value: 'radius' },
        { label: 'r²', value: 'radial-square' },
      ],
    },
    { key: 'subdivisions', label: 'Grid Yoğunluğu', type: 'slider', min: 4, max: 8, step: 1 },
  ],
  formulaTeX: '∬_R f(x,y) dA = ∬_S f(r cosθ, r sinθ) · r dr dθ',
  theory: {
    primaryFormula: '∬ᵣ f(x,y) dA = ∬ₛ f(r cosθ, r sinθ) · r dr dθ',
    formulaLabel: 'Polar dönüşümde Jacobian',
    symbols: [
      { symbol: 'r, θ', meaning: 'Polar koordinatlar' },
      { symbol: 'r', meaning: 'Jacobian çarpanı' },
      { symbol: 'S', meaning: 'Dönüşmüş integrasyon bölgesi' },
    ],
    derivationSteps: [
      'Kartezyen bölgeyi polar sınırlar ile yeniden yaz.',
      'Integrand içinde x ve y yerine r cosθ ve r sinθ yerleştir.',
      'Alan elemanını Jacobian ile güncelle.',
      'Yeni koordinatlarda hücre katkılarını toplayıp toplamı karşılaştır.',
    ],
    interpretation:
      'Dönüşüm yalnızca şekli değil, küçük alanların ölçeğini de değiştirir. Jacobian bu geometrik büyümeyi telafi eder.',
    pitfalls: [
      'Jacobiani unutup yalnızca sınır dönüşümü yapmak.',
      'Polar bölgede eşit θ adımlarının Kartezyen düzlemde eşit alan ürettiğini sanmak.',
    ],
  },
  derive: deriveChangeOfVariablesResult,
  VisualizationComponent: ChangeOfVariablesVisualization,
} satisfies SimulationModule<ChangeOfVariablesParams, ChangeOfVariablesResult>

export const changeOfVariablesModule = defineSimulationModule(changeOfVariablesDefinition)
