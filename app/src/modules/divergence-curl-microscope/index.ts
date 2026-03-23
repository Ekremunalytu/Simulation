import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveDivergenceCurlMicroscopeResult,
  type DivergenceCurlMicroscopeParams,
  type DivergenceCurlMicroscopeResult,
} from './logic'

const DivergenceCurlMicroscopeVisualization = lazy(async () => ({
  default: (await import('./Visualization')).DivergenceCurlMicroscopeVisualization,
}))

const defaultParams: DivergenceCurlMicroscopeParams = {
  fieldType: 'rotation',
  probeX: 0.4,
  probeY: 0.3,
  probeRadius: 0.75,
  sampleCount: 20,
  probeShape: 'circle',
}

const presets: PresetConfig<DivergenceCurlMicroscopeParams>[] = [
  { name: 'Rotation', params: defaultParams },
  { name: 'Radial', params: { ...defaultParams, fieldType: 'radial', probeX: 0.8, probeY: 0.8 } },
  { name: 'Sink', params: { ...defaultParams, fieldType: 'sink', probeShape: 'square' } },
]

const divergenceCurlMicroscopeDefinition = {
  id: 'divergence-curl-microscope',
  title: 'Divergence & Curl Microscope',
  subtitle: 'Local Integral Probe',
  category: 'math',
  description:
    'Küçük bir probe çevresinde flux ve circulation biriktirerek divergence ile curl arasındaki farkı lokal integral sezgisiyle oku.',
  icon: '∮',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'fieldType',
      label: 'Field',
      type: 'select',
      options: [
        { label: 'Rotation', value: 'rotation' },
        { label: 'Radial', value: 'radial' },
        { label: 'Sink', value: 'sink' },
      ],
    },
    { key: 'probeX', label: 'Probe X', type: 'slider', min: -1.5, max: 1.5, step: 0.1 },
    { key: 'probeY', label: 'Probe Y', type: 'slider', min: -1.5, max: 1.5, step: 0.1 },
    { key: 'probeRadius', label: 'Probe Radius', type: 'slider', min: 0.3, max: 1.2, step: 0.05 },
    { key: 'sampleCount', label: 'Samples', type: 'slider', min: 8, max: 36, step: 2 },
    {
      key: 'probeShape',
      label: 'Probe Shape',
      type: 'select',
      options: [
        { label: 'Circle', value: 'circle' },
        { label: 'Square', value: 'square' },
      ],
    },
  ],
  formulaTeX: 'div F ≈ Flux/Area,  curl F ≈ Circulation/Area',
  theory: {
    primaryFormula: 'Kapalı eğri üzerindeki normal akış fluxı, teğetsel akış ise circulationı verir; alanla normalize edilince divergence/curl sezgisi ortaya çıkar.',
    formulaLabel: 'Local integral view',
    symbols: [
      { symbol: 'flux', meaning: 'Yüzeyden net çıkış / giriş' },
      { symbol: 'circulation', meaning: 'Kapalı eğri boyunca dönel akış' },
      { symbol: 'Area', meaning: 'Probe tarafından çevrilen alan' },
    ],
    derivationSteps: [
      'Probe çevresinde örnek noktalar seç ve alan vektörünü ölç.',
      'Normal doğrultuda projeksiyonları toplayarak fluxı biriktir.',
      'Teğet doğrultuda projeksiyonları toplayarak circulationı biriktir.',
      'Alanla normalize ederek lokal divergence ve curl tahmini üret.',
    ],
    interpretation:
      'Aynı ok deseni hem dışa akış hem de dönel hareket taşıyabilir; divergence ile curl bu iki karakteri ayırır.',
    pitfalls: [
      'Flux ile circulationı aynı integral sanmak.',
      'Probe büyüklüğü değişince ham toplamları doğrudan karşılaştırmak.',
    ],
  },
  derive: deriveDivergenceCurlMicroscopeResult,
  VisualizationComponent: DivergenceCurlMicroscopeVisualization,
} satisfies SimulationModule<DivergenceCurlMicroscopeParams, DivergenceCurlMicroscopeResult>

export const divergenceCurlMicroscopeModule = defineSimulationModule(
  divergenceCurlMicroscopeDefinition,
)
