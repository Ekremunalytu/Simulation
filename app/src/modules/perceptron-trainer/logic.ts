import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { generateTwoClassDataset, type LabeledPoint2D } from '../shared/ml-datasets'

export interface PerceptronTrainerParams extends SimulationParamsBase {
  learningRate: number
  epochs: number
  numPoints: number
  separation: number
  noise: number
  datasetType: 'separable' | 'borderline' | 'xor'
}

export interface PerceptronPrediction extends LabeledPoint2D {
  signedLabel: -1 | 1
  predictedLabel: -1 | 1
  correct: boolean
}

export interface PerceptronEpochSnapshot {
  epoch: number
  w1: number
  w2: number
  bias: number
  mistakes: number
  accuracy: number
  predictions: PerceptronPrediction[]
}

export interface PerceptronTrainerResult extends SimulationResultBase {
  data: LabeledPoint2D[]
  snapshots: PerceptronEpochSnapshot[]
  converged: boolean
  finalAccuracy: number
  finalMistakes: number
}

function toSignedLabel(label: 0 | 1): -1 | 1 {
  return label === 0 ? -1 : 1
}

function predictPoint(
  weights: { w1: number; w2: number; bias: number },
  point: { x: number; y: number },
): -1 | 1 {
  return weights.w1 * point.x + weights.w2 * point.y + weights.bias >= 0 ? 1 : -1
}

function evaluateSnapshot(
  data: LabeledPoint2D[],
  weights: { w1: number; w2: number; bias: number },
  epoch: number,
): PerceptronEpochSnapshot {
  const predictions = data.map((point) => {
    const signedLabel = toSignedLabel(point.label)
    const predictedLabel = predictPoint(weights, point)
    return {
      ...point,
      signedLabel,
      predictedLabel,
      correct: predictedLabel === signedLabel,
    }
  })
  const mistakes = predictions.filter((point) => !point.correct).length

  return {
    epoch,
    w1: weights.w1,
    w2: weights.w2,
    bias: weights.bias,
    mistakes,
    accuracy: 1 - mistakes / Math.max(1, data.length),
    predictions,
  }
}

export function runPerceptronTraining(
  params: PerceptronTrainerParams,
  data: LabeledPoint2D[],
): PerceptronEpochSnapshot[] {
  const weights = { w1: 0, w2: 0, bias: 0 }
  const snapshots: PerceptronEpochSnapshot[] = []

  for (let epoch = 1; epoch <= params.epochs; epoch += 1) {
    data.forEach((point) => {
      const target = toSignedLabel(point.label)
      const prediction = predictPoint(weights, point)

      if (prediction !== target) {
        weights.w1 += params.learningRate * target * point.x
        weights.w2 += params.learningRate * target * point.y
        weights.bias += params.learningRate * target
      }
    })

    const snapshot = evaluateSnapshot(data, weights, epoch)
    snapshots.push(snapshot)

    if (snapshot.mistakes === 0) {
      break
    }
  }

  return snapshots
}

function buildLearningContent(
  params: PerceptronTrainerParams,
  result: PerceptronTrainerResult,
): LearningContent {
  return {
    summary: `${result.snapshots.length} epoch sonunda doğruluk ${(result.finalAccuracy * 100).toFixed(1)}% seviyesine ulaştı.`,
    interpretation:
      params.datasetType === 'xor'
        ? 'XOR veri yapısı lineer ayrılabilir olmadığı için perceptron hata yapmaya devam eder. Bu, tek katmanlı doğrusal sınıflayıcının kapasite sınırını görünür kılar.'
        : result.converged
          ? 'Karar doğrusu lineer ayrımı yakaladı ve perceptron artık hata üretmiyor.'
          : 'Karar doğrusu iyileşse de veri hâlâ sınırda veya gürültülü olduğu için öğrenme tamamlanmadı.',
    warnings:
      params.learningRate > 0.4
        ? 'Yüksek öğrenme oranı karar doğrusunun salınmasına ve geç yakınsamaya neden olabilir.'
        : 'Perceptron sadece lineer ayrılabilir örüntülerde tam yakınsama garantisi verir.',
    tryNext:
      'Aynı ayarlarda datasetType değerini xor ve separable arasında değiştir. Tek katmanlı modelin kapasite sınırını çok net görürsün.',
  }
}

function buildMetrics(result: PerceptronTrainerResult): SimulationMetric[] {
  return [
    {
      label: 'Doğruluk',
      value: `${(result.finalAccuracy * 100).toFixed(1)}%`,
      tone: result.finalAccuracy > 0.9 ? 'secondary' : 'warning',
    },
    {
      label: 'Hata',
      value: result.finalMistakes.toString(),
      tone: result.finalMistakes === 0 ? 'primary' : 'warning',
    },
    {
      label: 'Epoch',
      value: result.snapshots.length.toString(),
      tone: 'tertiary',
    },
    {
      label: 'Durum',
      value: result.converged ? 'Yakınsadı' : 'Sürüyor',
      tone: result.converged ? 'neutral' : 'warning',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'XOR Tuzağı',
      change: 'Dataset type değerini xor yap.',
      expectation: 'Karar doğrusu ne kadar güncellenirse güncellensin bazı örnekler yanlış sınıflanmaya devam eder.',
    },
    {
      title: 'Sınırdaki Veri',
      change: 'Borderline veri tipi ve daha yüksek gürültü seç.',
      expectation: 'Epoch ilerlese de hata sayısı sıfıra inmekte zorlanır.',
    },
    {
      title: 'Öğrenme Oranı',
      change: 'Learning rate değerini büyütüp küçült.',
      expectation: 'Çok küçük değerler yavaş, çok büyük değerler salınımlı güncellemeler üretir.',
    },
  ]
}

function buildTimeline(snapshots: PerceptronEpochSnapshot[]): SimulationTimeline {
  return {
    frames: snapshots.map((snapshot) => ({
      label: `Epoch ${snapshot.epoch}`,
    })),
  }
}

export function derivePerceptronTrainerResult(
  params: PerceptronTrainerParams,
): PerceptronTrainerResult {
  const data = generateTwoClassDataset({
    numPoints: params.numPoints,
    separation: params.separation,
    noise: params.noise,
    shape: params.datasetType,
  })
  const snapshots = runPerceptronTraining(params, data)
  const finalSnapshot = snapshots.at(-1) as PerceptronEpochSnapshot

  const result: PerceptronTrainerResult = {
    data,
    snapshots,
    converged: finalSnapshot.mistakes === 0,
    finalAccuracy: finalSnapshot.accuracy,
    finalMistakes: finalSnapshot.mistakes,
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
  result.metrics = buildMetrics(result)

  return result
}
