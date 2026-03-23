import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  classifyCriticalPoint,
  evaluateExtremaSurface,
  extremaGradient,
  extremaSecondPartials,
  getExtremaSurfaceLabel,
  round,
  sampleRange,
  type ExtremaSurfaceId,
} from '../shared/calculus'

export interface ExtremaSecondDerivativeTestParams extends SimulationParamsBase {
  surfaceType: string
  pointX: number
  pointY: number
}

export interface ExtremaStageFrame {
  stage: string
  detail: string
}

export interface ExtremaSecondDerivativeTestResult extends SimulationResultBase {
  contourSamples: Array<{ x: number; y: number; z: number }>
  pointZ: number
  gradient: { x: number; y: number }
  fxx: number
  fyy: number
  fxy: number
  determinant: number
  classification: 'yerel minimum' | 'yerel maksimum' | 'eyer noktası' | 'kritik değil' | 'belirsiz'
  xSlice: Array<{ axisValue: number; actual: number; quadratic: number }>
  ySlice: Array<{ axisValue: number; actual: number; quadratic: number }>
  frames: ExtremaStageFrame[]
}

function buildTimeline(frames: ExtremaStageFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame, index) => ({
      label: `${index + 1}. aşama · ${frame.stage}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Kritik Nokta Kontrolü',
      change: 'Noktayı merkezden uzaklaştır.',
      expectation: 'Gradient sıfır olmadığında ikinci türev testinin neden doğrudan uygulanamadığını görürsün.',
    },
    {
      title: 'Yüzey Tipi',
      change: 'Bowl, hill ve saddle yüzeylerini aynı noktada karşılaştır.',
      expectation: 'Aynı Hessian yapısı, minimum, maksimum ve eyer ayrımını netleştirir.',
    },
    {
      title: 'Lokal Model',
      change: 'Grafikte gerçek kesit ile kuadratik modeli birlikte oku.',
      expectation: 'Yerel sınıflandırmanın yalnızca tek sayıdan değil yerel geometri biçiminden geldiğini anlarsın.',
    },
  ]
}

export function deriveExtremaSecondDerivativeTestResult(
  params: ExtremaSecondDerivativeTestParams,
): ExtremaSecondDerivativeTestResult {
  const surfaceType = params.surfaceType as ExtremaSurfaceId
  const gradient = extremaGradient(surfaceType, params.pointX, params.pointY)
  const { fxx, fyy, fxy } = extremaSecondPartials(surfaceType)
  const determinant = fxx * fyy - fxy ** 2
  const pointZ = evaluateExtremaSurface(surfaceType, params.pointX, params.pointY)
  const classification = classifyCriticalPoint(gradient, fxx, fyy, fxy)
  const xSlice = sampleRange(params.pointX - 1.5, params.pointX + 1.5, 80).map((x) => ({
    axisValue: x,
    actual: evaluateExtremaSurface(surfaceType, x, params.pointY),
    quadratic: pointZ + gradient.x * (x - params.pointX) + 0.5 * fxx * (x - params.pointX) ** 2,
  }))
  const ySlice = sampleRange(params.pointY - 1.5, params.pointY + 1.5, 80).map((y) => ({
    axisValue: y,
    actual: evaluateExtremaSurface(surfaceType, params.pointX, y),
    quadratic: pointZ + gradient.y * (y - params.pointY) + 0.5 * fyy * (y - params.pointY) ** 2,
  }))

  return {
    contourSamples: sampleRange(-2.4, 2.4, 13).flatMap((x) =>
      sampleRange(-2.4, 2.4, 13).map((y) => ({
        x,
        y,
        z: round(evaluateExtremaSurface(surfaceType, x, y), 3),
      })),
    ),
    pointZ,
    gradient,
    fxx,
    fyy,
    fxy,
    determinant,
    classification,
    xSlice,
    ySlice,
    frames: [
      {
        stage: 'gradient',
        detail: `Önce gradient kontrolü yapılır: (${gradient.x.toFixed(2)}, ${gradient.y.toFixed(2)}).`,
      },
      {
        stage: 'Hessian',
        detail: `Sonra determinant D = ${determinant.toFixed(2)} ile ikinci türev verisi okunur.`,
      },
      {
        stage: 'sınıflandırma',
        detail: `Bu noktadaki karar: ${classification}.`,
      },
    ],
    metrics: [
      { label: 'Yüzey', value: getExtremaSurfaceLabel(surfaceType), tone: 'primary' },
      { label: '|∇f|', value: Math.hypot(gradient.x, gradient.y).toFixed(3), tone: 'secondary' },
      { label: 'Det(H)', value: determinant.toFixed(3), tone: 'tertiary' },
      { label: 'Karar', value: classification, tone: 'neutral' },
    ],
    learning: {
      summary: `${getExtremaSurfaceLabel(surfaceType)} fonksiyonunda seçilen nokta, gradient ve ikinci türev testi ile sınıflandırıldı.`,
      interpretation:
        'Ekstremum kararı iki aşamalıdır: önce kritik nokta olma şartı, sonra Hessian determinantı ve işareti. Eyer noktası bu ayrımın en öğretici örneğidir.',
      warnings:
        'Gradient sıfır değilse ikinci türev testi yerel ekstremum kararı için uygulanmaz. Önce kritik nokta şartı doğrulanmalıdır.',
      tryNext:
        classification === 'kritik değil'
          ? 'Noktayı merkeze yaklaştırıp gradientin sıfıra indiği anda sınıflandırmanın nasıl devreye girdiğini izle.'
          : 'Aynı noktada başka bir yüzey ailesine geçip Hessian işaretinin kararı nasıl çevirdiğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline([
      {
        stage: 'gradient',
        detail: `Önce gradient kontrolü yapılır: (${gradient.x.toFixed(2)}, ${gradient.y.toFixed(2)}).`,
      },
      {
        stage: 'Hessian',
        detail: `Sonra determinant D = ${determinant.toFixed(2)} ile ikinci türev verisi okunur.`,
      },
      {
        stage: 'sınıflandırma',
        detail: `Bu noktadaki karar: ${classification}.`,
      },
    ]),
  }
}
