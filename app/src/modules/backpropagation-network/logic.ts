import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { createSeededRandom, randomBetween } from '../shared/random'
import { generateTwoClassDataset, type LabeledPoint2D } from '../shared/ml-datasets'

export interface BackpropagationNetworkParams extends SimulationParamsBase {
  learningRate: number
  epochs: number
  hiddenUnits: number
  datasetType: 'separable' | 'xor' | 'noisy-xor'
  noise: number
  activation: 'sigmoid' | 'tanh' | 'relu'
}

interface NetworkWeights {
  inputHidden: Array<{ w1: number; w2: number; bias: number }>
  hiddenOutput: Array<{ weight: number }>
  outputBias: number
}

interface SurfaceCell {
  x: number
  y: number
  probability: number
}

export interface HiddenUnitSummary {
  unit: number
  classAActivation: number
  classBActivation: number
  outputWeight: number
}

export interface BackpropSnapshot {
  epoch: number
  loss: number
  accuracy: number
  weights: NetworkWeights
  surfaceGrid: SurfaceCell[]
  hiddenSummary: HiddenUnitSummary[]
}

export interface BackpropagationNetworkResult extends SimulationResultBase {
  data: LabeledPoint2D[]
  snapshots: BackpropSnapshot[]
  finalLoss: number
  finalAccuracy: number
  converged: boolean
}

function activationForward(mode: BackpropagationNetworkParams['activation'], value: number) {
  if (mode === 'tanh') {
    return Math.tanh(value)
  }

  if (mode === 'relu') {
    return Math.max(0, value)
  }

  return 1 / (1 + Math.exp(-value))
}

function activationDerivative(
  mode: BackpropagationNetworkParams['activation'],
  preActivation: number,
  activated: number,
) {
  if (mode === 'tanh') {
    return 1 - activated * activated
  }

  if (mode === 'relu') {
    return preActivation > 0 ? 1 : 0
  }

  return activated * (1 - activated)
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value))
}

function initializeWeights(hiddenUnits: number): NetworkWeights {
  const random = createSeededRandom(42)

  return {
    inputHidden: Array.from({ length: hiddenUnits }, () => ({
      w1: randomBetween(random, -0.9, 0.9),
      w2: randomBetween(random, -0.9, 0.9),
      bias: randomBetween(random, -0.4, 0.4),
    })),
    hiddenOutput: Array.from({ length: hiddenUnits }, () => ({
      weight: randomBetween(random, -0.9, 0.9),
    })),
    outputBias: randomBetween(random, -0.25, 0.25),
  }
}

function forwardPass(
  weights: NetworkWeights,
  activation: BackpropagationNetworkParams['activation'],
  point: { x: number; y: number },
) {
  const hiddenPre = weights.inputHidden.map((unit) => unit.w1 * point.x + unit.w2 * point.y + unit.bias)
  const hiddenAct = hiddenPre.map((value) => activationForward(activation, value))
  const outputPre = hiddenAct.reduce(
    (sum, value, index) => sum + value * (weights.hiddenOutput[index]?.weight ?? 0),
    weights.outputBias,
  )
  const output = sigmoid(outputPre)

  return {
    hiddenPre,
    hiddenAct,
    output,
  }
}

function cloneWeights(weights: NetworkWeights): NetworkWeights {
  return {
    inputHidden: weights.inputHidden.map((unit) => ({ ...unit })),
    hiddenOutput: weights.hiddenOutput.map((unit) => ({ ...unit })),
    outputBias: weights.outputBias,
  }
}

function createSurfaceGrid(
  weights: NetworkWeights,
  activation: BackpropagationNetworkParams['activation'],
): SurfaceCell[] {
  const cells: SurfaceCell[] = []

  for (let row = 0; row < 18; row += 1) {
    for (let column = 0; column < 18; column += 1) {
      const x = -5 + (10 * column) / 17
      const y = -5 + (10 * row) / 17
      const prediction = forwardPass(weights, activation, { x, y }).output
      cells.push({ x, y, probability: prediction })
    }
  }

  return cells
}

function evaluateSnapshot(
  data: LabeledPoint2D[],
  weights: NetworkWeights,
  activation: BackpropagationNetworkParams['activation'],
  epoch: number,
): BackpropSnapshot {
  let correct = 0
  let lossSum = 0
  const classAActivations = Array.from({ length: weights.inputHidden.length }, () => 0)
  const classBActivations = Array.from({ length: weights.inputHidden.length }, () => 0)
  let classACount = 0
  let classBCount = 0

  data.forEach((point) => {
    const { hiddenAct, output } = forwardPass(weights, activation, point)
    const target = point.label
    const predicted = output >= 0.5 ? 1 : 0
    if (predicted === target) {
      correct += 1
    }

    lossSum += -(target * Math.log(output + 1e-9) + (1 - target) * Math.log(1 - output + 1e-9))

    if (point.label === 0) {
      classACount += 1
      hiddenAct.forEach((value, index) => {
        classAActivations[index] += value
      })
    } else {
      classBCount += 1
      hiddenAct.forEach((value, index) => {
        classBActivations[index] += value
      })
    }
  })

  const hiddenSummary = weights.inputHidden.map((_, index) => ({
    unit: index + 1,
    classAActivation: classACount > 0 ? classAActivations[index]! / classACount : 0,
    classBActivation: classBCount > 0 ? classBActivations[index]! / classBCount : 0,
    outputWeight: weights.hiddenOutput[index]?.weight ?? 0,
  }))

  return {
    epoch,
    loss: lossSum / Math.max(1, data.length),
    accuracy: correct / Math.max(1, data.length),
    weights: cloneWeights(weights),
    surfaceGrid: createSurfaceGrid(weights, activation),
    hiddenSummary,
  }
}

export function runBackpropagationTraining(
  params: BackpropagationNetworkParams,
  data: LabeledPoint2D[],
): BackpropSnapshot[] {
  const weights = initializeWeights(params.hiddenUnits)
  const snapshots: BackpropSnapshot[] = []

  for (let epoch = 1; epoch <= params.epochs; epoch += 1) {
    data.forEach((point) => {
      const target = point.label
      const { hiddenPre, hiddenAct, output } = forwardPass(weights, params.activation, point)
      const deltaOut = output - target

      const previousOutputWeights = weights.hiddenOutput.map((unit) => unit.weight)

      weights.hiddenOutput.forEach((unit, index) => {
        unit.weight -= params.learningRate * deltaOut * (hiddenAct[index] ?? 0)
      })
      weights.outputBias -= params.learningRate * deltaOut

      weights.inputHidden.forEach((unit, index) => {
        const hiddenDerivative = activationDerivative(
          params.activation,
          hiddenPre[index] ?? 0,
          hiddenAct[index] ?? 0,
        )
        const hiddenDelta = deltaOut * (previousOutputWeights[index] ?? 0) * hiddenDerivative
        unit.w1 -= params.learningRate * hiddenDelta * point.x
        unit.w2 -= params.learningRate * hiddenDelta * point.y
        unit.bias -= params.learningRate * hiddenDelta
      })
    })

    const snapshot = evaluateSnapshot(data, weights, params.activation, epoch)
    snapshots.push(snapshot)

    if (snapshot.loss < 0.035) {
      break
    }
  }

  return snapshots
}

function buildLearningContent(
  params: BackpropagationNetworkParams,
  result: BackpropagationNetworkResult,
): LearningContent {
  return {
    summary: `${result.snapshots.length} epoch sonunda kayıp ${result.finalLoss.toFixed(3)} ve doğruluk ${(result.finalAccuracy * 100).toFixed(1)}% seviyesine geldi.`,
    interpretation:
      params.datasetType === 'xor' || params.datasetType === 'noisy-xor'
        ? 'Gizli katman, perceptronun çözemediği XOR örüntüsünü doğrusal olmayan bir temsil ile ayırmayı öğrenir. Bu, backpropagationun asıl gücünü görünür kılar.'
        : 'Lineer ayrılabilir veri setinde ağ hızlıca düşük kayıplı bir çözüme iner; gizli katman yine de ara temsil öğrenir.',
    warnings:
      params.activation === 'relu'
        ? 'ReLU bazı birimlerin erken sıfırlanmasına neden olabilir; küçük ağlarda bu bazen öğrenmeyi dengesiz hale getirir.'
        : 'Sigmoid ve tanh daha pürüzsüz gradyan verir ama doygun bölgelerde güncellemeler zayıflayabilir.',
    tryNext:
      'XOR ve noisy-xor arasında geçiş yapıp hidden unit sayısını artır. Kayıp eğrisi ile karar yüzeyinin nasıl karmaşıklaştığını birlikte izle.',
  }
}

function buildMetrics(result: BackpropagationNetworkResult): SimulationMetric[] {
  return [
    {
      label: 'Doğruluk',
      value: `${(result.finalAccuracy * 100).toFixed(1)}%`,
      tone: result.finalAccuracy > 0.9 ? 'secondary' : 'warning',
    },
    {
      label: 'Kayıp',
      value: result.finalLoss.toFixed(3),
      tone: result.finalLoss < 0.2 ? 'primary' : 'warning',
    },
    {
      label: 'Epoch',
      value: result.snapshots.length.toString(),
      tone: 'tertiary',
    },
    {
      label: 'Durum',
      value: result.converged ? 'Kararlı' : 'Sürüyor',
      tone: result.converged ? 'neutral' : 'warning',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'XOR Karşılaştırması',
      change: 'Dataset type değerini xor yap ve hidden unit sayısını 2 ile 4 arasında karşılaştır.',
      expectation: 'Gizli katman kapasitesi arttıkça XOR için karar yüzeyi daha esnek hale gelir.',
    },
    {
      title: 'Aktivasyon Farkı',
      change: 'Sigmoid, tanh ve ReLU arasında geçiş yap.',
      expectation: 'Aynı veri setinde kayıp eğrisi ve gizli aktivasyon profilleri farklı davranır.',
    },
    {
      title: 'Gürültülü XOR',
      change: 'Noisy-xor seç ve noise değerini artır.',
      expectation: 'Karar yüzeyi daha pürüzlü hale gelir, doğruluk düşerken loss eğrisi daha yavaş iner.',
    },
  ]
}

function buildTimeline(snapshots: BackpropSnapshot[]): SimulationTimeline {
  return {
    frames: snapshots.map((snapshot) => ({
      label: `Epoch ${snapshot.epoch}`,
    })),
  }
}

export function deriveBackpropagationNetworkResult(
  params: BackpropagationNetworkParams,
): BackpropagationNetworkResult {
  const data = generateTwoClassDataset({
    numPoints: 84,
    separation: params.datasetType === 'separable' ? 2.6 : 2,
    noise: params.noise,
    shape: params.datasetType,
  })
  const snapshots = runBackpropagationTraining(params, data)
  const finalSnapshot = snapshots.at(-1) as BackpropSnapshot

  const result: BackpropagationNetworkResult = {
    data,
    snapshots,
    finalLoss: finalSnapshot.loss,
    finalAccuracy: finalSnapshot.accuracy,
    converged: finalSnapshot.loss < 0.08,
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
