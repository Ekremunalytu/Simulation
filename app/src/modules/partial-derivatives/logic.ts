import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  evaluateSurface,
  getSurfaceLabel,
  partialDerivativeX,
  partialDerivativeY,
  round,
  sampleRange,
  type SurfaceId,
} from '../shared/calculus'

export interface PartialDerivativesParams extends SimulationParamsBase {
  surfaceType: string
  pointX: number
  pointY: number
}

export interface SurfaceSample {
  x: number
  y: number
  z: number
}

export interface SlicePoint {
  axisValue: number
  actual: number
  tangent: number
}

export interface PartialDerivativeFrame {
  h: number
  approxDfdx: number
  approxDfdy: number
  xOffsetPoint: { x: number; y: number; z: number }
  yOffsetPoint: { x: number; y: number; z: number }
  xSecantLine: SlicePoint[]
  ySecantLine: SlicePoint[]
}

export interface PartialDerivativesResult extends SimulationResultBase {
  pointZ: number
  dfdx: number
  dfdy: number
  gradientMagnitude: number
  tangentPlane: string
  contourSamples: SurfaceSample[]
  xSlice: SlicePoint[]
  ySlice: SlicePoint[]
  frames: PartialDerivativeFrame[]
  convergenceData: Array<{ step: number; approxDfdx: number; approxDfdy: number }>
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'h Küçült',
      change: 'Animasyonu sonuna kadar oynat ve secant eğimlerinin analitik türevlere nasıl yanaştığını izle.',
      expectation: 'Başta kaba olan x ve y fark oranları, h küçüldükçe gerçek kısmi türevlere yaklaşmalı.',
    },
    {
      title: 'Eyer Noktası',
      change: 'Saddle yüzeyinde (0,0) çevresini incele.',
      expectation: 'Bir doğrultuda artış, diğerinde azalış olduğu için iki kısmi türevin sezgisi daha net ayrılır.',
    },
    {
      title: 'Dalgalı Yüzey',
      change: 'Wave yüzeyinde farklı noktalara geç.',
      expectation: 'Periyodik yüzeyde secant ve tangent doğrultuları sürekli yön değiştirir.',
    },
  ]
}

function buildTimeline(frames: PartialDerivativeFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame, index) => ({
      label: `${index + 1}. adım · h=${frame.h.toFixed(3)}`,
    })),
  }
}

export function derivePartialDerivativesResult(
  params: PartialDerivativesParams,
): PartialDerivativesResult {
  const surfaceType = params.surfaceType as SurfaceId
  const pointZ = evaluateSurface(surfaceType, params.pointX, params.pointY)
  const dfdx = partialDerivativeX(surfaceType, params.pointX, params.pointY)
  const dfdy = partialDerivativeY(surfaceType, params.pointX, params.pointY)
  const gradientMagnitude = Math.hypot(dfdx, dfdy)
  const offsets = [1.2, 0.75, 0.4, 0.18, 0.08]

  const contourSamples = sampleRange(-2.5, 2.5, 9).flatMap((x) =>
    sampleRange(-2.5, 2.5, 9).map((y) => ({
      x,
      y,
      z: round(evaluateSurface(surfaceType, x, y)),
    })),
  )

  const xSlice = sampleRange(params.pointX - 2, params.pointX + 2, 60).map((x) => ({
    axisValue: x,
    actual: evaluateSurface(surfaceType, x, params.pointY),
    tangent: pointZ + dfdx * (x - params.pointX),
  }))
  const ySlice = sampleRange(params.pointY - 2, params.pointY + 2, 60).map((y) => ({
    axisValue: y,
    actual: evaluateSurface(surfaceType, params.pointX, y),
    tangent: pointZ + dfdy * (y - params.pointY),
  }))

  const frames = offsets.map((h) => {
    const xOffsetPoint = {
      x: params.pointX + h,
      y: params.pointY,
      z: evaluateSurface(surfaceType, params.pointX + h, params.pointY),
    }
    const yOffsetPoint = {
      x: params.pointX,
      y: params.pointY + h,
      z: evaluateSurface(surfaceType, params.pointX, params.pointY + h),
    }
    const approxDfdx = (xOffsetPoint.z - pointZ) / h
    const approxDfdy = (yOffsetPoint.z - pointZ) / h

    return {
      h,
      approxDfdx,
      approxDfdy,
      xOffsetPoint,
      yOffsetPoint,
      xSecantLine: sampleRange(params.pointX - 2, params.pointX + 2, 40).map((x) => ({
        axisValue: x,
        actual: evaluateSurface(surfaceType, x, params.pointY),
        tangent: pointZ + approxDfdx * (x - params.pointX),
      })),
      ySecantLine: sampleRange(params.pointY - 2, params.pointY + 2, 40).map((y) => ({
        axisValue: y,
        actual: evaluateSurface(surfaceType, params.pointX, y),
        tangent: pointZ + approxDfdy * (y - params.pointY),
      })),
    }
  })

  const tangentPlane = `L(x,y) = ${pointZ.toFixed(3)} ${dfdx >= 0 ? '+' : '-'} ${Math.abs(dfdx).toFixed(3)}(x-${params.pointX.toFixed(2)}) ${dfdy >= 0 ? '+' : '-'} ${Math.abs(dfdy).toFixed(3)}(y-${params.pointY.toFixed(2)})`

  return {
    pointZ,
    dfdx,
    dfdy,
    gradientMagnitude,
    tangentPlane,
    contourSamples,
    xSlice,
    ySlice,
    frames,
    convergenceData: frames.map((frame, index) => ({
      step: index + 1,
      approxDfdx: round(frame.approxDfdx, 4),
      approxDfdy: round(frame.approxDfdy, 4),
    })),
    metrics: [
      { label: 'f(x₀, y₀)', value: pointZ.toFixed(3), tone: 'primary' },
      { label: '∂f/∂x', value: dfdx.toFixed(3), tone: 'secondary' },
      { label: '∂f/∂y', value: dfdy.toFixed(3), tone: 'tertiary' },
      { label: '|∇f|', value: gradientMagnitude.toFixed(3), tone: 'neutral' },
    ],
    learning: {
      summary: `${getSurfaceLabel(surfaceType)} yüzeyinde (${params.pointX.toFixed(2)}, ${params.pointY.toFixed(2)}) noktası için kısmi türevler hem analitik hem fark oranı adımlarıyla incelendi.`,
      interpretation:
        'Bu kez sonuç doğrudan verilmekle kalmıyor; h küçüldükçe x ve y doğrultularındaki secant eğimleri gerçek kısmi türevlere yaklaşıyor. Çok değişkenli türev sezgisi burada doğuyor.',
      warnings:
        'Bir noktadaki x-yönlü ve y-yönlü eğimler farklı hızda yakınsayabilir. Tek bir kesite bakıp tüm yerel davranışı anladığını varsayma.',
      tryNext:
        gradientMagnitude < 0.2
          ? 'Noktayı biraz kaydır ve yaklaşım animasyonunda fark oranlarının nasıl hızla büyüdüğünü izle.'
          : 'Yüzeyi değiştirip aynı h adımlarında farklı geometrilerin kısmi türevleri nasıl etkilediğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
