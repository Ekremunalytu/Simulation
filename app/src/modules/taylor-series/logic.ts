import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  evaluateAnalysisFunction,
  evaluateTaylorPolynomial,
  getAnalysisFunctionLabel,
  round,
  sampleRange,
  type AnalysisFunctionId,
} from '../shared/calculus'

export interface TaylorSeriesParams extends SimulationParamsBase {
  functionType: string
  degree: number
  focusX: number
}

export interface TaylorFrame {
  degree: number
  approximationAtFocus: number
  actualAtFocus: number
  errorAtFocus: number
  curve: Array<{ x: number; actual: number; approximation: number }>
}

export interface TaylorSeriesResult extends SimulationResultBase {
  frames: TaylorFrame[]
  errorSeries: Array<{ degree: number; error: number }>
}

function buildTimeline(frames: TaylorFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.degree}. derece`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Merkez Yakını',
      change: 'focusX değerini 0 çevresinde tutup dereceyi artır.',
      expectation: 'Maclaurin polinomu merkez yakınında çok hızlı iyileşir.',
    },
    {
      title: 'Merkezden Uzaklaş',
      change: 'focusX değerini 2 civarına çek.',
      expectation: 'Aynı derece, merkezden uzak noktalarda daha büyük hata bırakır.',
    },
    {
      title: 'Fonksiyon Karşılaştır',
      change: 'Sinüs ve üstel fonksiyon arasında geçiş yap.',
      expectation: 'Taylor katsayılarının yapısı değişse de polinom yaklaşımı fikri aynı kalır.',
    },
  ]
}

export function deriveTaylorSeriesResult(
  params: TaylorSeriesParams,
): TaylorSeriesResult {
  const functionType = params.functionType as AnalysisFunctionId
  const xValues = sampleRange(-3, 3, 140)
  const frames: TaylorFrame[] = []

  for (let degree = 0; degree <= params.degree; degree += 1) {
    const actualAtFocus = evaluateAnalysisFunction(functionType, params.focusX)
    const approximationAtFocus = evaluateTaylorPolynomial(functionType, degree, params.focusX)

    frames.push({
      degree,
      actualAtFocus,
      approximationAtFocus,
      errorAtFocus: Math.abs(actualAtFocus - approximationAtFocus),
      curve: xValues.map((x) => ({
        x,
        actual: evaluateAnalysisFunction(functionType, x),
        approximation: evaluateTaylorPolynomial(functionType, degree, x),
      })),
    })
  }

  return {
    frames,
    errorSeries: frames.map((frame) => ({
      degree: frame.degree,
      error: round(frame.errorAtFocus, 6),
    })),
    metrics: [
      {
        label: 'Fonksiyon',
        value: getAnalysisFunctionLabel(functionType).replace('f(x) = ', ''),
        tone: 'primary',
      },
      { label: 'Maks Derece', value: String(params.degree), tone: 'secondary' },
      {
        label: 'Odak Hatası',
        value: frames.at(-1)?.errorAtFocus.toFixed(6) ?? '0.000000',
        tone: (frames.at(-1)?.errorAtFocus ?? 1) < 0.05 ? 'secondary' : 'warning',
      },
      { label: 'Odak Noktası', value: params.focusX.toFixed(2), tone: 'neutral' },
    ],
    learning: {
      summary: `${getAnalysisFunctionLabel(functionType)} fonksiyonu, x = 0 merkezli Maclaurin polinomlarıyla yaklaşıklandı.`,
      interpretation:
        params.focusX === 0
          ? 'Merkez noktada düşük dereceler bile şaşırtıcı biçimde iyi çalışır çünkü seri tam o noktadaki türev bilgisinden doğar.'
          : 'Merkezden uzaklaşıldıkça aynı dereceli polinomun hatası büyür; Taylor yaklaşımı yerel bilgiyi küresel alana taşımaya çalışır.',
      warnings:
        params.degree < 3
          ? 'Düşük dereceli polinomlar genel şekli yakalasa da uzak noktalarda ciddi sapma bırakabilir.'
          : 'Derece arttırmak genelde iyileştirir ama yakınsama bölgesini ve merkeze olan uzaklığı her zaman dikkate almak gerekir.',
      tryNext:
        frames.at(-1) && frames.at(-1)!.errorAtFocus < 0.01
          ? 'Şimdi focusX değerini merkezden uzaklaştır ve aynı derecenin nerede bozulduğunu incele.'
          : 'Dereceyi artırıp hata eğrisinin nasıl küçüldüğünü karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
