import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveExtremaSecondDerivativeTestResult,
  type ExtremaSecondDerivativeTestParams,
  type ExtremaSecondDerivativeTestResult,
} from './logic'

const ExtremaSecondDerivativeTestVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ExtremaSecondDerivativeTestVisualization,
}))

const defaultParams: ExtremaSecondDerivativeTestParams = {
  surfaceType: 'bowl',
  pointX: 0,
  pointY: 0,
}

const presets: PresetConfig<ExtremaSecondDerivativeTestParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Maksimum', params: { surfaceType: 'hill', pointX: 0, pointY: 0 } },
  { name: 'Eyer', params: { surfaceType: 'saddle', pointX: 0, pointY: 0 } },
]

const extremaSecondDerivativeTestDefinition = {
  id: 'extrema-second-derivative-test',
  title: 'Ekstremum ve İkinci Türev Testi',
  subtitle: 'Hessian ile Karar Ver',
  category: 'math',
  description:
    'Kritik noktaları gradient ve Hessian determinantı üzerinden incele; yerel minimum, maksimum ve eyer ayrımını görselleştir.',
  icon: '⊗',
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
        { label: 'Bowl', value: 'bowl' },
        { label: 'Hill', value: 'hill' },
        { label: 'Saddle', value: 'saddle' },
      ],
    },
    { key: 'pointX', label: 'x₀', type: 'slider', min: -1.5, max: 1.5, step: 0.1 },
    { key: 'pointY', label: 'y₀', type: 'slider', min: -1.5, max: 1.5, step: 0.1 },
  ],
  formulaTeX: 'D = f_xx f_yy - (f_xy)^2',
  theory: {
    primaryFormula: 'D = fₓₓ fᵧᵧ - (fₓᵧ)²',
    formulaLabel: 'İkinci türev testi determinantı',
    symbols: [
      { symbol: '∇f = 0', meaning: 'Kritik nokta ön koşulu' },
      { symbol: 'D', meaning: 'Hessian determinantı' },
      { symbol: 'fₓₓ', meaning: 'x doğrultusundaki ikinci türev' },
    ],
    derivationSteps: [
      'Önce gradienti sıfır yapan noktayı bul.',
      'İkinci türevleri kullanarak Hessian determinantını hesapla.',
      'D > 0 ve fₓₓ > 0 ise minimum; D > 0 ve fₓₓ < 0 ise maksimum kararı ver.',
      'D < 0 olduğunda yüzey eyer davranışı sergiler.',
    ],
    interpretation:
      'İkinci türev testi, yüzeyin kritik nokta çevresindeki lokal bükülme yönünü tek kararda özetler.',
    pitfalls: [
      'Kritik nokta şartını atlayıp doğrudan determinant hesabına geçmek.',
      'D > 0 durumunun tek başına yeterli olduğunu sanmak; fₓₓ işareti de gerekir.',
    ],
  },
  derive: deriveExtremaSecondDerivativeTestResult,
  VisualizationComponent: ExtremaSecondDerivativeTestVisualization,
} satisfies SimulationModule<
  ExtremaSecondDerivativeTestParams,
  ExtremaSecondDerivativeTestResult
>

export const extremaSecondDerivativeTestModule = defineSimulationModule(
  extremaSecondDerivativeTestDefinition,
)
