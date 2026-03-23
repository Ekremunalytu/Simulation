import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  derivativeParametricCurve,
  evaluateParametricCurve,
  getParametricCurveLabel,
  parametricRange,
  sampleParametricCurve,
  type ParametricCurveId,
} from '../shared/calculus'

export interface ParametricCurvesParams extends SimulationParamsBase {
  curveType: string
  samples: number
}

export interface ParametricFrame {
  t: number
  point: { x: number; y: number }
  tangent: { x: number; y: number }
  speed: number
}

export interface ParametricCurvesResult extends SimulationResultBase {
  path: Array<{ t: number; x: number; y: number }>
  frames: ParametricFrame[]
  speedData: Array<{ t: number; speed: number }>
}

function buildTimeline(frames: ParametricFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `t = ${frame.t.toFixed(2)}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Eğri Değiştir',
      change: 'Circle ile cycloid arasında geçiş yap.',
      expectation: 'Parametrik eğri mantığı sabit kalırken tangent ve hız davranışı dramatik biçimde değişir.',
    },
    {
      title: 'Örnek Sayısını Artır',
      change: 'Samples değerini büyüt.',
      expectation: 'Nokta hareketi daha akıcı hale gelir; path eğrisi daha net görünür.',
    },
    {
      title: 'Hız Sezgisi',
      change: 'Lissajous eğrisinde farklı t anlarını izle.',
      expectation: 'Geometri ile hız büyüklüğünün aynı şey olmadığını daha net ayırt edersin.',
    },
  ]
}

export function deriveParametricCurvesResult(
  params: ParametricCurvesParams,
): ParametricCurvesResult {
  const curveType = params.curveType as ParametricCurveId
  const [start, end] = parametricRange(curveType)
  const path = sampleParametricCurve(curveType, 180)
  const tValues = Array.from({ length: params.samples }, (_, index) =>
    start + ((end - start) * index) / Math.max(params.samples - 1, 1),
  )
  const frames = tValues.map((t) => {
    const point = evaluateParametricCurve(curveType, t)
    const tangent = derivativeParametricCurve(curveType, t)
    const speed = Math.hypot(tangent.x, tangent.y)
    return { t, point, tangent, speed }
  })

  return {
    path,
    frames,
    speedData: frames.map((frame) => ({ t: frame.t, speed: frame.speed })),
    metrics: [
      { label: 'Eğri', value: getParametricCurveLabel(curveType), tone: 'primary' },
      { label: 'Kare Sayısı', value: String(params.samples), tone: 'secondary' },
      {
        label: 'Son Hız',
        value: frames.at(-1)?.speed.toFixed(3) ?? '0.000',
        tone: 'tertiary',
      },
      {
        label: 'Aralık',
        value: `[${start.toFixed(1)}, ${end.toFixed(1)}]`,
        tone: 'neutral',
      },
    ],
    learning: {
      summary: `${getParametricCurveLabel(curveType)} eğrisi üzerinde hareket eden nokta, t parametresi boyunca izlendi.`,
      interpretation: 'Parametrik eğri bir şekli “hareket” üzerinden tanımlar. Aynı anda hem konum hem tangent hem de hız bilgisi görünür hale gelir.',
      warnings: 'Geometrik olarak düzgün görünen bir yol, sabit hızla dolaşılıyor demek değildir; hız vektörü parametreye bağlıdır.',
      tryNext: 'Başka bir eğri ailesine geçip aynı t ilerleyişinin bambaşka geometri ve hız profilleri ürettiğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
