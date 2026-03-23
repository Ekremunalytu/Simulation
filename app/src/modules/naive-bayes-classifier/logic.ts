import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { generateTwoClassDataset, type LabeledPoint2D } from '../shared/ml-datasets'

export interface NaiveBayesClassifierParams extends SimulationParamsBase {
  numPoints: number
  separation: number
  noise: number
  distributionType: 'balanced' | 'overlap' | 'imbalanced'
  queryX: number
  queryY: number
  smoothing: boolean
}

export interface GaussianClassStats {
  label: 0 | 1
  prior: number
  meanX: number
  meanY: number
  varianceX: number
  varianceY: number
  likelihoodX: number
  likelihoodY: number
  joint: number
  posterior: number
}

export interface NaiveBayesClassifierResult extends SimulationResultBase {
  data: LabeledPoint2D[]
  query: { x: number; y: number }
  classStats: GaussianClassStats[]
  predictedLabel: 0 | 1
  confidence: number
  posteriorMargin: number
  distributionLabel: string
}

function gaussianPdf(value: number, mean: number, variance: number) {
  const safeVariance = Math.max(variance, 0.0001)
  const coefficient = 1 / Math.sqrt(2 * Math.PI * safeVariance)
  const exponent = Math.exp(-((value - mean) ** 2) / (2 * safeVariance))
  return coefficient * exponent
}

function datasetConfig(params: NaiveBayesClassifierParams) {
  if (params.distributionType === 'overlap') {
    return {
      shape: 'borderline' as const,
      classBalance: 0.5,
      distributionLabel: 'Örtüşen Dağılım',
    }
  }

  if (params.distributionType === 'imbalanced') {
    return {
      shape: 'separable' as const,
      classBalance: 0.72,
      distributionLabel: 'Dengesiz Öncel',
    }
  }

  return {
    shape: 'separable' as const,
    classBalance: 0.5,
    distributionLabel: 'Dengeli Dağılım',
  }
}

function describeSmoothing(smoothing: boolean) {
  return smoothing ? 0.18 : 0
}

function computeClassStats(
  data: LabeledPoint2D[],
  query: { x: number; y: number },
  smoothing: boolean,
): GaussianClassStats[] {
  const epsilon = describeSmoothing(smoothing)

  return [0, 1].map((label) => {
    const classData = data.filter((point) => point.label === label)
    const prior = classData.length / Math.max(1, data.length)
    const meanX = classData.reduce((sum, point) => sum + point.x, 0) / Math.max(1, classData.length)
    const meanY = classData.reduce((sum, point) => sum + point.y, 0) / Math.max(1, classData.length)
    const varianceX =
      classData.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0) /
        Math.max(1, classData.length) +
      epsilon
    const varianceY =
      classData.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0) /
        Math.max(1, classData.length) +
      epsilon
    const likelihoodX = gaussianPdf(query.x, meanX, varianceX)
    const likelihoodY = gaussianPdf(query.y, meanY, varianceY)
    const joint = prior * likelihoodX * likelihoodY

    return {
      label: label as 0 | 1,
      prior,
      meanX,
      meanY,
      varianceX,
      varianceY,
      likelihoodX,
      likelihoodY,
      joint,
      posterior: 0,
    }
  })
}

function buildLearningContent(
  params: NaiveBayesClassifierParams,
  result: NaiveBayesClassifierResult,
): LearningContent {
  return {
    summary: `${result.distributionLabel} veri setinde sorgu noktası (${params.queryX.toFixed(1)}, ${params.queryY.toFixed(1)}) için posterior hesabı ${
      result.predictedLabel === 0 ? 'Sınıf A' : 'Sınıf B'
    } sonucunu verdi.`,
    interpretation:
      result.posteriorMargin > 0.35
        ? 'Posterior farkı net olduğu için model kararından görece emin. Burada sınıf önceli ile x ve y likelihood bileşenleri aynı sınıfı destekliyor.'
        : 'Posteriorlar birbirine yakın. Bu, Naive Bayes\'in bağımsızlık varsayımı altında sınır bölgesinde daha kırılgan davranabileceğini gösteriyor.',
    warnings: params.smoothing
      ? 'Variance smoothing küçük örnekli ya da dar dağılımlı sınıflarda aşırı keskin likelihood oluşmasını yumuşatır.'
      : 'Smoothing kapalı olduğunda varyans çok küçülürse likelihood aşırı sivrilebilir ve model tek bir özelliğe aşırı güvenebilir.',
    tryNext:
      'Özellikle dengesiz dağılım presetinde smoothing açıp kapat. Prior ve likelihood dengesinin posterioru nasıl ittiğini karşılaştır.',
  }
}

function buildMetrics(result: NaiveBayesClassifierResult): SimulationMetric[] {
  return [
    {
      label: 'Tahmin',
      value: result.predictedLabel === 0 ? 'Sınıf A' : 'Sınıf B',
      tone: 'secondary',
    },
    {
      label: 'Posterior Güven',
      value: `${(result.confidence * 100).toFixed(1)}%`,
      tone: result.confidence > 0.65 ? 'primary' : 'warning',
    },
    {
      label: 'Posterior Marjı',
      value: result.posteriorMargin.toFixed(3),
      tone: 'tertiary',
    },
    {
      label: 'Dağılım',
      value: result.distributionLabel,
      tone: 'neutral',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Öncel Etkisi',
      change: 'Dağılım tipini imbalanced yap ve sorgu noktasını iki sınıfın ortasına yaklaştır.',
      expectation: 'Priors, likelihoodler benzer olduğunda kararı bir sınıfa doğru itebilir.',
    },
    {
      title: 'Smoothing Karşılaştır',
      change: 'Aynı veri setinde smoothing seçeneğini açıp kapat.',
      expectation: 'Smoothing açıkken likelihoodler daha yumuşak ve posterior daha dengeli görünür.',
    },
    {
      title: 'Örtüşen Dağılım',
      change: 'Distribution type değerini overlap seç.',
      expectation: 'İki sınıfın likelihood eğrileri birbirine yaklaşır ve posterior marjı daralır.',
    },
  ]
}

function buildTimeline(): SimulationTimeline {
  return {
    frames: [
      { label: 'Sınıf öncülleri' },
      { label: 'x özelliği likelihood' },
      { label: 'y özelliği likelihood' },
      { label: 'Posterior karşılaştırması' },
    ],
  }
}

export function deriveNaiveBayesClassifierResult(
  params: NaiveBayesClassifierParams,
): NaiveBayesClassifierResult {
  const config = datasetConfig(params)
  const data = generateTwoClassDataset({
    numPoints: params.numPoints,
    separation: params.separation,
    noise: params.noise,
    shape: config.shape,
    classBalance: config.classBalance,
  })
  const query = { x: params.queryX, y: params.queryY }
  const rawStats = computeClassStats(data, query, params.smoothing)
  const jointTotal = rawStats.reduce((sum, item) => sum + item.joint, 0)
  const classStats = rawStats.map((item) => ({
    ...item,
    posterior: jointTotal === 0 ? 0 : item.joint / jointTotal,
  }))
  const sortedByPosterior = [...classStats].sort((left, right) => right.posterior - left.posterior)
  const predictedLabel = sortedByPosterior[0]?.label ?? 0
  const confidence = sortedByPosterior[0]?.posterior ?? 0
  const posteriorMargin = (sortedByPosterior[0]?.posterior ?? 0) - (sortedByPosterior[1]?.posterior ?? 0)

  const result: NaiveBayesClassifierResult = {
    data,
    query,
    classStats,
    predictedLabel,
    confidence,
    posteriorMargin,
    distributionLabel: config.distributionLabel,
    learning: {
      summary: '',
      interpretation: '',
      warnings: '',
      tryNext: '',
    },
    metrics: [],
    experiments: buildExperiments(),
    timeline: buildTimeline(),
  }

  result.learning = buildLearningContent(params, result)
  result.metrics = buildMetrics(result)

  return result
}
