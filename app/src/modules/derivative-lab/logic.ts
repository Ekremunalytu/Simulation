import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  derivativeAnalysisFunction,
  evaluateAnalysisFunction,
  getAnalysisInterpretation,
  getAnalysisFunctionLabel,
  round,
  sampleFunction,
  type AnalysisFunctionId,
  type SamplePoint,
} from '../shared/calculus'

export interface DerivativeLabParams extends SimulationParamsBase {
  functionType: string
  point: number
  initialH: number
  steps: number
}

export interface DerivativeFrame {
  h: number
  secantSlope: number
  tangentSlope: number
  error: number
  secantLine: { x: number; y: number }[]
  tangentLine: { x: number; y: number }[]
}

export interface DerivativeLabResult extends SimulationResultBase {
  curve: SamplePoint[]
  frames: DerivativeFrame[]
  pointValue: number
  tangentSlope: number
  convergenceData: { step: number; secantSlope: number; error: number }[]
}

function buildTimeline(frames: DerivativeFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame, index) => ({
      label: `${index + 1}. yaklaşım · h=${frame.h.toFixed(3)}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'h Küçülürken',
      change: 'Başlangıç farkını büyütüp sonra yeniden oynat.',
      expectation: 'İlk secant eğimleri tangentten daha uzak başlayacak ama adımlar ilerledikçe yine yakınsayacak.',
    },
    {
      title: 'Fonksiyon Değiştir',
      change: 'Sinüs ve üstel fonksiyon arasında geçiş yap.',
      expectation: 'Her fonksiyonda yakınsama mantığı aynı kalır; yalnızca hedef tangent eğimi değişir.',
    },
    {
      title: 'Kritik Nokta Yakını',
      change: 'Cubic fonksiyon için x=1 civarına gel.',
      expectation: 'Tangent eğimi sıfıra yaklaştıkça secant eğimleri de yataylaşır.',
    },
  ]
}

export function deriveDerivativeLabResult(
  params: DerivativeLabParams,
): DerivativeLabResult {
  const functionType = params.functionType as AnalysisFunctionId
  const pointValue = evaluateAnalysisFunction(functionType, params.point)
  const tangentSlope = derivativeAnalysisFunction(functionType, params.point)
  const frames: DerivativeFrame[] = []
  const safeInitialH = Math.max(params.initialH, 0.1)
  const sampleMin = params.point - Math.max(2.5, safeInitialH * 1.4)
  const sampleMax = params.point + Math.max(2.5, safeInitialH * 1.4)

  for (let step = 0; step < params.steps; step += 1) {
    const h = safeInitialH / 2 ** step
    const x2 = params.point + h
    const y2 = evaluateAnalysisFunction(functionType, x2)
    const secantSlope = (y2 - pointValue) / h
    const secantIntercept = pointValue - secantSlope * params.point
    const tangentIntercept = pointValue - tangentSlope * params.point

    frames.push({
      h: round(h),
      secantSlope,
      tangentSlope,
      error: Math.abs(secantSlope - tangentSlope),
      secantLine: [
        { x: sampleMin, y: secantSlope * sampleMin + secantIntercept },
        { x: sampleMax, y: secantSlope * sampleMax + secantIntercept },
      ],
      tangentLine: [
        { x: sampleMin, y: tangentSlope * sampleMin + tangentIntercept },
        { x: sampleMax, y: tangentSlope * sampleMax + tangentIntercept },
      ],
    })
  }

  return {
    curve: sampleFunction(
      (x) => evaluateAnalysisFunction(functionType, x),
      sampleMin,
      sampleMax,
      180,
    ),
    frames,
    pointValue,
    tangentSlope,
    convergenceData: frames.map((frame, index) => ({
      step: index + 1,
      secantSlope: frame.secantSlope,
      error: frame.error,
    })),
    metrics: [
      { label: 'f(a)', value: pointValue.toFixed(3), tone: 'primary' },
      { label: "f'(a)", value: tangentSlope.toFixed(3), tone: 'secondary' },
      {
        label: 'Son Hata',
        value: frames.at(-1)?.error.toFixed(5) ?? '0.00000',
        tone: (frames.at(-1)?.error ?? 0) < 0.01 ? 'secondary' : 'warning',
      },
      {
        label: 'Fonksiyon',
        value: getAnalysisFunctionLabel(functionType).replace('f(x) = ', ''),
        tone: 'neutral',
      },
    ],
    learning: {
      summary: `Secant eğimi, x = ${params.point.toFixed(2)} noktasında h küçüldükçe tangent eğimine yaklaşır.`,
      interpretation: `${getAnalysisInterpretation(functionType)} Son adımda secant eğimi ${frames.at(-1)?.secantSlope.toFixed(4)} değerine gelerek türev limitini görünür hale getirir.`,
      warnings:
        safeInitialH > 1.5
          ? 'İlk h değeri büyük olduğunda secant doğru yerel davranış yerine daha geniş bir bölgeyi ortalamış olur.'
          : 'Çok küçük h değerleri sayısal hesapta hassasiyeti zorlayabilir; teoride limit alınır ama bilgisayarda sonlu adımlar kullanılır.',
      tryNext:
        tangentSlope === 0
          ? 'Noktayı biraz kaydırıp tangent eğiminin nasıl işaret değiştirdiğini izle.'
          : 'Aynı fonksiyonda farklı bir nokta seçerek türevin global değil, noktaya bağlı bir oran olduğunu karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
