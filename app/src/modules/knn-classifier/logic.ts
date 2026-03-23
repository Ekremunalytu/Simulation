import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { generateTwoClassDataset, type LabeledPoint2D } from '../shared/ml-datasets'

export interface KNNClassifierParams extends SimulationParamsBase {
  k: number
  numPoints: number
  separation: number
  noise: number
  distanceMetric: 'euclidean' | 'manhattan'
  queryX: number
  queryY: number
  weightedVote: boolean
}

export interface RankedNeighbor extends LabeledPoint2D {
  distance: number
  rank: number
  weight: number
}

export interface VoteBreakdown {
  label: string
  count: number
  weight: number
}

export interface KNNClassifierResult extends SimulationResultBase {
  data: LabeledPoint2D[]
  query: { x: number; y: number }
  nearestNeighbors: RankedNeighbor[]
  voteBreakdown: VoteBreakdown[]
  weightedVote: boolean
  predictedLabel: 0 | 1
  confidence: number
  averageNeighborDistance: number
  decisionMargin: number
}

export function calculateDistance(
  metric: KNNClassifierParams['distanceMetric'],
  left: { x: number; y: number },
  right: { x: number; y: number },
) {
  if (metric === 'manhattan') {
    return Math.abs(left.x - right.x) + Math.abs(left.y - right.y)
  }

  return Math.hypot(left.x - right.x, left.y - right.y)
}

export function rankNeighbors(
  data: LabeledPoint2D[],
  query: { x: number; y: number },
  params: Pick<KNNClassifierParams, 'distanceMetric' | 'weightedVote' | 'k'>,
): RankedNeighbor[] {
  return data
    .map((point) => {
      const distance = calculateDistance(params.distanceMetric, point, query)
      return {
        ...point,
        distance,
        rank: 0,
        weight: params.weightedVote ? 1 / (distance + 0.12) : 1,
      }
    })
    .sort((left, right) => left.distance - right.distance)
    .slice(0, params.k)
    .map((point, index) => ({
      ...point,
      rank: index + 1,
    }))
}

export function summarizeVotes(neighbors: RankedNeighbor[]): VoteBreakdown[] {
  const totalByLabel = new Map<number, { count: number; weight: number }>()

  neighbors.forEach((neighbor) => {
    const current = totalByLabel.get(neighbor.label) ?? { count: 0, weight: 0 }
    totalByLabel.set(neighbor.label, {
      count: current.count + 1,
      weight: current.weight + neighbor.weight,
    })
  })

  return [0, 1].map((label) => {
    const aggregate = totalByLabel.get(label) ?? { count: 0, weight: 0 }
    return {
      label: label === 0 ? 'Sınıf A' : 'Sınıf B',
      count: aggregate.count,
      weight: aggregate.weight,
    }
  })
}

function buildLearningContent(
  params: KNNClassifierParams,
  result: KNNClassifierResult,
): LearningContent {
  return {
    summary: `Sorgu noktası (${params.queryX.toFixed(1)}, ${params.queryY.toFixed(1)}) için en yakın ${params.k} komşu incelendi ve sonuç ${
      result.predictedLabel === 0 ? 'Sınıf A' : 'Sınıf B'
    } olarak bulundu.`,
    interpretation:
      result.decisionMargin > 0.35
        ? 'Komşuların çoğu aynı sınıfta toplandığı için karar marjı güçlü. KNN burada yerel yoğunlukları net biçimde kullanıyor.'
        : 'Komşular iki sınıfa da yakın dağıldığı için karar kırılgan. KNN, özellikle sınır bölgelerinde seçilen k ve mesafe metriğine duyarlıdır.',
    warnings:
      params.weightedVote
        ? 'Ağırlıklı oy, çok yakın birkaç komşunun kararı domine etmesine izin verir. Gürültülü veri varsa bu bazen istenmeyen hassasiyet yaratır.'
        : 'Düz çoğunluk oyu, en yakın komşunun çok daha bilgi taşıdığı durumları göz ardı edebilir.',
    tryNext:
      'Aynı sorgu noktasında k değerini ve weighted vote seçeneğini değiştir. Sınır bölgesinde kararın nasıl yön değiştirdiğini karşılaştır.',
  }
}

function buildMetrics(result: KNNClassifierResult): SimulationMetric[] {
  return [
    {
      label: 'Tahmin',
      value: result.predictedLabel === 0 ? 'Sınıf A' : 'Sınıf B',
      tone: 'secondary',
    },
    {
      label: 'Güven',
      value: `${(result.confidence * 100).toFixed(1)}%`,
      tone: result.confidence >= 0.65 ? 'primary' : 'warning',
    },
    {
      label: 'Ort Mesafe',
      value: result.averageNeighborDistance.toFixed(2),
      tone: 'neutral',
    },
    {
      label: 'Karar Marjı',
      value: result.decisionMargin.toFixed(2),
      tone: 'tertiary',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'K Değerini Büyüt',
      change: 'k değerini 1’den 7 veya 9’a taşı.',
      expectation: 'Tek komşuya duyarlı ani kararlar yumuşar; fakat fazla büyütülürse yerel yapı kaybolabilir.',
    },
    {
      title: 'Mesafe Metriğini Değiştir',
      change: 'Aynı sorgu noktasında Euclidean ile Manhattan arasında geçiş yap.',
      expectation: 'Komşu sıralaması özellikle diyagonal bölgelerde değişebilir.',
    },
    {
      title: 'Ağırlıklı Oyu Aç',
      change: 'weighted vote seçeneğini aktif et.',
      expectation: 'Sorguya çok yakın olan birkaç örnek karar üzerinde daha baskın hale gelir.',
    },
  ]
}

function buildTimeline(k: number): SimulationTimeline {
  return {
    frames: [
      ...Array.from({ length: k }, (_, index) => ({
        label: `${index + 1}. komşu görünür`,
      })),
      { label: 'Nihai sınıf kararı' },
    ],
  }
}

export function deriveKNNClassifierResult(params: KNNClassifierParams): KNNClassifierResult {
  const data = generateTwoClassDataset({
    numPoints: params.numPoints,
    separation: params.separation,
    noise: params.noise,
    shape: params.separation < 1.8 ? 'borderline' : 'separable',
  })
  const query = { x: params.queryX, y: params.queryY }
  const nearestNeighbors = rankNeighbors(data, query, params)
  const voteBreakdown = summarizeVotes(nearestNeighbors)
  const totalWeight = voteBreakdown.reduce((sum, item) => sum + item.weight, 0)
  const sortedVotes = [...voteBreakdown].sort((left, right) => right.weight - left.weight)
  const predictedLabel = sortedVotes[0]?.label === 'Sınıf A' ? 0 : 1
  const confidence = totalWeight === 0 ? 0 : (sortedVotes[0]?.weight ?? 0) / totalWeight
  const decisionMargin =
    totalWeight === 0
      ? 0
      : ((sortedVotes[0]?.weight ?? 0) - (sortedVotes[1]?.weight ?? 0)) / totalWeight
  const averageNeighborDistance =
    nearestNeighbors.reduce((sum, neighbor) => sum + neighbor.distance, 0) /
    Math.max(1, nearestNeighbors.length)

  const result: KNNClassifierResult = {
    data,
    query,
    nearestNeighbors,
    voteBreakdown,
    weightedVote: params.weightedVote,
    predictedLabel,
    confidence,
    averageNeighborDistance,
    decisionMargin,
    learning: {
      summary: '',
      interpretation: '',
      warnings: '',
      tryNext: '',
    },
    metrics: [],
    experiments: buildExperiments(),
    timeline: buildTimeline(params.k),
  }

  result.learning = buildLearningContent(params, result)
  result.metrics = buildMetrics(result)

  return result
}
