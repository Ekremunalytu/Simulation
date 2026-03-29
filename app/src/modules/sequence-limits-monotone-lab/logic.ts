import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

type ScenarioId = 'squeeze' | 'recursive' | 'monotone'

export interface SequenceLimitsMonotoneLabParams extends SimulationParamsBase {
  scenario: ScenarioId
  parameter: number
  terms: number
}

export interface SequenceFrame {
  n: number
  value: number
  lower: number | null
  upper: number | null
  gap: number | null
}

export interface SequenceLimitsMonotoneLabResult extends SimulationResultBase {
  scenarioLabel: string
  frames: SequenceFrame[]
  targetLimit: number
  monotoneLabel: string
  boundedLabel: string
}

function buildTimeline(frames: SequenceFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.n}. terim`,
    })),
  }
}

function buildExperiments(scenario: ScenarioId): GuidedExperiment[] {
  if (scenario === 'recursive') {
    return [
      {
        title: 'Sabit Nokta Takibi',
        change: 'Parametreyi artır.',
        expectation:
          'Recursive güncellemenin hedeflediği sabit nokta da değişir; dizi yeni limite doğru yeniden kıvrılır.',
      },
      {
        title: 'Başlangıç Etkisi',
        change: 'Terim sayısını artır.',
        expectation:
          'İlk adımlar sert olsa da sabit nokta çevresinde farkların söndüğünü daha net görürsün.',
      },
    ]
  }

  if (scenario === 'monotone') {
    return [
      {
        title: 'Üst Sınırı Koru',
        change: 'Parametreyi 0.8 civarına çıkar.',
        expectation:
          'Dizi yine üstten 1 ile sınırlı kalır ama limite daha yavaş yaklaşır.',
      },
    ]
  }

  return [
    {
      title: 'Envelope Daralması',
      change: 'Terim sayısını artır.',
      expectation:
        'Alt ve üst sınır arasındaki fark küçüldükçe ortadaki dizinin 0 etrafında hapsolduğunu daha net okursun.',
    },
  ]
}

export function deriveSequenceLimitsMonotoneLabResult(
  params: SequenceLimitsMonotoneLabParams,
): SequenceLimitsMonotoneLabResult {
  const frames: SequenceFrame[] = []
  let scenarioLabel = 'Squeeze Theorem'
  let targetLimit = 0
  let monotoneLabel = 'Değişken'
  let boundedLabel = 'İki taraftan sınırlı'

  if (params.scenario === 'recursive') {
    scenarioLabel = 'Recursive Sequence'
    targetLimit = Math.sqrt(Math.max(0.4, params.parameter))
    monotoneLabel = 'Azalan'
    boundedLabel = `Alttan ${targetLimit.toFixed(3)} ile sınırlı`

    let current = targetLimit + 1.6
    for (let n = 1; n <= params.terms; n += 1) {
      frames.push({
        n,
        value: current,
        lower: targetLimit,
        upper: current,
        gap: Math.abs(current - targetLimit),
      })
      current = 0.5 * (current + params.parameter / current)
    }
  } else if (params.scenario === 'monotone') {
    scenarioLabel = 'Bounded Monotone Sequence'
    const ratio = Math.max(0.2, Math.min(0.92, params.parameter))
    targetLimit = 1
    monotoneLabel = 'Artan'
    boundedLabel = 'Üstten 1 ile sınırlı'

    for (let n = 1; n <= params.terms; n += 1) {
      const value = 1 - ratio ** n
      frames.push({
        n,
        value,
        lower: 0,
        upper: 1,
        gap: 1 - value,
      })
    }
  } else {
    for (let n = 1; n <= params.terms; n += 1) {
      const lower = -1 / (params.parameter * n)
      const upper = 1 / (params.parameter * n)
      const value = Math.sin(n) / (params.parameter * n)
      frames.push({
        n,
        value,
        lower,
        upper,
        gap: upper - lower,
      })
    }
  }

  const lastFrame = frames.at(-1) ?? frames[0]

  return {
    scenarioLabel,
    frames,
    targetLimit,
    monotoneLabel,
    boundedLabel,
    metrics: [
      { label: 'Senaryo', value: scenarioLabel, tone: 'primary' },
      { label: 'Hedef Limit', value: targetLimit.toFixed(3), tone: 'secondary' },
      { label: 'Monotonluk', value: monotoneLabel, tone: 'tertiary' },
      {
        label: 'Son Gap',
        value: (lastFrame?.gap ?? 0).toFixed(4),
        tone: (lastFrame?.gap ?? 1) < 0.12 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `${scenarioLabel} senaryosu ilk ${params.terms} terim uzerinden incelendi.`,
      interpretation:
        params.scenario === 'squeeze'
          ? 'Dizinin kendisini tam çözmeden bile, iki sınır arasında kalıyorsa limitini bu sınırların ortak davranışı belirler.'
          : params.scenario === 'recursive'
            ? 'Recursive tanımlarda limit çoğu zaman sabit nokta denklemiyle yakalanır; her iterasyon önceki hatayı küçülten bir düzeltme gibi davranır.'
            : 'Monotonluk ve sınırlılık birlikte geldiğinde dizinin nereye kaçabileceği kalmaz; bu nedenle yakınsama yapısal olarak zorlanır.',
      warnings:
        params.scenario === 'squeeze'
          ? 'Sadece tek taraftan küçülen bir envelope yeterli değildir; alt ve üst sınırın aynı limite gitmesi gerekir.'
          : 'İlk birkaç terime bakarak global karar verme; yakınsama çoğu zaman uzun vadeli davranıştan okunur.',
      tryNext:
        params.scenario === 'squeeze'
          ? 'Recursive veya monotone senaryosuna geçip bu kez yakınsamanın sınırlar yerine yapı koşullarıyla nasıl geldiğini karşılaştır.'
          : 'Farklı senaryolar arasında geçiş yapıp limit kanıtının hangi nicelik üzerinden kurulduğunu kıyasla.',
    },
    experiments: buildExperiments(params.scenario),
    timeline: buildTimeline(frames),
  }
}
