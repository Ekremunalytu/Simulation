import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveChainRuleImplicitLinearizationLabResult,
  type ChainRuleImplicitLinearizationLabParams,
  type ChainRuleImplicitLinearizationLabResult,
} from './logic'

const ChainRuleImplicitLinearizationLabVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ChainRuleImplicitLinearizationLabVisualization,
}))

const defaultParams: ChainRuleImplicitLinearizationLabParams = {
  scenario: 'chain',
  anchor: 0.8,
  neighborhood: 0.9,
  steps: 7,
}

const presets: PresetConfig<ChainRuleImplicitLinearizationLabParams>[] = [
  { name: 'Chain Rule', params: defaultParams },
  {
    name: 'Implicit Curve',
    params: { scenario: 'implicit', anchor: 1.1, neighborhood: 0.85, steps: 7 },
  },
  {
    name: 'Linearization',
    params: { scenario: 'linearization', anchor: 0.6, neighborhood: 1.1, steps: 7 },
  },
]

const chainRuleImplicitLinearizationLabDefinition = {
  id: 'chain-rule-implicit-linearization-lab',
  title: 'Chain Rule + Implicit Differentiation Lab',
  subtitle: 'Yerel Türev Akışını Tek Yerde Oku',
  category: 'math',
  description:
    'Zincir kuralı, kapalı türev ve lineerleştirme konularını aynı laboratuvarda karşılaştır. Bir noktadaki türev bilgisinin eğim, teğet ve yerel yaklaşım olarak nasıl tekrar kullanıldığını gör.',
  icon: '∇',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'scenario',
      label: 'Senaryo',
      type: 'select',
      options: [
        { label: 'Chain Rule', value: 'chain' },
        { label: 'Implicit', value: 'implicit' },
        { label: 'Linearization', value: 'linearization' },
      ],
    },
    { key: 'anchor', label: 'Anchor', type: 'slider', min: -1.6, max: 1.6, step: 0.1 },
    { key: 'neighborhood', label: 'Komşuluk', type: 'slider', min: 0.3, max: 1.4, step: 0.1 },
    { key: 'steps', label: 'Adım Sayısı', type: 'slider', min: 5, max: 9, step: 1 },
  ],
  formulaTeX: 'df \\approx f_x(a,b)\\,dx + f_y(a,b)\\,dy',
  theory: {
    primaryFormula: "L(x,y)=f(a,b)+f_x(a,b)(x-a)+f_y(a,b)(y-b)",
    formulaLabel: 'Zincir kuralı, implicit türev ve lineer yaklaşım',
    symbols: [
      { symbol: 'u(x)', meaning: 'Zincir kuralındaki iç fonksiyon' },
      { symbol: 'dy/dx', meaning: 'Implicit eğrinin yerel eğimi' },
      { symbol: 'L(x,y)', meaning: 'Tangent plane üzerinden yerel lineer yaklaşım' },
    ],
    derivationSteps: [
      'Bileşik yapıda iç türev ile dış türevi çarp ve toplam değişimi taşı.',
      'Implicit eğride dx ve dy terimlerini ayırıp yerel eğimi çöz.',
      'İki değişkenli fonksiyonda kısmi türevleri kullanarak tangent plane kur.',
      'Aynı türev bilgisinin üç farklı bağlamda nasıl yeniden kullanıldığını karşılaştır.',
    ],
    interpretation:
      'Bu laboratuvar, türevin tek bir formül değil; farklı görünümler altında aynı yerel değişim bilgisini taşıyan ortak bir dil olduğunu göstermeyi amaçlar.',
    pitfalls: [
      'Zincir kuralında iç türevi atlamak.',
      'Linearizationı geniş bölgelerde de güvenilir bir global model gibi yorumlamak.',
    ],
  },
  derive: deriveChainRuleImplicitLinearizationLabResult,
  VisualizationComponent: ChainRuleImplicitLinearizationLabVisualization,
} satisfies SimulationModule<
  ChainRuleImplicitLinearizationLabParams,
  ChainRuleImplicitLinearizationLabResult
>

export const chainRuleImplicitLinearizationLabModule = defineSimulationModule(
  chainRuleImplicitLinearizationLabDefinition,
)
