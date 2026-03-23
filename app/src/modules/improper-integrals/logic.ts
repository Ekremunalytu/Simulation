import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  exactImproperIntegral,
  evaluateImproperIntegrand,
  getImproperIntegralLabel,
  improperCutoffSequence,
  partialImproperIntegral,
  sampleFunction,
  type ImproperIntegralId,
  type SamplePoint,
} from '../shared/calculus'

export interface ImproperIntegralsParams extends SimulationParamsBase {
  scenario: string
  exponent: number
}

export interface ImproperIntegralFrame {
  cutoff: number
  partialValue: number
  error: number | null
}

export interface ImproperIntegralsResult extends SimulationResultBase {
  curve: SamplePoint[]
  frames: ImproperIntegralFrame[]
  exactValue: number | null
  classification: 'yakinsak' | 'iraksak'
}

function buildTimeline(frames: ImproperIntegralFrame[], scenario: string): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: scenario === 'inv-sqrt' ? `ε = ${frame.cutoff}` : `cutoff = ${frame.cutoff}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Yakınsak Kuyruk',
      change: 'exp-tail ile p-tail (p=2) senaryolarını karşılaştır.',
      expectation: 'İkisi de sonlu bir limite yaklaşır ama hızları farklı olur.',
    },
    {
      title: 'Eşik Davranışı',
      change: 'p-tail için üssü 0.8 ve 1.5 arasında değiştir.',
      expectation: 'p=1 sınırı civarında yakınsaklık kararı değişir.',
    },
    {
      title: 'Tekillik İncelemesi',
      change: 'inv-sqrt ile inv senaryolarını karşılaştır.',
      expectation: 'Her ikisinde de problemli nokta var gibi görünür; fakat biri toplam alanı sonlu tutarken diğeri tutamaz.',
    },
  ]
}

export function deriveImproperIntegralsResult(
  params: ImproperIntegralsParams,
): ImproperIntegralsResult {
  const scenario = params.scenario as ImproperIntegralId
  const exactValue = exactImproperIntegral(scenario, params.exponent)
  const classification = exactValue === null ? 'iraksak' : 'yakinsak'
  const cutoffs = improperCutoffSequence(scenario)
  const frames = cutoffs.map((cutoff) => {
    const partialValue = partialImproperIntegral(scenario, cutoff, params.exponent)
    return {
      cutoff,
      partialValue,
      error: exactValue === null ? null : Math.abs(partialValue - exactValue),
    }
  })

  const curve =
    scenario === 'inv-sqrt'
      ? sampleFunction((x) => evaluateImproperIntegrand(scenario, Math.max(x, 0.01), params.exponent), 0.01, 1, 160, 20)
      : sampleFunction((x) => evaluateImproperIntegrand(scenario, Math.max(x, 1), params.exponent), 1, 12, 160, 20)

  return {
    curve,
    frames,
    exactValue,
    classification,
    metrics: [
      { label: 'Senaryo', value: getImproperIntegralLabel(scenario), tone: 'primary' },
      {
        label: 'Davranış',
        value: classification === 'yakinsak' ? 'Yakınsak' : 'Iraksak',
        tone: classification === 'yakinsak' ? 'secondary' : 'warning',
      },
      {
        label: 'Son Kısmi Değer',
        value: frames.at(-1)?.partialValue.toFixed(4) ?? '0.0000',
        tone: 'tertiary',
      },
      {
        label: 'Tam Değer',
        value: exactValue === null ? 'Yok' : exactValue.toFixed(4),
        tone: 'neutral',
      },
    ],
    learning: {
      summary: `${getImproperIntegralLabel(scenario)} için kesim değeri büyütülerek kısmi integral davranışı izlendi.`,
      interpretation:
        classification === 'yakinsak'
          ? 'İmproper olması tek başına sorun değildir; asıl kritik soru kısmi integrallerin sonlu bir değere yerleşip yerleşmediğidir.'
          : 'Eğrinin altında kalan alan her adımda büyümeye devam ediyor; tekillik veya sonsuz aralık sonlu toplam üretemiyor.',
      warnings: 'Grafik tek başına bazen yanıltıcıdır. Karar, cutoff ilerledikçe kısmi integralin davranışından verilir.',
      tryNext: classification === 'yakinsak' ? 'Üssü değiştirip yakınsaklık eşiğinin nerede kırıldığını test et.' : 'Yakınsak bir örneğe geçip aynı görsel yapının neden farklı sonuç verdiğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames, scenario),
  }
}
