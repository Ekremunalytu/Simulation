import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { createSeededRandom } from '../shared/random'

type ScenarioId = 'balanced' | 'imbalanced' | 'noisy'

export interface ModelEvaluationThresholdLabParams extends SimulationParamsBase {
  scenario: ScenarioId
  threshold: number
  sampleCount: number
}

interface ScorePoint {
  id: string
  label: 0 | 1
  score: number
}

export interface ThresholdFrame {
  threshold: number
  truePositive: number
  trueNegative: number
  falsePositive: number
  falseNegative: number
  accuracy: number
  precision: number
  recall: number
  f1: number
  tpr: number
  fpr: number
}

export interface ModelEvaluationThresholdLabResult extends SimulationResultBase {
  scenarioLabel: string
  scores: ScorePoint[]
  frames: ThresholdFrame[]
  thresholdCurves: Array<{ threshold: number; precision: number; recall: number; f1: number }>
  rocCurve: Array<{ threshold: number; fpr: number; tpr: number }>
}

function gaussian(random: ReturnType<typeof createSeededRandom>) {
  const u1 = Math.max(random(), 1e-6)
  const u2 = random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function clamp01(value: number) {
  return Math.max(0.01, Math.min(0.99, value))
}

function buildScores(params: ModelEvaluationThresholdLabParams): ScorePoint[] {
  const random = createSeededRandom(71)
  const thresholdsByScenario: Record<
    ScenarioId,
    { positiveMean: number; positiveStd: number; negativeMean: number; negativeStd: number; positiveRatio: number; label: string }
  > = {
    balanced: {
      positiveMean: 0.78,
      positiveStd: 0.14,
      negativeMean: 0.24,
      negativeStd: 0.12,
      positiveRatio: 0.5,
      label: 'Balanced Scores',
    },
    imbalanced: {
      positiveMean: 0.75,
      positiveStd: 0.14,
      negativeMean: 0.26,
      negativeStd: 0.12,
      positiveRatio: 0.32,
      label: 'Imbalanced Dataset',
    },
    noisy: {
      positiveMean: 0.68,
      positiveStd: 0.18,
      negativeMean: 0.36,
      negativeStd: 0.18,
      positiveRatio: 0.5,
      label: 'Noisy Scores',
    },
  }

  const config = thresholdsByScenario[params.scenario]
  const positiveCount = Math.round(params.sampleCount * config.positiveRatio)

  return Array.from({ length: params.sampleCount }, (_, index) => {
    const label: 0 | 1 = index < positiveCount ? 1 : 0
    const mean = label === 1 ? config.positiveMean : config.negativeMean
    const std = label === 1 ? config.positiveStd : config.negativeStd
    return {
      id: `score-${index}`,
      label,
      score: clamp01(mean + gaussian(random) * std),
    }
  }).sort((left, right) => right.score - left.score)
}

function buildFrame(scores: ScorePoint[], threshold: number): ThresholdFrame {
  let truePositive = 0
  let trueNegative = 0
  let falsePositive = 0
  let falseNegative = 0

  scores.forEach((point) => {
    const predictedPositive = point.score >= threshold
    if (predictedPositive && point.label === 1) truePositive += 1
    else if (predictedPositive && point.label === 0) falsePositive += 1
    else if (!predictedPositive && point.label === 0) trueNegative += 1
    else falseNegative += 1
  })

  const total = scores.length
  const precisionDenominator = truePositive + falsePositive
  const recallDenominator = truePositive + falseNegative
  const falsePositiveDenominator = falsePositive + trueNegative
  const precision = precisionDenominator === 0 ? 0 : truePositive / precisionDenominator
  const recall = recallDenominator === 0 ? 0 : truePositive / recallDenominator
  const f1 = precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall)

  return {
    threshold,
    truePositive,
    trueNegative,
    falsePositive,
    falseNegative,
    accuracy: (truePositive + trueNegative) / total,
    precision,
    recall,
    f1,
    tpr: recall,
    fpr: falsePositiveDenominator === 0 ? 0 : falsePositive / falsePositiveDenominator,
  }
}

function buildTimeline(frames: ThresholdFrame[], threshold: number): SimulationTimeline {
  const initialFrameIndex = frames.findIndex((frame) => Math.abs(frame.threshold - threshold) < 0.001)
  return {
    frames: frames.map((frame) => ({
      label: `τ ${frame.threshold.toFixed(2)}`,
    })),
    initialFrameIndex: initialFrameIndex >= 0 ? initialFrameIndex : Math.floor(frames.length / 2),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Recallu Kurtar',
      change: 'Thresholdu 0.35 civarina indir.',
      expectation:
        'Daha fazla pozitif yakalarsın; recall artarken precision ve false positive sayısı baskı hisseder.',
    },
    {
      title: 'Temkinli Karar',
      change: 'Thresholdu 0.7 üstüne taşı.',
      expectation:
        'Precision güçlenebilir ama bu kez kaçırılan pozitifler yüzünden recall düşer.',
    },
    {
      title: 'Class Balance Etkisi',
      change: 'Balanced ile imbalanced senaryolarını aynı thresholdte karşılaştır.',
      expectation:
        'ROC benzer görünse bile precision/recall dengesi class balance değişiminden daha güçlü etkilenir.',
    },
  ]
}

export function deriveModelEvaluationThresholdLabResult(
  params: ModelEvaluationThresholdLabParams,
): ModelEvaluationThresholdLabResult {
  const scores = buildScores(params)
  const thresholds = Array.from({ length: 9 }, (_, index) => Number((0.1 + index * 0.1).toFixed(2)))
  const frames = thresholds.map((threshold) => buildFrame(scores, threshold))
  const activeFrame =
    frames.find((frame) => Math.abs(frame.threshold - params.threshold) < 0.051) ??
    frames[Math.floor(frames.length / 2)]

  const scenarioLabel =
    params.scenario === 'imbalanced'
      ? 'Imbalanced Dataset'
      : params.scenario === 'noisy'
        ? 'Noisy Scores'
        : 'Balanced Scores'

  return {
    scenarioLabel,
    scores,
    frames,
    thresholdCurves: frames.map((frame) => ({
      threshold: frame.threshold,
      precision: Number(frame.precision.toFixed(4)),
      recall: Number(frame.recall.toFixed(4)),
      f1: Number(frame.f1.toFixed(4)),
    })),
    rocCurve: frames.map((frame) => ({
      threshold: frame.threshold,
      fpr: Number(frame.fpr.toFixed(4)),
      tpr: Number(frame.tpr.toFixed(4)),
    })),
    metrics: [
      { label: 'Scenario', value: scenarioLabel, tone: 'primary' },
      { label: 'Accuracy', value: `${(activeFrame.accuracy * 100).toFixed(1)}%`, tone: 'secondary' },
      { label: 'Precision', value: `${(activeFrame.precision * 100).toFixed(1)}%`, tone: 'tertiary' },
      {
        label: 'Recall',
        value: `${(activeFrame.recall * 100).toFixed(1)}%`,
        tone: activeFrame.recall > 0.75 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `${scenarioLabel} senaryosunda threshold sweep ile confusion matrix yeniden hesaplandı.`,
      interpretation:
        'Aynı score dağılımı üzerinde farklı thresholdlar seçmek, modeli değiştirmeden karar davranışını yeniden kalibre etmek anlamına gelir.',
      warnings:
        params.scenario === 'imbalanced'
          ? 'Dengesiz sınıflarda accuracy tek başına güvenilir değildir; precision ve recall mutlaka birlikte okunmalıdır.'
          : 'ROC uzayı dengeli görünse bile tek bir operating point seçiminin maliyeti confusion matrixte saklıdır.',
      tryNext:
        params.scenario === 'noisy'
          ? 'Balanced senaryoya geçip aynı thresholdün daha temiz score ayrımında nasıl farklı davrandığını karşılaştır.'
          : 'Threshold sweep sonrasında fairness modülüne geçip aynı karar eşiğinin grup bazlı sonuçlarını incele.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames, params.threshold),
  }
}
