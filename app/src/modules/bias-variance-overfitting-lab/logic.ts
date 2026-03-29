import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { createSeededRandom } from '../shared/random'

type ScenarioId = 'balanced' | 'noisy' | 'sparse'

export interface BiasVarianceOverfittingLabParams extends SimulationParamsBase {
  scenario: ScenarioId
  sampleCount: number
  noise: number
  maxDegree: number
  regularization: number
}

interface SamplePoint {
  x: number
  y: number
}

interface CurveSample {
  x: number
  y: number
}

export interface ComplexityFrame {
  degree: number
  trainMse: number
  validationMse: number
  biasProxy: number
  varianceProxy: number
  fitCurve: CurveSample[]
}

export interface BiasVarianceOverfittingLabResult extends SimulationResultBase {
  scenarioLabel: string
  trainPoints: SamplePoint[]
  validationPoints: SamplePoint[]
  trueCurve: CurveSample[]
  frames: ComplexityFrame[]
}

function gaussian(random: ReturnType<typeof createSeededRandom>) {
  const u1 = Math.max(random(), 1e-6)
  const u2 = random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function trueFunction(x: number) {
  return Math.sin(1.2 * x) + 0.35 * x
}

function sampleXs(sampleCount: number, scenario: ScenarioId) {
  if (scenario === 'sparse') {
    const leftCount = Math.floor(sampleCount / 2)
    const rightCount = sampleCount - leftCount
    const left = Array.from({ length: leftCount }, (_, index) => -2.6 + (index / Math.max(1, leftCount - 1)) * 1.8)
    const right = Array.from({ length: rightCount }, (_, index) => 0.5 + (index / Math.max(1, rightCount - 1)) * 2.1)
    return [...left, ...right]
  }

  return Array.from({ length: sampleCount }, (_, index) => -2.6 + (index / Math.max(1, sampleCount - 1)) * 5.2)
}

function buildDataset(params: BiasVarianceOverfittingLabParams) {
  const random = createSeededRandom(101)
  const noiseScale = params.scenario === 'noisy' ? params.noise * 1.6 : params.noise
  const trainPoints = sampleXs(params.sampleCount, params.scenario).map((x) => ({
    x,
    y: trueFunction(x) + gaussian(random) * noiseScale,
  }))
  const validationPoints = Array.from({ length: 26 }, (_, index) => {
    const x = -2.6 + (index / 25) * 5.2
    return {
      x,
      y: trueFunction(x) + gaussian(random) * Math.max(0.02, noiseScale * 0.35),
    }
  })
  const trueCurve = Array.from({ length: 80 }, (_, index) => {
    const x = -2.6 + (index / 79) * 5.2
    return { x, y: trueFunction(x) }
  })

  return { trainPoints, validationPoints, trueCurve }
}

function polynomialFeatures(x: number, degree: number) {
  const features = [1]
  for (let power = 1; power <= degree; power += 1) {
    features.push(x ** power)
  }
  return features
}

function solveLinearSystem(matrix: number[][], vector: number[]) {
  const size = vector.length
  const augmented = matrix.map((row, rowIndex) => [...row, vector[rowIndex]])

  for (let pivot = 0; pivot < size; pivot += 1) {
    let maxRow = pivot
    for (let row = pivot + 1; row < size; row += 1) {
      if (Math.abs(augmented[row]?.[pivot] ?? 0) > Math.abs(augmented[maxRow]?.[pivot] ?? 0)) {
        maxRow = row
      }
    }

    if (maxRow !== pivot) {
      const current = augmented[pivot]
      augmented[pivot] = augmented[maxRow] as number[]
      augmented[maxRow] = current as number[]
    }

    const pivotValue = augmented[pivot]?.[pivot] ?? 0
    if (Math.abs(pivotValue) < 1e-9) {
      continue
    }

    for (let column = pivot; column <= size; column += 1) {
      augmented[pivot]![column] /= pivotValue
    }

    for (let row = 0; row < size; row += 1) {
      if (row === pivot) continue
      const factor = augmented[row]?.[pivot] ?? 0
      for (let column = pivot; column <= size; column += 1) {
        augmented[row]![column] -= factor * (augmented[pivot]?.[column] ?? 0)
      }
    }
  }

  return augmented.map((row) => row[size] ?? 0)
}

function fitPolynomial(points: SamplePoint[], degree: number, regularization: number) {
  const featureCount = degree + 1
  const gram = Array.from({ length: featureCount }, () => Array.from({ length: featureCount }, () => 0))
  const rhs = Array.from({ length: featureCount }, () => 0)

  points.forEach((point) => {
    const features = polynomialFeatures(point.x, degree)
    for (let row = 0; row < featureCount; row += 1) {
      rhs[row] += features[row]! * point.y
      for (let column = 0; column < featureCount; column += 1) {
        gram[row]![column] += features[row]! * features[column]!
      }
    }
  })

  for (let diagonal = 1; diagonal < featureCount; diagonal += 1) {
    gram[diagonal]![diagonal] += regularization
  }

  return solveLinearSystem(gram, rhs)
}

function evaluatePolynomial(coefficients: number[], x: number) {
  return coefficients.reduce((sum, coefficient, power) => sum + coefficient * x ** power, 0)
}

function mse(points: SamplePoint[], coefficients: number[]) {
  return (
    points.reduce((sum, point) => {
      const error = evaluatePolynomial(coefficients, point.x) - point.y
      return sum + error * error
    }, 0) / points.length
  )
}

function buildTimeline(frames: ComplexityFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `Derece ${frame.degree}`,
    })),
    initialFrameIndex: Math.min(2, frames.length - 1),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Tatlı Nokta',
      change: 'Timeline boyunca validation hatasının dip yaptığı dereceyi bul.',
      expectation:
        'Train hata düşerken validation eğrisi bir noktadan sonra geri dönmeye başlayacaktır.',
    },
    {
      title: 'Regularization Freni',
      change: 'Ridge değerini artır.',
      expectation:
        'Yüksek derecelerdeki sert salınımlar yumuşar; variance proxy genellikle azalır.',
    },
    {
      title: 'Veri Azalınca',
      change: 'Sparse senaryosuna geç.',
      expectation:
        'Özellikle orta bölgede veri boşluğu varsa yüksek dereceli modeller daha kolay taşmaya başlar.',
    },
  ]
}

export function deriveBiasVarianceOverfittingLabResult(
  params: BiasVarianceOverfittingLabParams,
): BiasVarianceOverfittingLabResult {
  const { trainPoints, validationPoints, trueCurve } = buildDataset(params)
  const frames: ComplexityFrame[] = []

  for (let degree = 1; degree <= params.maxDegree; degree += 1) {
    const coefficients = fitPolynomial(trainPoints, degree, params.regularization + 1e-4)
    const trainMse = mse(trainPoints, coefficients)
    const validationMse = mse(validationPoints, coefficients)
    const fitCurve = trueCurve.map((point) => ({
      x: point.x,
      y: evaluatePolynomial(coefficients, point.x),
    }))
    const biasProxy =
      fitCurve.reduce((sum, point) => {
        const error = point.y - trueFunction(point.x)
        return sum + error * error
      }, 0) / fitCurve.length

    frames.push({
      degree,
      trainMse,
      validationMse,
      biasProxy,
      varianceProxy: Math.max(0, validationMse - trainMse),
      fitCurve,
    })
  }

  const bestFrame =
    frames.reduce((best, current) =>
      current.validationMse < best.validationMse ? current : best,
    ) ?? frames[0]

  const initialFrame = frames[Math.min(2, frames.length - 1)] ?? frames[0]
  const scenarioLabel =
    params.scenario === 'noisy'
      ? 'Noisy Data'
      : params.scenario === 'sparse'
        ? 'Sparse Coverage'
        : 'Balanced Data'

  return {
    scenarioLabel,
    trainPoints,
    validationPoints,
    trueCurve,
    frames,
    metrics: [
      { label: 'Scenario', value: scenarioLabel, tone: 'primary' },
      { label: 'Başlangıç Derece', value: String(initialFrame.degree), tone: 'secondary' },
      { label: 'En İyi Validation', value: `d=${bestFrame.degree}`, tone: 'tertiary' },
      {
        label: 'Val MSE',
        value: bestFrame.validationMse.toFixed(3),
        tone: bestFrame.validationMse < 0.12 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `${scenarioLabel} senaryosu için derece 1 ile ${params.maxDegree} arası polinom modeller karşılaştırıldı.`,
      interpretation:
        'Karmaşıklık arttıkça bias azalır; ancak veri ve gürültü yeterince desteklemiyorsa validation hatası yeniden yükselir ve overfitting görünür hale gelir.',
      warnings:
        params.scenario === 'sparse'
          ? 'Veri boşlukları, yüksek dereceli polinomları özellikle gözlemlenmeyen bölgelerde savurabilir.'
          : 'Train hata düşüyor diye modelin gerçekten genelleştiğini varsayma; karar için validation eğrisini takip et.',
      tryNext:
        params.regularization < 0.03
          ? 'Ridge değerini biraz artırıp yüksek derecelerdeki salınımın nasıl sakinleştiğini izle.'
          : 'Scenario değiştirip aynı derece sweepinin veri yapısına göre nasıl başka bir sweet spot ürettiğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
