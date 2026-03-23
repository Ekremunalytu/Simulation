import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  directionalDerivativeSurface,
  evaluateSurface,
  getSurfaceLabel,
  round,
  sampleSurfaceContourGrid,
  surfaceGradient,
  type SurfaceId,
} from '../shared/calculus'

export interface DirectionalDerivativeGradientParams extends SimulationParamsBase {
  surfaceType: string
  pointX: number
  pointY: number
  directionAngle: number
}

export interface DirectionalDerivativeFrame {
  h: number
  approxDirectional: number
  endpoint: { x: number; y: number; z: number }
}

export interface DirectionalDerivativeGradientResult extends SimulationResultBase {
  contourSamples: Array<{ x: number; y: number; z: number }>
  pointZ: number
  gradient: { x: number; y: number }
  unitDirection: { x: number; y: number }
  exactDirectional: number
  frames: DirectionalDerivativeFrame[]
  convergenceData: Array<{ step: number; approx: number }>
}

function buildTimeline(frames: DirectionalDerivativeFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame, index) => ({
      label: `${index + 1}. adım · h=${frame.h.toFixed(3)}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Açıyı Döndür',
      change: 'Direction angle değerini gradyan yönüne ve ona dik olacak biçimde taşı.',
      expectation: 'Gradyan doğrultusunda yönlü türev büyür; dik doğrultuda neredeyse sıfırlanır.',
    },
    {
      title: 'Noktayı Taşı',
      change: 'Aynı açıyı koruyup başka bir noktaya geç.',
      expectation: 'Aynı yön vektörü, farklı yerel geometride tamamen farklı bir yönlü türev üretebilir.',
    },
    {
      title: 'Yüzey Karşılaştır',
      change: 'Wave ve paraboloid yüzeyleri arasında geçiş yap.',
      expectation: 'Gradyan büyüklüğü ve yönünün, yüzey ailesine göre nasıl değiştiğini daha net okursun.',
    },
  ]
}

export function deriveDirectionalDerivativeGradientResult(
  params: DirectionalDerivativeGradientParams,
): DirectionalDerivativeGradientResult {
  const surfaceType = params.surfaceType as SurfaceId
  const gradient = surfaceGradient(surfaceType, params.pointX, params.pointY)
  const pointZ = evaluateSurface(surfaceType, params.pointX, params.pointY)
  const radians = (params.directionAngle * Math.PI) / 180
  const unitDirection = { x: Math.cos(radians), y: Math.sin(radians) }
  const exactDirectional = directionalDerivativeSurface(
    surfaceType,
    params.pointX,
    params.pointY,
    unitDirection,
  )
  const hs = [1.2, 0.8, 0.4, 0.18, 0.04]
  const frames = hs.map((h) => {
    const endpoint = {
      x: params.pointX + unitDirection.x * h,
      y: params.pointY + unitDirection.y * h,
      z: evaluateSurface(
        surfaceType,
        params.pointX + unitDirection.x * h,
        params.pointY + unitDirection.y * h,
      ),
    }
    return {
      h,
      approxDirectional: (endpoint.z - pointZ) / h,
      endpoint,
    }
  })

  return {
    contourSamples: sampleSurfaceContourGrid(surfaceType, -2.4, 2.4, 13).map((sample) => ({
      ...sample,
      z: round(sample.z, 3),
    })),
    pointZ,
    gradient,
    unitDirection,
    exactDirectional,
    frames,
    convergenceData: frames.map((frame, index) => ({
      step: index + 1,
      approx: round(frame.approxDirectional, 4),
    })),
    metrics: [
      { label: 'Yüzey', value: getSurfaceLabel(surfaceType), tone: 'primary' },
      { label: '|∇f|', value: Math.hypot(gradient.x, gradient.y).toFixed(3), tone: 'secondary' },
      { label: 'D_u f', value: exactDirectional.toFixed(3), tone: 'tertiary' },
      { label: 'Açı', value: `${params.directionAngle.toFixed(0)}°`, tone: 'neutral' },
    ],
    learning: {
      summary: `${getSurfaceLabel(surfaceType)} yüzeyinde seçilen yön için yönlü türev, hem gradyan projeksiyonu hem fark oranı ile incelendi.`,
      interpretation:
        'Yönlü türev, gradyanın seçilen birim vektör üzerine izdüşümüdür. Bu yüzden gradyan hem büyüklüğü hem de en hızlı artış yönünü aynı anda taşır.',
      warnings:
        'Büyük gradyan büyüklüğü her yönde büyük yönlü türev demek değildir; seçilen yönün gradyanla hizası belirleyicidir.',
      tryNext:
        'Açıyı 90 derece kadar döndürüp contour çizgisine yaklaşık teğet yönde yönlü türevin neden küçüldüğünü gözlemle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
