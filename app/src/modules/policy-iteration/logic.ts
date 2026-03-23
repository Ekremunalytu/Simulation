import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  runPolicyIteration,
  type DynamicProgrammingResultBase,
  type GridMapLayout,
} from '../shared/dynamic-programming'

export interface PolicyIterationParams extends SimulationParamsBase {
  mapLayout: GridMapLayout
  gamma: number
  stepReward: number
  wallPenalty: number
  goalReward: number
  iterations: number
}

export interface PolicyIterationResult extends DynamicProgrammingResultBase {}

function buildTimeline(frameCount: number): SimulationTimeline {
  return {
    frames: Array.from({ length: frameCount }, (_, index) => ({
      label: `${index + 1}. phase`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Policy Stabilization',
      change: 'Iteration sayısını artır.',
      expectation: 'Evaluation-improvement döngüsü sonunda policy değişimleri giderek seyrekleşir.',
    },
    {
      title: 'Riskli Harita',
      change: 'Haritayı cliff-walk seç.',
      expectation: 'Policy improvement, riskli hücrelerden kaçan daha temkinli oklar üretir.',
    },
    {
      title: 'Ceza Baskısı',
      change: 'Step rewardü daha negatif yap.',
      expectation: 'Greedy path gereksiz dolanmaları daha agresif şekilde budar.',
    },
  ]
}

export function derivePolicyIterationResult(
  params: PolicyIterationParams,
): PolicyIterationResult {
  const computed = runPolicyIteration(params)
  const finalDelta = computed.deltaSeries.at(-1)?.delta ?? 0

  return {
    ...computed,
    metrics: [
      { label: 'Start Value', value: computed.startValue.toFixed(2), tone: 'primary' },
      { label: 'Final Change', value: finalDelta.toFixed(3), tone: 'secondary' },
      { label: 'Policy Stability', value: `${(computed.stablePolicyRatio * 100).toFixed(1)}%`, tone: 'tertiary' },
      { label: 'Path Length', value: String(computed.finalPath.length), tone: 'neutral' },
    ],
    learning: {
      summary: `Policy iteration, mevcut policyyi değerlendirip ardından iyileştirerek ${computed.frames.length} faz boyunca ilerledi.`,
      interpretation:
        computed.stablePolicyRatio === 1
          ? 'Son improvement adımı policyyi değiştirmedi; bu, greedy kararların mevcut value yüzeyi ile tutarlı hale geldiğini gösterir.'
          : 'Policy hâlâ değişiyorsa evaluation sonucu bazı state değerleri yeni kararları tetiklemeye devam ediyor demektir.',
      warnings:
        params.iterations < 4
          ? 'Az improvement turu, policy evaluation tamamlanmadan erken durabilir.'
          : 'Policy iteration genelde hızlı kararlılaşır; yine de karmaşık haritalarda evaluation kalitesi sonucu belirler.',
      tryNext:
        params.mapLayout === 'sparse-reward'
          ? 'Aynı ayarlarla easy-goal haritasına dönüp policy stabilitesinin ne kadar çabuk yükseldiğini karşılaştır.'
          : 'Gamma değerini yükseltip improvement adımlarında okların uzak ödülü daha çok hesaba katıp katmadığını incele.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(computed.frames.length),
  }
}
