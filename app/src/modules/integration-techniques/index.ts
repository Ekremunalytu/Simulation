import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveIntegrationTechniquesResult,
  type IntegrationTechniquesParams,
  type IntegrationTechniquesResult,
} from './logic'

const IntegrationTechniquesVisualization = lazy(async () => ({
  default: (await import('./Visualization')).IntegrationTechniquesVisualization,
}))

const defaultParams: IntegrationTechniquesParams = {
  technique: 'substitution',
}

const presets: PresetConfig<IntegrationTechniquesParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { technique: 'parts' } },
  { name: 'Karşılaştırmalı', params: { technique: 'partial-fractions' } },
]

const integrationTechniquesDefinition = {
  id: 'integration-techniques',
  title: 'İntegral Teknikleri',
  subtitle: 'Doğru Yöntemi Seç',
  category: 'math',
  description:
    'Substitution, parçalı integrasyon ve kısmi kesirler arasında geçiş yap. Amaç sadece sonucu görmek değil, hangi yapının hangi tekniği çağırdığını sezmek.',
  icon: '∫',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'technique',
      label: 'Teknik',
      type: 'select',
      options: [
        { label: 'Substitution', value: 'substitution' },
        { label: 'Integration by Parts', value: 'parts' },
        { label: 'Partial Fractions', value: 'partial-fractions' },
      ],
    },
  ],
  formulaTeX: '∫ f(g(x))g\'(x) dx = ∫ f(u) du',
  theory: {
    primaryFormula: 'Amaç: integrali daha basit bir forma dönüştürmek',
    formulaLabel: 'Teknik seçimi sezgisi',
    symbols: [
      { symbol: 'u-substitution', meaning: 'İç fonksiyonu tek değişkene indirger' },
      { symbol: '∫u dv = uv - ∫v du', meaning: 'Parçalı integrasyon kimliği' },
      { symbol: 'A/(x-a)+B/(x-b)', meaning: 'Rasyonel ifadeyi daha basit logaritmik parçalara ayırır' },
    ],
    derivationSteps: [
      'Önce integrandın yapısını gör: bileşik fonksiyon mu, çarpım mı, rasyonel ifade mi?',
      'Yapıyı basitleştirecek tekniği seç.',
      'Her adımda integral daha tanıdık bir forma gidiyorsa doğru yoldasın.',
      'Son adımda x değişkenine geri dönerek antitürevi tamamla.',
    ],
    interpretation: 'Bu modül işlem ezberinden çok yapı tanıma pratiği verir. İyi integral çözümü çoğu zaman ilk kararda başlar.',
    pitfalls: [
      'Her çarpım için parçalı integrasyon kullanmak.',
      'Substitution sonrası değişkeni geri çevirmeyi unutmak.',
    ],
  },
  derive: deriveIntegrationTechniquesResult,
  VisualizationComponent: IntegrationTechniquesVisualization,
} satisfies SimulationModule<IntegrationTechniquesParams, IntegrationTechniquesResult>

export const integrationTechniquesModule = defineSimulationModule(integrationTechniquesDefinition)
