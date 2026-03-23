import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  exactArcLength,
  getArcLengthCurveLabel,
  numericArcLength,
  sampleArcLengthCurve,
  type ArcLengthCurveId,
} from '../shared/calculus'

export interface ArcLengthParams extends SimulationParamsBase {
  curveType: string
  segments: number
}

export interface ArcLengthFrame {
  segmentCount: number
  polyline: Array<{ u: number; x: number; y: number }>
  approximateLength: number
  error: number
}

export interface ArcLengthResult extends SimulationResultBase {
  curve: Array<{ u: number; x: number; y: number }>
  frames: ArcLengthFrame[]
  exactLength: number
}

function buildTimeline(frames: ArcLengthFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.segmentCount} parça`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Parça Sayısını Artır',
      change: 'Segments değerini yükseltip animasyonu tekrar oynat.',
      expectation: 'Kırık çizgi gerçek eğriyi daha iyi takip eder ve toplam uzunluk stabilize olur.',
    },
    {
      title: 'Eğri Karşılaştır',
      change: 'Circle, parabola ve sine arasında geçiş yap.',
      expectation: 'Benzer aralık boylarına rağmen eğriliğin uzunluğu nasıl değiştirdiğini görürsün.',
    },
    {
      title: 'Doğruya Yaklaşım',
      change: 'Az segment ile çok segment sonucunu karşılaştır.',
      expectation: 'Segment sayısı az olduğunda eğrinin uzunluğu sistematik olarak eksik tahmin edilir.',
    },
  ]
}

export function deriveArcLengthResult(params: ArcLengthParams): ArcLengthResult {
  const curveType = params.curveType as ArcLengthCurveId
  const curve = sampleArcLengthCurve(curveType, 180)
  const exactLength = exactArcLength(curveType)
  const frames: ArcLengthFrame[] = []

  for (let segmentCount = 2; segmentCount <= params.segments; segmentCount += 1) {
    const polyline = sampleArcLengthCurve(curveType, segmentCount)
    const approximateLength = numericArcLength(polyline)
    frames.push({
      segmentCount,
      polyline,
      approximateLength,
      error: Math.abs(approximateLength - exactLength),
    })
  }

  return {
    curve,
    frames,
    exactLength,
    metrics: [
      { label: 'Eğri', value: getArcLengthCurveLabel(curveType), tone: 'primary' },
      { label: 'Tam Uzunluk', value: exactLength.toFixed(4), tone: 'secondary' },
      {
        label: 'Son Yaklaşım',
        value: frames.at(-1)?.approximateLength.toFixed(4) ?? '0.0000',
        tone: 'tertiary',
      },
      {
        label: 'Son Hata',
        value: frames.at(-1)?.error.toFixed(4) ?? '0.0000',
        tone: (frames.at(-1)?.error ?? 1) < 0.05 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `${getArcLengthCurveLabel(curveType)} eğrisi doğrusal segmentlere bölünerek yay uzunluğu yaklaşıklandı.`,
      interpretation: 'Yay uzunluğu, küçük doğrusal parçaların limitidir. Eğriyi ne kadar ince bölersen kırık çizgi o kadar iyi temsil eder.',
      warnings: 'Sadece x aralığına bakmak eğrinin uzunluğunu vermez; yükselip alçalan yapı uzunluğu belirgin biçimde artırabilir.',
      tryNext: 'Başka bir eğriye geç ve benzer genişlikteki aralıkların neden farklı toplam uzunluk verdiğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
