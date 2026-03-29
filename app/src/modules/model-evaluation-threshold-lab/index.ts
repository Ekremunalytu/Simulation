import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveModelEvaluationThresholdLabResult,
  type ModelEvaluationThresholdLabParams,
  type ModelEvaluationThresholdLabResult,
} from './logic'

const ModelEvaluationThresholdLabVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ModelEvaluationThresholdLabVisualization,
}))

const defaultParams: ModelEvaluationThresholdLabParams = {
  scenario: 'balanced',
  threshold: 0.5,
  sampleCount: 120,
}

const presets: PresetConfig<ModelEvaluationThresholdLabParams>[] = [
  { name: 'Dengeli Veri', params: defaultParams },
  {
    name: 'Dengesiz Veri',
    params: { scenario: 'imbalanced', threshold: 0.45, sampleCount: 120 },
  },
  {
    name: 'Noisy Scores',
    params: { scenario: 'noisy', threshold: 0.55, sampleCount: 140 },
  },
]

const modelEvaluationThresholdLabDefinition = {
  id: 'model-evaluation-threshold-lab',
  title: 'Model Evaluation & Threshold Lab',
  subtitle: 'Confusion Matrix ile ROC Arasında Git Gel',
  category: 'ml',
  description:
    'Tek bir score dağılımından confusion matrix, precision/recall, F1 ve ROC davranışını birlikte oku. Threshold değiştikçe hangi metrikten ne kadar ödün verdiğini doğrudan gör.',
  icon: 'τ',
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
        { label: 'Balanced', value: 'balanced' },
        { label: 'Imbalanced', value: 'imbalanced' },
        { label: 'Noisy', value: 'noisy' },
      ],
    },
    { key: 'threshold', label: 'Anchor Threshold', type: 'slider', min: 0.1, max: 0.9, step: 0.05 },
    { key: 'sampleCount', label: 'Örnek Sayısı', type: 'slider', min: 60, max: 180, step: 10 },
  ],
  formulaTeX: 'precision = TP / (TP + FP)',
  theory: {
    primaryFormula: 'TPR = TP/(TP+FN), FPR = FP/(FP+TN)',
    formulaLabel: 'Threshold tabanlı değerlendirme',
    symbols: [
      { symbol: 'TPR', meaning: 'Gerçek pozitif yakalama oranı (recall)' },
      { symbol: 'FPR', meaning: 'Yanlış alarm oranı' },
      { symbol: 'τ', meaning: 'Pozitif karar için eşik değeri' },
    ],
    derivationSteps: [
      'Aynı score dağılımı üzerinde farklı thresholdlar seç.',
      'Her threshold için confusion matrix hücrelerini yeniden hesapla.',
      'Precision, recall ve F1 gibi oranları bu hücrelerden türet.',
      'Threshold sweep ile ROC uzayında gezinen noktayı izle.',
    ],
    interpretation:
      'Değerlendirme metrikleri çoğu zaman modelden değil, karar eşiğinden etkilenir. Bu modül aynı score kümesi üzerinde o karar katmanını görünür kılar.',
    pitfalls: [
      'Accuracy yüksek diye threshold seçiminin dengeli olduğunu varsaymak.',
      'ROC ve precision/recall eğrilerinin farklı class balance hassasiyetlerini karıştırmak.',
    ],
  },
  derive: deriveModelEvaluationThresholdLabResult,
  VisualizationComponent: ModelEvaluationThresholdLabVisualization,
} satisfies SimulationModule<
  ModelEvaluationThresholdLabParams,
  ModelEvaluationThresholdLabResult
>

export const modelEvaluationThresholdLabModule = defineSimulationModule(
  modelEvaluationThresholdLabDefinition,
)
