import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  generateTwoClassDataset,
  type LabeledPoint2D,
} from '../shared/ml-datasets'

export interface LogisticRegressionParams extends SimulationParamsBase {
  numPoints: number
  separation: number
  noise: number
  learningRate: number
  epochs: number
  regularization: number
  datasetType: 'separable' | 'borderline' | 'imbalanced'
}

interface BoundarySegment {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface ProbabilityGridCell {
  x: number
  y: number
  width: number
  height: number
  probability: number
}

export interface LogisticFrame {
  epoch: number
  weights: { w0: number; w1: number; bias: number }
  loss: number
  accuracy: number
  boundary: BoundarySegment | null
  probabilityGrid: ProbabilityGridCell[]
  confusion: {
    truePositive: number
    trueNegative: number
    falsePositive: number
    falseNegative: number
  }
}

export interface LogisticRegressionResult extends SimulationResultBase {
  data: LabeledPoint2D[]
  frames: LogisticFrame[]
  history: Array<{ epoch: number; loss: number; accuracy: number }>
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-Math.max(-24, Math.min(24, value))))
}

function predictProbability(
  point: Pick<LabeledPoint2D, 'x' | 'y'>,
  weights: LogisticFrame['weights'],
) {
  return sigmoid(weights.w0 * point.x + weights.w1 * point.y + weights.bias)
}

function boundaryForWeights(
  weights: LogisticFrame['weights'],
  data: LabeledPoint2D[],
): BoundarySegment | null {
  const xValues = data.map((point) => point.x)
  const yValues = data.map((point) => point.y)
  const minX = Math.min(...xValues) - 1
  const maxX = Math.max(...xValues) + 1
  const minY = Math.min(...yValues) - 1
  const maxY = Math.max(...yValues) + 1

  if (Math.abs(weights.w1) < 1e-6) {
    if (Math.abs(weights.w0) < 1e-6) {
      return null
    }

    const x = -weights.bias / weights.w0
    return { x1: x, y1: minY, x2: x, y2: maxY }
  }

  const y1 = -(weights.w0 * minX + weights.bias) / weights.w1
  const y2 = -(weights.w0 * maxX + weights.bias) / weights.w1

  return { x1: minX, y1, x2: maxX, y2 }
}

function probabilityGrid(
  weights: LogisticFrame['weights'],
  data: LabeledPoint2D[],
  samples: number = 15,
) {
  const xValues = data.map((point) => point.x)
  const yValues = data.map((point) => point.y)
  const minX = Math.min(...xValues) - 1
  const maxX = Math.max(...xValues) + 1
  const minY = Math.min(...yValues) - 1
  const maxY = Math.max(...yValues) + 1
  const stepX = (maxX - minX) / samples
  const stepY = (maxY - minY) / samples
  const grid: ProbabilityGridCell[] = []

  for (let row = 0; row < samples; row += 1) {
    for (let col = 0; col < samples; col += 1) {
      const x = minX + col * stepX + stepX / 2
      const y = minY + row * stepY + stepY / 2
      grid.push({
        x,
        y,
        width: stepX,
        height: stepY,
        probability: predictProbability({ x, y }, weights),
      })
    }
  }

  return grid
}

function evaluateFrame(
  data: LabeledPoint2D[],
  weights: LogisticFrame['weights'],
  regularization: number,
  epoch: number,
): LogisticFrame {
  let lossSum = 0
  let correct = 0
  const confusion = {
    truePositive: 0,
    trueNegative: 0,
    falsePositive: 0,
    falseNegative: 0,
  }

  for (const point of data) {
    const probability = predictProbability(point, weights)
    const target = point.label
    const clipped = Math.max(1e-6, Math.min(1 - 1e-6, probability))
    lossSum += -(target * Math.log(clipped) + (1 - target) * Math.log(1 - clipped))

    const prediction = probability >= 0.5 ? 1 : 0
    if (prediction === target) {
      correct += 1
    }

    if (prediction === 1 && target === 1) {
      confusion.truePositive += 1
    } else if (prediction === 0 && target === 0) {
      confusion.trueNegative += 1
    } else if (prediction === 1 && target === 0) {
      confusion.falsePositive += 1
    } else {
      confusion.falseNegative += 1
    }
  }

  const loss =
    lossSum / data.length +
    0.5 * regularization * (weights.w0 ** 2 + weights.w1 ** 2)

  return {
    epoch,
    weights,
    loss,
    accuracy: correct / data.length,
    boundary: boundaryForWeights(weights, data),
    probabilityGrid: probabilityGrid(weights, data),
    confusion,
  }
}

export function runLogisticRegressionTraining(
  params: LogisticRegressionParams,
): LogisticFrame[] {
  const classBalance = params.datasetType === 'imbalanced' ? 0.35 : 0.5
  const shape = params.datasetType === 'imbalanced' ? 'separable' : params.datasetType
  const data = generateTwoClassDataset({
    numPoints: params.numPoints,
    separation: params.separation,
    noise: params.noise,
    shape,
    classBalance,
  })
  const frames: LogisticFrame[] = []
  const weights = { w0: 0, w1: 0, bias: 0 }

  frames.push(evaluateFrame(data, { ...weights }, params.regularization, 0))

  for (let epoch = 1; epoch <= params.epochs; epoch += 1) {
    let gradientW0 = 0
    let gradientW1 = 0
    let gradientBias = 0

    for (const point of data) {
      const probability = predictProbability(point, weights)
      const error = probability - point.label
      gradientW0 += error * point.x
      gradientW1 += error * point.y
      gradientBias += error
    }

    gradientW0 = gradientW0 / data.length + params.regularization * weights.w0
    gradientW1 = gradientW1 / data.length + params.regularization * weights.w1
    gradientBias /= data.length

    weights.w0 -= params.learningRate * gradientW0
    weights.w1 -= params.learningRate * gradientW1
    weights.bias -= params.learningRate * gradientBias

    frames.push(evaluateFrame(data, { ...weights }, params.regularization, epoch))
  }

  return frames
}

function buildTimeline(frames: LogisticFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `Epoch ${frame.epoch}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Karar Sınırı Yaklaştır',
      change: 'Ayrımı yükselt ve gürültüyü azalt.',
      expectation: 'Boundary daha net ayrılır; loss daha hızlı düşerken accuracy daha erken doyar.',
    },
    {
      title: 'Dengesiz Sınıflar',
      change: 'Dataset tipini imbalanced yap.',
      expectation: 'Accuracy tek başına yanıltıcı hale gelir; confusion dağılımında sınıf dengesizliği hissedilir.',
    },
    {
      title: 'Ceza Terimi',
      change: 'Regularization değerini artır.',
      expectation: 'Ağırlık büyüklüğü küçülür, boundary daha temkinli olur ve aşırı keskin geçişler yumuşar.',
    },
  ]
}

export function deriveLogisticRegressionResult(
  params: LogisticRegressionParams,
): LogisticRegressionResult {
  const classBalance = params.datasetType === 'imbalanced' ? 0.35 : 0.5
  const shape = params.datasetType === 'imbalanced' ? 'separable' : params.datasetType
  const data = generateTwoClassDataset({
    numPoints: params.numPoints,
    separation: params.separation,
    noise: params.noise,
    shape,
    classBalance,
  })
  const frames = runLogisticRegressionTraining(params)
  const finalFrame = frames.at(-1) as LogisticFrame

  return {
    data,
    frames,
    history: frames.map((frame) => ({
      epoch: frame.epoch,
      loss: Number(frame.loss.toFixed(6)),
      accuracy: Number(frame.accuracy.toFixed(6)),
    })),
    metrics: [
      { label: 'Loss', value: finalFrame.loss.toFixed(3), tone: 'primary' },
      { label: 'Accuracy', value: `${(finalFrame.accuracy * 100).toFixed(1)}%`, tone: 'secondary' },
      { label: 'w0', value: finalFrame.weights.w0.toFixed(2), tone: 'neutral' },
      { label: 'w1', value: finalFrame.weights.w1.toFixed(2), tone: 'tertiary' },
    ],
    learning: {
      summary: `Model ${params.epochs} epoch boyunca logistic loss altında güncellendi ve ${params.numPoints} noktalı veri kümesinde ayrım sınırı öğrendi.`,
      interpretation:
        params.datasetType === 'borderline'
          ? 'Borderline veri, sigmoid sınırının kararsız bölgede çalışmasına neden olur; loss düşse bile sınıflar tam ayrılmayabilir.'
          : params.datasetType === 'imbalanced'
            ? 'Sınıf dengesizliği, tek bir accuracy değerinin yanıltıcı olabildiğini gösterir. Karar sınırı çoğunluk sınıfına doğru kayabilir.'
            : 'Lineer ayrılabilir veri, logistic regression için ideal bir sahnedir; olasılık yüzeyi iki sınıf arasında pürüzsüz bir geçiş kurar.',
      warnings:
        params.regularization > 0.2
          ? 'Yüksek regularization ağırlıkları fazla bastırabilir; underfitting belirtileri ortaya çıkabilir.'
          : 'Lineer boundary, XOR benzeri doğrusal olmayan örüntüleri temsil edemez. Bu modül kasıtlı olarak lineer sınıflandırma sınırını gösterir.',
      tryNext:
        finalFrame.accuracy > 0.9
          ? 'Şimdi borderline veriyle aynı eğitimi çalıştırıp loss ile accuracy arasındaki farkı karşılaştır.'
          : 'Ayrımı artırıp learning rate değerini küçük adımlarla yükselterek karar sınırının ne kadar hızlandığını izle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
