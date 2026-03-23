import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { generateTwoClassDataset, type LabeledPoint2D } from '../shared/ml-datasets'

export interface SVMMarginExplorerParams extends SimulationParamsBase {
  numPoints: number
  separation: number
  noise: number
  cValue: number
  datasetType: 'separable' | 'borderline' | 'xor'
  kernelMode: 'linear' | 'rbf-preview'
}

export interface SVMAnnotatedPoint extends LabeledPoint2D {
  signedLabel: -1 | 1
  score: number
  marginScore: number
  predictedLabel: -1 | 1
  isSupportVector: boolean
  isMisclassified: boolean
}

export interface SVMSnapshot {
  epoch: number
  w1: number
  w2: number
  bias: number
  accuracy: number
  hingeLoss: number
  supportVectorCount: number
  marginWidth: number
  points: SVMAnnotatedPoint[]
}

export interface SVMMarginExplorerResult extends SimulationResultBase {
  data: LabeledPoint2D[]
  snapshots: SVMSnapshot[]
  finalAccuracy: number
  finalMarginWidth: number
  finalSupportVectorCount: number
  previewAccuracy: number
}

function toSignedLabel(label: 0 | 1): -1 | 1 {
  return label === 0 ? -1 : 1
}

function evaluateSnapshot(
  data: LabeledPoint2D[],
  weights: { w1: number; w2: number; bias: number },
  epoch: number,
): SVMSnapshot {
  const points = data.map((point) => {
    const signedLabel = toSignedLabel(point.label)
    const score = weights.w1 * point.x + weights.w2 * point.y + weights.bias
    const marginScore = signedLabel * score
    const predictedLabel = (score >= 0 ? 1 : -1) as -1 | 1
    return {
      ...point,
      signedLabel,
      score,
      marginScore,
      predictedLabel,
      isSupportVector: marginScore <= 1.05,
      isMisclassified: predictedLabel !== signedLabel,
    }
  })

  const mistakes = points.filter((point) => point.isMisclassified).length
  const hingeLoss =
    points.reduce((sum, point) => sum + Math.max(0, 1 - point.marginScore), 0) /
    Math.max(1, points.length)
  const norm = Math.hypot(weights.w1, weights.w2)

  return {
    epoch,
    w1: weights.w1,
    w2: weights.w2,
    bias: weights.bias,
    accuracy: 1 - mistakes / Math.max(1, points.length),
    hingeLoss,
    supportVectorCount: points.filter((point) => point.isSupportVector).length,
    marginWidth: norm > 0.0001 ? 2 / norm : 0,
    points,
  }
}

export function runLinearSVMTraining(params: SVMMarginExplorerParams, data: LabeledPoint2D[]): SVMSnapshot[] {
  const weights = { w1: 0, w2: 0, bias: 0 }
  const regularization = 0.55
  const learningRate = 0.02
  const epochs = 18
  const snapshots: SVMSnapshot[] = []

  for (let epoch = 1; epoch <= epochs; epoch += 1) {
    data.forEach((point) => {
      const y = toSignedLabel(point.label)
      const score = weights.w1 * point.x + weights.w2 * point.y + weights.bias
      const margin = y * score

      if (margin < 1) {
        weights.w1 -= learningRate * (regularization * weights.w1 - params.cValue * y * point.x)
        weights.w2 -= learningRate * (regularization * weights.w2 - params.cValue * y * point.y)
        weights.bias += learningRate * params.cValue * y
      } else {
        weights.w1 -= learningRate * regularization * weights.w1
        weights.w2 -= learningRate * regularization * weights.w2
      }
    })

    snapshots.push(evaluateSnapshot(data, weights, epoch))
  }

  return snapshots
}

function computeRbfPreviewAccuracy(data: LabeledPoint2D[]) {
  const gamma = 0.18
  let correct = 0

  data.forEach((point, pointIndex) => {
    let score = 0

    data.forEach((other, otherIndex) => {
      if (pointIndex === otherIndex) {
        return
      }

      const signed = toSignedLabel(other.label)
      const distanceSquared = (point.x - other.x) ** 2 + (point.y - other.y) ** 2
      score += signed * Math.exp(-gamma * distanceSquared)
    })

    const predicted = score >= 0 ? 1 : -1
    if (predicted === toSignedLabel(point.label)) {
      correct += 1
    }
  })

  return correct / Math.max(1, data.length)
}

function buildLearningContent(
  params: SVMMarginExplorerParams,
  result: SVMMarginExplorerResult,
): LearningContent {
  return {
    summary: `${result.snapshots.length} epoch sonunda lineer sınır doğruluğu ${(result.finalAccuracy * 100).toFixed(1)}% ve marjin genişliği ${result.finalMarginWidth.toFixed(2)} oldu.`,
    interpretation:
      params.kernelMode === 'rbf-preview'
        ? `RBF preview doğruluğu ${(result.previewAccuracy * 100).toFixed(1)}% ile lineer sınıra sezgisel bir karşılaştırma veriyor. Özellikle XOR benzeri dağılımlarda lineer sınırın yetmediği görünür hale gelir.`
        : 'Lineer SVM, support vectorlerin belirlediği en geniş marjini arar. Kararı bütün veri değil, sınıra en yakın örnekler şekillendirir.',
    warnings:
      params.cValue > 1.4
        ? 'Yüksek C değeri margin yerine eğitim hatasını agresif biçimde minimize eder; bu da sınırın gürültüye daha hassas hale gelmesine yol açabilir.'
        : 'Düşük C değeri daha yumuşak bir marjin üretir; bazı noktalar yanlış sınıflansa da sınır daha kararlı olabilir.',
    tryNext:
      'Aynı veri setinde C değerini büyütüp küçült ve support vector sayısının nasıl değiştiğini izle. Borderline senaryoda fark daha belirgin olur.',
  }
}

function buildMetrics(params: SVMMarginExplorerParams, result: SVMMarginExplorerResult): SimulationMetric[] {
  return [
    {
      label: 'Lineer Doğruluk',
      value: `${(result.finalAccuracy * 100).toFixed(1)}%`,
      tone: result.finalAccuracy > 0.9 ? 'secondary' : 'warning',
    },
    {
      label: 'Marjin',
      value: result.finalMarginWidth.toFixed(2),
      tone: 'primary',
    },
    {
      label: 'Support Vector',
      value: result.finalSupportVectorCount.toString(),
      tone: 'tertiary',
    },
    {
      label: params.kernelMode === 'rbf-preview' ? 'RBF Preview' : 'Kernel',
      value: params.kernelMode === 'rbf-preview' ? `${(result.previewAccuracy * 100).toFixed(1)}%` : 'Linear',
      tone: 'neutral',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'C Parametresi',
      change: 'C değerini küçük ve büyük uçlara taşı.',
      expectation: 'Küçük C daha geniş ama daha yumuşak marjin, büyük C daha sert ve veri odaklı sınır üretir.',
    },
    {
      title: 'Support Vector Avı',
      change: 'Borderline veri tipinde gürültüyü biraz artır.',
      expectation: 'Sınıra yakın kalan örnek sayısı artar ve support vector kümesi kalınlaşır.',
    },
    {
      title: 'RBF Preview',
      change: 'Kernel mode değerini rbf-preview seç ve xor veri tipine geç.',
      expectation: 'Lineer sınır zorlanırken kernel preview doğruluğu belirgin biçimde daha iyi bir sezgi verebilir.',
    },
  ]
}

function buildTimeline(snapshots: SVMSnapshot[]): SimulationTimeline {
  return {
    frames: snapshots.map((snapshot) => ({
      label: `Epoch ${snapshot.epoch}`,
    })),
  }
}

export function deriveSVMMarginExplorerResult(
  params: SVMMarginExplorerParams,
): SVMMarginExplorerResult {
  const data = generateTwoClassDataset({
    numPoints: params.numPoints,
    separation: params.separation,
    noise: params.noise,
    shape: params.datasetType,
  })
  const snapshots = runLinearSVMTraining(params, data)
  const finalSnapshot = snapshots.at(-1) as SVMSnapshot

  const result: SVMMarginExplorerResult = {
    data,
    snapshots,
    finalAccuracy: finalSnapshot.accuracy,
    finalMarginWidth: finalSnapshot.marginWidth,
    finalSupportVectorCount: finalSnapshot.supportVectorCount,
    previewAccuracy: computeRbfPreviewAccuracy(data),
    learning: {
      summary: '',
      interpretation: '',
      warnings: '',
      tryNext: '',
    },
    metrics: [],
    experiments: buildExperiments(),
    timeline: buildTimeline(snapshots),
  }

  result.learning = buildLearningContent(params, result)
  result.metrics = buildMetrics(params, result)

  return result
}
