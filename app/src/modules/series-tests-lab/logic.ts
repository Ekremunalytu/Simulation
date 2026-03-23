import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  comparisonReferenceTerm,
  evaluateSeriesTerm,
  getSeriesScenarioLabel,
  ratioTestValue,
  seriesExpectedClassification,
  type SeriesTestId,
} from '../shared/calculus'

export interface SeriesTestsLabParams extends SimulationParamsBase {
  testType: string
  parameter: number
  terms: number
}

export interface SeriesFrame {
  n: number
  term: number
  partialSum: number
  evidence: number
}

export interface SeriesTestsLabResult extends SimulationResultBase {
  frames: SeriesFrame[]
  classification: 'yakinsak' | 'iraksak'
}

function buildTimeline(frames: SeriesFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.n}. terim`,
    })),
  }
}

function buildEvidence(testType: SeriesTestId, n: number, parameter: number): number {
  switch (testType) {
    case 'ratio':
      return ratioTestValue(n, parameter)
    case 'comparison':
      return evaluateSeriesTerm(testType, n, parameter) / comparisonReferenceTerm(n)
    case 'alternating':
      return Math.abs(evaluateSeriesTerm(testType, n, parameter))
    default:
      return Math.abs(evaluateSeriesTerm(testType, n, parameter))
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'p Eşiği',
      change: 'p-series için parameter değerini 0.8 ve 1.4 arasında değiştir.',
      expectation: 'Kararın p=1 civarında değiştiğini sayısal akıştan görebilirsin.',
    },
    {
      title: 'Geometric Oran',
      change: 'Geometric seride oranı 0.6 ile 1.1 arasında karşılaştır.',
      expectation: '|r| < 1 koşulunun kısmi toplam davranışını doğrudan etkilediğini görürsün.',
    },
    {
      title: 'Test Dilini Oku',
      change: 'Ratio ve comparison testlerinde evidence kartını takip et.',
      expectation: 'Karar yalnızca toplama değil, seçilen test göstergesinin limit davranışına dayanır.',
    },
  ]
}

export function deriveSeriesTestsLabResult(
  params: SeriesTestsLabParams,
): SeriesTestsLabResult {
  const testType = params.testType as SeriesTestId
  const classification = seriesExpectedClassification(testType, params.parameter)
  const frames: SeriesFrame[] = []
  let partialSum = 0

  for (let n = 1; n <= params.terms; n += 1) {
    const term = evaluateSeriesTerm(testType, n, params.parameter)
    partialSum += term
    frames.push({
      n,
      term,
      partialSum,
      evidence: buildEvidence(testType, n, params.parameter),
    })
  }

  return {
    frames,
    classification,
    metrics: [
      { label: 'Test', value: getSeriesScenarioLabel(testType), tone: 'primary' },
      {
        label: 'Karar',
        value: classification === 'yakinsak' ? 'Yakınsak' : 'Iraksak',
        tone: classification === 'yakinsak' ? 'secondary' : 'warning',
      },
      {
        label: 'Son Toplam',
        value: frames.at(-1)?.partialSum.toFixed(4) ?? '0.0000',
        tone: 'tertiary',
      },
      {
        label: 'Son Gösterge',
        value: frames.at(-1)?.evidence.toFixed(4) ?? '0.0000',
        tone: 'neutral',
      },
    ],
    learning: {
      summary: `${getSeriesScenarioLabel(testType)} senaryosu ilk ${params.terms} terim üzerinden test edildi.`,
      interpretation: 'Bu modül, seri testlerini ayrı bir ezber listesi değil, serinin ürettiği sayısal kanıtın farklı okunma biçimleri olarak göstermeyi amaçlar.',
      warnings: 'Aynı kısmi toplam görünümü her zaman aynı testi çağırmaz; karar çoğu zaman terim yapısına ve seçilen karşılaştırma niceliğine bağlıdır.',
      tryNext: 'Başka bir test ailesine geçip “kanıt” kartının hangi niceliği taşıdığını karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
