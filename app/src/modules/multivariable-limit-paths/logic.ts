import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  evaluateMultivariableLimitFunction,
  getLimitPathPairLabel,
  getMultivariableLimitLabel,
  round,
  sampleLimitPathPair,
  sampleRange,
  type LimitPathPairId,
  type MultivariableLimitId,
} from '../shared/calculus'

export interface MultivariableLimitPathsParams extends SimulationParamsBase {
  functionType: string
  targetX: number
  targetY: number
  pathPair: string
}

export interface LimitPathFrame {
  step: number
  h: number
  firstPoint: { x: number; y: number }
  secondPoint: { x: number; y: number }
  firstValue: number | null
  secondValue: number | null
}

export interface MultivariableLimitPathsResult extends SimulationResultBase {
  projectionSamples: Array<{ x: number; y: number; value: number | null }>
  firstSeries: Array<{ step: number; value: number | null }>
  secondSeries: Array<{ step: number; value: number | null }>
  firstPathLabel: string
  secondPathLabel: string
  frames: LimitPathFrame[]
  sameLimitEvidence: boolean
}

function buildTimeline(frames: LimitPathFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.step}. yaklaşım · h=${frame.h.toFixed(3)}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Yol Çifti',
      change: 'Doğru vs parabol ile diagonal çiftini sırayla dene.',
      expectation: 'Aynı fonksiyon, farklı yol çiftlerinde limitin varlığına dair çok daha güçlü veya zayıf kanıt üretebilir.',
    },
    {
      title: 'Hedef Nokta',
      change: 'Target noktasını taşı.',
      expectation: 'Fonksiyon ailesi aynı kalsa da tüm yaklaşım geometrisi hedef etrafında yeniden kurulur.',
    },
    {
      title: 'Fonksiyon Tipi',
      change: 'Consistent ile path-dependent arasında geçiş yap.',
      expectation: 'Birinde iki yol aynı sayıya giderken diğerinde iki farklı eğilim net biçimde ayrışır.',
    },
  ]
}

export function deriveMultivariableLimitPathsResult(
  params: MultivariableLimitPathsParams,
): MultivariableLimitPathsResult {
  const functionType = params.functionType as MultivariableLimitId
  const pathPair = params.pathPair as LimitPathPairId
  const sampledPaths = sampleLimitPathPair(pathPair, params.targetX, params.targetY, 6)
  const frames = sampledPaths.first.map((point, index) => ({
    step: point.step,
    h: point.h,
    firstPoint: { x: point.x, y: point.y },
    secondPoint: {
      x: sampledPaths.second[index].x,
      y: sampledPaths.second[index].y,
    },
    firstValue: evaluateMultivariableLimitFunction(
      functionType,
      point.x,
      point.y,
      params.targetX,
      params.targetY,
    ),
    secondValue: evaluateMultivariableLimitFunction(
      functionType,
      sampledPaths.second[index].x,
      sampledPaths.second[index].y,
      params.targetX,
      params.targetY,
    ),
  }))
  const firstSeries = frames.map((frame) => ({
    step: frame.step,
    value: frame.firstValue === null ? null : round(frame.firstValue, 4),
  }))
  const secondSeries = frames.map((frame) => ({
    step: frame.step,
    value: frame.secondValue === null ? null : round(frame.secondValue, 4),
  }))
  const lastFrame = frames.at(-1)
  const lastFirstValue = lastFrame?.firstValue ?? null
  const lastSecondValue = lastFrame?.secondValue ?? null
  const sameLimitEvidence =
    lastFirstValue !== null &&
    lastSecondValue !== null &&
    Math.abs(lastFirstValue - lastSecondValue) < 0.08

  return {
    projectionSamples: sampleRange(-1.6, 1.6, 11).flatMap((dx) =>
      sampleRange(-1.6, 1.6, 11).map((dy) => {
        const value = evaluateMultivariableLimitFunction(
          functionType,
          params.targetX + dx,
          params.targetY + dy,
          params.targetX,
          params.targetY,
        )
        const visible =
          value === null || !Number.isFinite(value) || Math.abs(value) > 3 ? null : round(value, 3)
        return {
          x: params.targetX + dx,
          y: params.targetY + dy,
          value: visible,
        }
      }),
    ),
    firstSeries,
    secondSeries,
    firstPathLabel: sampledPaths.firstLabel,
    secondPathLabel: sampledPaths.secondLabel,
    frames,
    sameLimitEvidence,
    metrics: [
      { label: 'Fonksiyon', value: getMultivariableLimitLabel(functionType), tone: 'primary' },
      { label: 'Yol Çifti', value: getLimitPathPairLabel(pathPair), tone: 'secondary' },
      { label: 'Hedef', value: `(${params.targetX.toFixed(2)}, ${params.targetY.toFixed(2)})`, tone: 'tertiary' },
      {
        label: 'Kanıt',
        value: sameLimitEvidence ? 'aynı limite gidiyor' : 'yollar ayrışıyor',
        tone: 'neutral',
      },
    ],
    learning: {
      summary: `${getMultivariableLimitLabel(functionType)} fonksiyonu, ${getLimitPathPairLabel(pathPair)} üzerinden hedef noktaya yaklaştırıldı.`,
      interpretation:
        'İki değişkenli limitte tek bir yol yeterli değildir. İki farklı yaklaşımın aynı sayıya gitmesi umut verir; farklı sayılara gitmesi ise limitin olmadığını kanıtlar.',
      warnings:
        'Sadece bir veya iki yolun uyuşması limitin kesin varlığını ispatlamaz; fakat iki yolun ayrışması limitin olmadığını göstermek için yeterlidir.',
      tryNext:
        sameLimitEvidence
          ? 'Path-dependent fonksiyona geçip aynı yol çiftinin bu kez neden ayrıştığını izle.'
          : 'Consistent fonksiyona dönüp iki yolun aynı eğilime neden yeniden yakınsadığını karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
