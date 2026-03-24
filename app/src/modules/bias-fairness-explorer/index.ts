import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveBiasFairnessExplorerResult,
  type BiasFairnessExplorerParams,
  type BiasFairnessExplorerResult,
} from './logic'

const BiasFairnessExplorerVisualization = lazy(async () => ({
  default: (await import('./Visualization')).BiasFairnessExplorerVisualization,
}))

const defaultParams: BiasFairnessExplorerParams = {
  scenario: 'loan-approval',
  threshold: 0.58,
  fairnessAdjustment: false,
}

const presets: PresetConfig<BiasFairnessExplorerParams>[] = [
  {
    name: 'Loan Approval',
    params: {
      scenario: 'loan-approval',
      threshold: 0.58,
      fairnessAdjustment: false,
    },
  },
  {
    name: 'Hiring Screen',
    params: {
      scenario: 'hiring-screen',
      threshold: 0.62,
      fairnessAdjustment: false,
    },
  },
  {
    name: 'Mitigated Review',
    params: {
      scenario: 'loan-approval',
      threshold: 0.56,
      fairnessAdjustment: true,
    },
  },
]

const biasFairnessExplorerDefinition = {
  id: 'bias-fairness-explorer',
  title: 'Bias & Fairness Explorer',
  subtitle: 'Thresholds, Group Metrics and Trade-offs',
  category: 'ml',
  description:
    'Aynı skor dağılımında threshold değiştiğinde accuracy, precision/recall ve fairness gaplerinin nasıl birlikte hareket ettiğini izle. Grup bazlı kararlar, score bandı ve mitigation etkisi tek ekranda karşılaştırılır.',
  icon: '⚖️',
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
        { label: 'Loan Approval', value: 'loan-approval' },
        { label: 'Hiring Screen', value: 'hiring-screen' },
      ],
    },
    {
      key: 'threshold',
      label: 'Decision Threshold',
      type: 'slider',
      min: 0.3,
      max: 0.85,
      step: 0.01,
    },
    {
      key: 'fairnessAdjustment',
      label: 'Fairness Adjustment',
      type: 'toggle',
    },
  ],
  formulaTeX: 'ŷ = 1 [ score ≥ threshold ]',
  theory: {
    primaryFormula: 'Aynı model skorları, farklı threshold seçildiğinde çok farklı operasyonel ve etik sonuçlar üretebilir.',
    formulaLabel: 'Thresholding and group disparities',
    symbols: [
      { symbol: 'selection rate', meaning: 'Bir grubun pozitif karar alma oranı' },
      { symbol: 'TPR', meaning: 'Gerçek pozitifleri yakalama oranı, yani recall' },
      { symbol: 'FPR', meaning: 'Negatif örneklerin hatalı pozitif seçilme oranı' },
      { symbol: 'fairness adjustment', meaning: 'Karar sınırını doğrudan değiştirmeden skorları yeniden dengeleme yaklaşımı' },
    ],
    derivationSteps: [
      'Önce her aday için grup bilgisi, gerçek etiket ve model skoru alınır.',
      'Seçili threshold üzerinde skorlar pozitif ya da negatif karara çevrilir.',
      'Ardından accuracy, precision, recall ve grup bazlı TPR/FPR/selection rate ölçülür.',
      'Threshold sweep, küçük karar değişimlerinin fairness gap üzerinde büyük etkiler doğurabileceğini görünür kılar.',
    ],
    interpretation:
      'Tek bir “doğru” threshold yoktur; uygulamanın riski, hedef metriği ve etik kısıtları birlikte düşünülmelidir.',
    pitfalls: [
      'Sadece accuracy bakmak, az temsil edilen gruptaki sistematik hataları gizleyebilir.',
      'Fairness adjustment bir sihirli çözüm değildir; performans ve eşitlik arasında yeni trade-offlar yaratır.',
    ],
  },
  derive: deriveBiasFairnessExplorerResult,
  VisualizationComponent: BiasFairnessExplorerVisualization,
  codeExample: `pred = 1 if score >= threshold else 0

selection_rate = pred.mean()
tpr = true_positives / actual_positives
dp_gap = abs(selection_rate_group_a - selection_rate_group_b)
eo_gap = abs(tpr_group_a - tpr_group_b)`,
} satisfies SimulationModule<BiasFairnessExplorerParams, BiasFairnessExplorerResult>

export const biasFairnessExplorerModule = defineSimulationModule(biasFairnessExplorerDefinition)
