import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

export interface SequenceSeriesParams extends SimulationParamsBase {
  seriesType: string
  terms: number
  ratio: number
  exponent: number
}

export interface SequenceTerm {
  n: number
  value: number
  partialSum: number
}

export interface SequenceSeriesResult extends SimulationResultBase {
  termsData: SequenceTerm[]
  convergenceTarget: number | null
}

function evaluateTerm(params: SequenceSeriesParams, n: number): number {
  switch (params.seriesType) {
    case 'harmonic':
      return 1 / n
    case 'p-series':
      return 1 / n ** params.exponent
    default:
      return params.ratio ** (n - 1)
  }
}

function getSeriesLabel(params: SequenceSeriesParams): string {
  switch (params.seriesType) {
    case 'harmonic':
      return 'Σ 1/n'
    case 'p-series':
      return `Σ 1/n^${params.exponent.toFixed(1)}`
    default:
      return `Σ ${params.ratio.toFixed(2)}^(n-1)`
  }
}

function getConvergenceTarget(params: SequenceSeriesParams): number | null {
  if (params.seriesType === 'geometric' && Math.abs(params.ratio) < 1) {
    return 1 / (1 - params.ratio)
  }

  if (params.seriesType === 'p-series' && params.exponent > 1) {
    return null
  }

  return null
}

function buildTimeline(termsData: SequenceTerm[]): SimulationTimeline {
  return {
    frames: termsData.map((term) => ({
      label: `${term.n}. kısmi toplam`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Geometrik Oran',
      change: 'Geometric seri seçip oranı 0.8 ile 1.1 arasında karşılaştır.',
      expectation: '|r| < 1 iken kısmi toplamlar sabitlenir; sınır aşılınca toplam büyümeye devam eder.',
    },
    {
      title: 'Harmonik Tuzak',
      change: 'Harmonic seriyle 20-30 terimi gözlemle.',
      expectation: 'Terimler küçülse de kısmi toplamlar çok yavaş da olsa artmaya devam eder.',
    },
    {
      title: 'p-Sınırı',
      change: 'p-series için üssü 0.8, 1.0 ve 1.5 olarak değiştir.',
      expectation: 'Yakınsama davranışının kritik eşiğinin p=1 olduğunu sezersin.',
    },
  ]
}

export function deriveSequenceSeriesResult(
  params: SequenceSeriesParams,
): SequenceSeriesResult {
  const termsData: SequenceTerm[] = []
  let partialSum = 0

  for (let n = 1; n <= params.terms; n += 1) {
    const value = evaluateTerm(params, n)
    partialSum += value
    termsData.push({ n, value, partialSum })
  }

  const convergenceTarget = getConvergenceTarget(params)
  const converges =
    (params.seriesType === 'geometric' && Math.abs(params.ratio) < 1) ||
    (params.seriesType === 'p-series' && params.exponent > 1)

  return {
    termsData,
    convergenceTarget,
    metrics: [
      { label: 'Seri', value: getSeriesLabel(params), tone: 'primary' },
      {
        label: 'Son Toplam',
        value: termsData.at(-1)?.partialSum.toFixed(4) ?? '0.0000',
        tone: 'secondary',
      },
      {
        label: 'Davranış',
        value: converges ? 'Yakınsak' : 'Iraksak / belirsiz',
        tone: converges ? 'secondary' : 'warning',
      },
      {
        label: 'Son Terim',
        value: termsData.at(-1)?.value.toFixed(4) ?? '0.0000',
        tone: 'neutral',
      },
    ],
    learning: {
      summary: `${getSeriesLabel(params)} serisinin ilk ${params.terms} terimi üzerinden kısmi toplamlar oluşturuldu.`,
      interpretation:
        params.seriesType === 'geometric'
          ? 'Geometrik seride belirleyici nicelik ortak orandır. |r| < 1 olduğunda her yeni terim küçülerek sabit bir limite katkı yapar.'
          : params.seriesType === 'harmonic'
            ? 'Harmonik seri, terimler sıfıra gitse bile toplamın yine de büyüyebileceğini gösteren klasik karşı örnektir.'
            : 'p-serilerinde eşik p = 1 civarında oluşur; üs büyüdükçe terimler daha hızlı küçüldüğünden toplam daha kolay dengelenir.',
      warnings:
        params.seriesType === 'geometric' && Math.abs(params.ratio) >= 1
          ? 'Geometrik seride oran birim çemberin dışına çıktığında terimler yeterince küçülmez.'
          : 'Terimin sıfıra gitmesi tek başına seri yakınsar demek değildir; kısmi toplam davranışına bakmalısın.',
      tryNext:
        params.seriesType === 'p-series'
          ? 'Üssü 1 civarında oynatıp yakınsaklık eşiğinin ne kadar keskin değiştiğini incele.'
          : 'Seri tipini değiştirip benzer büyüklükte terimlerin çok farklı toplam davranışları üretebildiğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(termsData),
  }
}
