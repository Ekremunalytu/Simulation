import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveImproperIntegralsResult,
  type ImproperIntegralsParams,
  type ImproperIntegralsResult,
} from './logic'

const ImproperIntegralsVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ImproperIntegralsVisualization,
}))

const defaultParams: ImproperIntegralsParams = {
  scenario: 'exp-tail',
  exponent: 2,
}

const presets: PresetConfig<ImproperIntegralsParams>[] = [
  { name: 'Varsayılan', params: defaultParams },
  { name: 'Sezgisel', params: { scenario: 'p-tail', exponent: 1.5 } },
  { name: 'Karşılaştırmalı', params: { scenario: 'inv', exponent: 1 } },
]

const improperIntegralsDefinition = {
  id: 'improper-integrals',
  title: 'İmproper İntegraller',
  subtitle: 'Sonsuzlukta ve Tekillikte Alan',
  category: 'math',
  description:
    'Sonsuz aralık ve tekillik içeren integrallerin gerçekten sonlu alana gidip gitmediğini cutoff yaklaşımı ile izle.',
  icon: '∞',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'scenario',
      label: 'Senaryo',
      type: 'select',
      options: [
        { label: 'e^-x Kuyruğu', value: 'exp-tail' },
        { label: '1/x^p Kuyruğu', value: 'p-tail' },
        { label: '1/sqrt(x) Tekilliği', value: 'inv-sqrt' },
        { label: '1/x Iraksaması', value: 'inv' },
      ],
    },
    { key: 'exponent', label: 'p Üssü', type: 'slider', min: 0.6, max: 2.5, step: 0.1 },
  ],
  formulaTeX: '∫[a,∞) f(x)dx = lim b→∞ ∫[a,b] f(x)dx',
  theory: {
    primaryFormula: 'İmproper integral = uygun limit problemi',
    formulaLabel: 'Klasik tanım',
    symbols: [
      { symbol: 'b → ∞', meaning: 'Sonsuz üst sınırı sonlu cutoff ile temsil eder' },
      { symbol: 'ε → 0⁺', meaning: 'Tekillik yakınında güvenli alt sınır yaklaşımı' },
      { symbol: 'lim', meaning: 'Asıl karar mekanizması; integralin varlığı bu limitten gelir' },
    ],
    derivationSteps: [
      'Önce problemli sonsuzluğu veya tekilliği sonlu cutoff ile değiştir.',
      'Bu cutoff için normal belirli integrali hesapla.',
      'Cutoff ilerledikçe kısmi integrallerin davranışını izle.',
      'Sonlu bir limite yerleşiyorsa improper integral yakınsaktır.',
    ],
    interpretation: 'İmproper integralin doğası “yasak” değil, limit tabanlıdır. Sorunlu sınırlar uygun yaklaşım değişkenleriyle incelenir.',
    pitfalls: [
      'Grafik sıfıra gidiyor diye alanın mutlaka sonlu olduğunu sanmak.',
      'Tekillik gördüğünde otomatik olarak ıraksama kararı vermek.',
    ],
  },
  derive: deriveImproperIntegralsResult,
  VisualizationComponent: ImproperIntegralsVisualization,
} satisfies SimulationModule<ImproperIntegralsParams, ImproperIntegralsResult>

export const improperIntegralsModule = defineSimulationModule(improperIntegralsDefinition)
