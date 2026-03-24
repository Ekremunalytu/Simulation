import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { createSeededRandom } from '../shared/random'

export interface LlmDecodingLabParams extends SimulationParamsBase {
  scenario: 'campfire-story' | 'sql-assistant' | 'travel-planner'
  temperature: number
  topK: number
  topP: number
  beamWidth: number
  maxSteps: number
}

interface WeightedToken {
  token: string
  probability: number
}

interface ScenarioDefinition {
  label: string
  prompt: string
  transitions: Record<string, WeightedToken[]>
}

export interface DecodingCandidate {
  token: string
  probability: number
  retained: boolean
}

export interface StrategyStep {
  step: number
  selectedToken: string
  candidates: DecodingCandidate[]
  candidatePoolSize: number
  retainedProbability: number
  cumulativeLogProb: number
}

export interface StrategyTrace {
  strategyId: 'greedy' | 'temperature' | 'top-k' | 'top-p' | 'beam'
  name: string
  generatedTokens: string[]
  finalText: string
  cumulativeLogProb: number
  steps: StrategyStep[]
}

export interface LlmDecodingLabResult extends SimulationResultBase {
  scenarioLabel: string
  prompt: string
  strategies: StrategyTrace[]
  comparisonSeries: Array<Record<string, number>>
  beamAdvantage: number
  averageCandidatePool: number
}

const scenarios: Record<LlmDecodingLabParams['scenario'], ScenarioDefinition> = {
  'campfire-story': {
    label: 'Campfire Story',
    prompt: 'Complete the sentence: "At the edge of the camp,"',
    transitions: {
      __start__: [
        { token: 'The', probability: 0.36 },
        { token: 'A', probability: 0.34 },
        { token: 'Night', probability: 0.18 },
        { token: 'Suddenly', probability: 0.12 },
      ],
      The: [
        { token: 'fire', probability: 0.28 },
        { token: 'wind', probability: 0.24 },
        { token: 'guide', probability: 0.2 },
        { token: 'lantern', probability: 0.16 },
        { token: 'echoes', probability: 0.12 },
      ],
      A: [
        { token: 'traveler', probability: 0.4 },
        { token: 'guide', probability: 0.32 },
        { token: 'signal', probability: 0.18 },
        { token: 'storm', probability: 0.1 },
      ],
      Night: [
        { token: 'settled', probability: 0.46 },
        { token: 'glowed', probability: 0.31 },
        { token: 'opened', probability: 0.23 },
      ],
      Suddenly: [
        { token: 'footsteps', probability: 0.42 },
        { token: 'the', probability: 0.34 },
        { token: 'a', probability: 0.24 },
      ],
      fire: [
        { token: 'dimmed', probability: 0.35 },
        { token: 'crackled', probability: 0.33 },
        { token: 'wandered', probability: 0.19 },
        { token: 'slowly', probability: 0.13 },
      ],
      traveler: [
        { token: 'whispered', probability: 0.58 },
        { token: 'studied', probability: 0.24 },
        { token: 'carried', probability: 0.18 },
      ],
      settled: [
        { token: 'quietly', probability: 0.42 },
        { token: 'around', probability: 0.34 },
        { token: 'nearby', probability: 0.24 },
      ],
      footsteps: [
        { token: 'echoed', probability: 0.44 },
        { token: 'returned', probability: 0.32 },
        { token: 'paused', probability: 0.24 },
      ],
      dimmed: [
        { token: 'quickly', probability: 0.34 },
        { token: 'tonight', probability: 0.29 },
        { token: 'outside', probability: 0.22 },
        { token: 'again', probability: 0.15 },
      ],
      crackled: [
        { token: 'softly', probability: 0.39 },
        { token: 'tonight', probability: 0.33 },
        { token: 'again', probability: 0.28 },
      ],
      whispered: [
        { token: 'carefully', probability: 0.62 },
        { token: 'softly', probability: 0.24 },
        { token: 'back', probability: 0.14 },
      ],
      studied: [
        { token: 'quietly', probability: 0.45 },
        { token: 'carefully', probability: 0.35 },
        { token: 'alone', probability: 0.2 },
      ],
      quietly: [
        { token: 'nearby', probability: 0.38 },
        { token: 'tonight', probability: 0.35 },
        { token: 'alone', probability: 0.27 },
      ],
      echoed: [
        { token: 'nearby', probability: 0.4 },
        { token: 'again', probability: 0.33 },
        { token: 'tonight', probability: 0.27 },
      ],
      __fallback__: [
        { token: 'again', probability: 0.4 },
        { token: 'softly', probability: 0.33 },
        { token: 'nearby', probability: 0.27 },
      ],
    },
  },
  'sql-assistant': {
    label: 'SQL Assistant',
    prompt: 'Continue the answer: "To filter recent orders,"',
    transitions: {
      __start__: [
        { token: 'SELECT', probability: 0.41 },
        { token: 'Use', probability: 0.32 },
        { token: 'Start', probability: 0.15 },
        { token: 'Filter', probability: 0.12 },
      ],
      SELECT: [
        { token: 'customer_id', probability: 0.32 },
        { token: '*', probability: 0.28 },
        { token: 'order_id', probability: 0.22 },
        { token: 'COUNT(*)', probability: 0.18 },
      ],
      Use: [
        { token: 'WHERE', probability: 0.44 },
        { token: 'a', probability: 0.3 },
        { token: 'DATE', probability: 0.26 },
      ],
      Start: [
        { token: 'with', probability: 0.5 },
        { token: 'by', probability: 0.3 },
        { token: 'using', probability: 0.2 },
      ],
      Filter: [
        { token: 'rows', probability: 0.43 },
        { token: 'by', probability: 0.31 },
        { token: 'with', probability: 0.26 },
      ],
      customer_id: [
        { token: 'FROM', probability: 0.48 },
        { token: 'WHERE', probability: 0.29 },
        { token: 'AS', probability: 0.23 },
      ],
      '*': [
        { token: 'FROM', probability: 0.53 },
        { token: 'WHERE', probability: 0.27 },
        { token: 'LIMIT', probability: 0.2 },
      ],
      WHERE: [
        { token: 'order_date', probability: 0.55 },
        { token: 'created_at', probability: 0.25 },
        { token: 'status', probability: 0.2 },
      ],
      a: [
        { token: 'WHERE', probability: 0.46 },
        { token: 'date', probability: 0.34 },
        { token: 'filter', probability: 0.2 },
      ],
      FROM: [
        { token: 'orders', probability: 0.62 },
        { token: 'sales', probability: 0.23 },
        { token: 'transactions', probability: 0.15 },
      ],
      order_date: [
        { token: '>=', probability: 0.58 },
        { token: 'BETWEEN', probability: 0.26 },
        { token: 'IS', probability: 0.16 },
      ],
      __fallback__: [
        { token: 'orders', probability: 0.4 },
        { token: 'WHERE', probability: 0.32 },
        { token: 'recent', probability: 0.28 },
      ],
    },
  },
  'travel-planner': {
    label: 'Travel Planner',
    prompt: 'Continue the suggestion: "For a two-day trip,"',
    transitions: {
      __start__: [
        { token: 'start', probability: 0.35 },
        { token: 'visit', probability: 0.28 },
        { token: 'book', probability: 0.2 },
        { token: 'take', probability: 0.17 },
      ],
      start: [
        { token: 'early', probability: 0.36 },
        { token: 'downtown', probability: 0.3 },
        { token: 'with', probability: 0.2 },
        { token: 'nearby', probability: 0.14 },
      ],
      visit: [
        { token: 'the', probability: 0.42 },
        { token: 'local', probability: 0.33 },
        { token: 'a', probability: 0.25 },
      ],
      book: [
        { token: 'tickets', probability: 0.46 },
        { token: 'a', probability: 0.31 },
        { token: 'museum', probability: 0.23 },
      ],
      take: [
        { token: 'the', probability: 0.43 },
        { token: 'an', probability: 0.29 },
        { token: 'a', probability: 0.28 },
      ],
      early: [
        { token: 'train', probability: 0.39 },
        { token: 'breakfast', probability: 0.34 },
        { token: 'walk', probability: 0.27 },
      ],
      downtown: [
        { token: 'tour', probability: 0.41 },
        { token: 'museum', probability: 0.32 },
        { token: 'cafe', probability: 0.27 },
      ],
      the: [
        { token: 'museum', probability: 0.37 },
        { token: 'riverfront', probability: 0.33 },
        { token: 'market', probability: 0.3 },
      ],
      tickets: [
        { token: 'online', probability: 0.49 },
        { token: 'early', probability: 0.28 },
        { token: 'today', probability: 0.23 },
      ],
      museum: [
        { token: 'first', probability: 0.42 },
        { token: 'afterwards', probability: 0.31 },
        { token: 'nearby', probability: 0.27 },
      ],
      __fallback__: [
        { token: 'nearby', probability: 0.37 },
        { token: 'first', probability: 0.33 },
        { token: 'later', probability: 0.3 },
      ],
    },
  },
}

function getDistribution(scenario: ScenarioDefinition, previousToken: string | null) {
  return scenario.transitions[previousToken ?? '__start__'] ?? scenario.transitions.__fallback__ ?? []
}

function normalize(items: WeightedToken[]) {
  const total = items.reduce((sum, item) => sum + item.probability, 0)
  return items.map((item) => ({
    token: item.token,
    probability: item.probability / total,
  }))
}

function applyTemperature(items: WeightedToken[], temperature: number) {
  const adjusted = items.map((item) => ({
    token: item.token,
    probability: Math.pow(item.probability, 1 / temperature),
  }))

  return normalize(adjusted).sort((left, right) => right.probability - left.probability)
}

function buildCandidates(
  distribution: WeightedToken[],
  keptTokens: Set<string>,
): DecodingCandidate[] {
  return distribution.map((item) => ({
    token: item.token,
    probability: Number(item.probability.toFixed(4)),
    retained: keptTokens.has(item.token),
  }))
}

function sampleFromDistribution(distribution: WeightedToken[], seed: number) {
  const random = createSeededRandom(seed)
  const pick = random()
  let cumulative = 0

  for (const item of distribution) {
    cumulative += item.probability
    if (pick <= cumulative) {
      return item
    }
  }

  return distribution.at(-1) as WeightedToken
}

function filterTopK(distribution: WeightedToken[], topK: number) {
  return normalize(distribution.slice(0, topK))
}

function filterTopP(distribution: WeightedToken[], topP: number) {
  const kept: WeightedToken[] = []
  let cumulative = 0

  for (const item of distribution) {
    kept.push(item)
    cumulative += item.probability
    if (cumulative >= topP) {
      break
    }
  }

  return normalize(kept)
}

function buildStep(
  step: number,
  selected: WeightedToken,
  filtered: WeightedToken[],
  adjustedDistribution: WeightedToken[],
  cumulativeLogProb: number,
): StrategyStep {
  const keptTokens = new Set(filtered.map((item) => item.token))
  const retainedProbability = adjustedDistribution.reduce(
    (sum, item) => sum + (keptTokens.has(item.token) ? item.probability : 0),
    0,
  )

  return {
    step,
    selectedToken: selected.token,
    candidates: buildCandidates(adjustedDistribution, keptTokens),
    candidatePoolSize: filtered.length,
    retainedProbability: Number(retainedProbability.toFixed(4)),
    cumulativeLogProb: Number(cumulativeLogProb.toFixed(4)),
  }
}

function getProbabilityForToken(distribution: WeightedToken[], token: string) {
  return distribution.find((item) => item.token === token)?.probability ?? 0
}

function generateGreedyTrace(params: LlmDecodingLabParams, scenario: ScenarioDefinition): StrategyTrace {
  const generatedTokens: string[] = []
  const steps: StrategyStep[] = []
  let cumulativeLogProb = 0

  for (let step = 1; step <= params.maxSteps; step += 1) {
    const distribution = applyTemperature(getDistribution(scenario, generatedTokens.at(-1) ?? null), params.temperature)
    const selected = distribution[0] as WeightedToken
    cumulativeLogProb += Math.log(selected.probability)
    steps.push(buildStep(step, selected, [selected], distribution, cumulativeLogProb))
    generatedTokens.push(selected.token)
  }

  return {
    strategyId: 'greedy',
    name: 'Greedy',
    generatedTokens,
    finalText: generatedTokens.join(' '),
    cumulativeLogProb: Number(cumulativeLogProb.toFixed(4)),
    steps,
  }
}

function generateTemperatureTrace(params: LlmDecodingLabParams, scenario: ScenarioDefinition): StrategyTrace {
  const generatedTokens: string[] = []
  const steps: StrategyStep[] = []
  let cumulativeLogProb = 0

  for (let step = 1; step <= params.maxSteps; step += 1) {
    const distribution = applyTemperature(getDistribution(scenario, generatedTokens.at(-1) ?? null), params.temperature)
    const selected = sampleFromDistribution(distribution, 3000 + step * 37)
    cumulativeLogProb += Math.log(selected.probability)
    steps.push(buildStep(step, selected, distribution, distribution, cumulativeLogProb))
    generatedTokens.push(selected.token)
  }

  return {
    strategyId: 'temperature',
    name: 'Temperature',
    generatedTokens,
    finalText: generatedTokens.join(' '),
    cumulativeLogProb: Number(cumulativeLogProb.toFixed(4)),
    steps,
  }
}

function generateFilteredTrace(
  params: LlmDecodingLabParams,
  scenario: ScenarioDefinition,
  strategyId: 'top-k' | 'top-p',
): StrategyTrace {
  const generatedTokens: string[] = []
  const steps: StrategyStep[] = []
  let cumulativeLogProb = 0

  for (let step = 1; step <= params.maxSteps; step += 1) {
    const distribution = applyTemperature(getDistribution(scenario, generatedTokens.at(-1) ?? null), params.temperature)
    const filtered =
      strategyId === 'top-k'
        ? filterTopK(distribution, Math.min(params.topK, distribution.length))
        : filterTopP(distribution, params.topP)
    const selected = sampleFromDistribution(filtered, (strategyId === 'top-k' ? 5000 : 7000) + step * 41)
    cumulativeLogProb += Math.log(getProbabilityForToken(distribution, selected.token))
    steps.push(buildStep(step, selected, filtered, distribution, cumulativeLogProb))
    generatedTokens.push(selected.token)
  }

  return {
    strategyId,
    name: strategyId === 'top-k' ? 'Top-k' : 'Top-p',
    generatedTokens,
    finalText: generatedTokens.join(' '),
    cumulativeLogProb: Number(cumulativeLogProb.toFixed(4)),
    steps,
  }
}

interface BeamState {
  tokens: string[]
  cumulativeLogProb: number
}

function generateBeamTrace(params: LlmDecodingLabParams, scenario: ScenarioDefinition): StrategyTrace {
  let beams: BeamState[] = [{ tokens: [], cumulativeLogProb: 0 }]

  for (let step = 1; step <= params.maxSteps; step += 1) {
    const next: BeamState[] = []

    for (const beam of beams) {
      const distribution = applyTemperature(getDistribution(scenario, beam.tokens.at(-1) ?? null), params.temperature)
      distribution.slice(0, params.beamWidth).forEach((candidate) => {
        next.push({
          tokens: [...beam.tokens, candidate.token],
          cumulativeLogProb: beam.cumulativeLogProb + Math.log(candidate.probability),
        })
      })
    }

    beams = next
      .sort((left, right) => right.cumulativeLogProb - left.cumulativeLogProb)
      .slice(0, params.beamWidth)
  }

  const bestBeam = beams[0] as BeamState
  const steps: StrategyStep[] = []
  let cumulativeLogProb = 0

  bestBeam.tokens.forEach((token, index) => {
    const distribution = applyTemperature(getDistribution(scenario, bestBeam.tokens[index - 1] ?? null), params.temperature)
    const selected = distribution.find((item) => item.token === token) as WeightedToken
    const filtered = distribution.slice(0, params.beamWidth)
    cumulativeLogProb += Math.log(selected.probability)
    steps.push(buildStep(index + 1, selected, filtered, distribution, cumulativeLogProb))
  })

  return {
    strategyId: 'beam',
    name: 'Beam Search',
    generatedTokens: bestBeam.tokens,
    finalText: bestBeam.tokens.join(' '),
    cumulativeLogProb: Number(bestBeam.cumulativeLogProb.toFixed(4)),
    steps,
  }
}

function buildTimeline(stepCount: number): SimulationTimeline {
  return {
    frames: Array.from({ length: stepCount }, (_, index) => ({
      label: `${index + 1}. token`,
    })),
  }
}

function buildComparisonSeries(strategies: StrategyTrace[]) {
  const stepCount = Math.max(...strategies.map((strategy) => strategy.steps.length), 0)

  return Array.from({ length: stepCount }, (_, index) => {
    const row: Record<string, number> = { step: index + 1 }
    strategies.forEach((strategy) => {
      row[strategy.strategyId] = strategy.steps[index]?.cumulativeLogProb ?? row[strategy.strategyId] ?? 0
    })
    return row
  })
}

function buildExperiments(params: LlmDecodingLabParams): GuidedExperiment[] {
  return [
    {
      title: 'Top-k Daralt',
      change: 'Top-k değerini 1 veya 2 seviyesine indir.',
      expectation:
        'Top-k örnekleyicisi greedy davranışına yaklaşır; candidate pool küçüldükçe daha güvenli ama daha az çeşitli dizi seçilir.',
    },
    {
      title: 'Top-p Yükselt',
      change: 'Top-p değerini 0.95 civarına çıkar.',
      expectation:
        'Retained probability artar ve nucleus filtresi daha fazla adayı içerir; seçilen tokenler temperature stratejisine yaklaşır.',
    },
    {
      title: 'Beam Width Genişlet',
      change: `Beam width değerini ${Math.min(params.beamWidth + 1, 5)} seviyesine çıkar.`,
      expectation:
        'Beam search yerel optimumdan kaçma şansını artırır; özellikle ilk adımda ikinci en iyi token daha güçlü bir devam yolu açıyorsa öne geçebilir.',
    },
  ]
}

export function deriveLlmDecodingLabResult(params: LlmDecodingLabParams): LlmDecodingLabResult {
  const scenario = scenarios[params.scenario]
  const strategies = [
    generateGreedyTrace(params, scenario),
    generateTemperatureTrace(params, scenario),
    generateFilteredTrace(params, scenario, 'top-k'),
    generateFilteredTrace(params, scenario, 'top-p'),
    generateBeamTrace(params, scenario),
  ]
  const greedy = strategies.find((strategy) => strategy.strategyId === 'greedy') as StrategyTrace
  const beam = strategies.find((strategy) => strategy.strategyId === 'beam') as StrategyTrace
  const beamAdvantage = beam.cumulativeLogProb - greedy.cumulativeLogProb
  const averageCandidatePool =
    strategies.reduce(
      (sum, strategy) => sum + strategy.steps.reduce((inner, step) => inner + step.candidatePoolSize, 0),
      0,
    ) /
    Math.max(
      strategies.reduce((sum, strategy) => sum + strategy.steps.length, 0),
      1,
    )

  return {
    scenarioLabel: scenario.label,
    prompt: scenario.prompt,
    strategies,
    comparisonSeries: buildComparisonSeries(strategies),
    beamAdvantage,
    averageCandidatePool,
    learning: {
      summary:
        `${scenario.label} promptu için beş farklı decoding stratejisi ${params.maxSteps} token boyunca karşılaştırıldı. Beam Search ile Greedy arasındaki log-olasılık farkı ${beamAdvantage.toFixed(2)} oldu.`,
      interpretation:
        params.temperature > 1
          ? 'Temperature yüksek olduğunda dağılım düzleşir; örnekleme stratejileri daha fazla yan yol dener.'
          : 'Temperature düşük olduğunda dağılım sivrileşir; örnekleme stratejileri bile daha deterministik davranır.',
      warnings:
        params.topK <= 2
          ? 'Çok küçük top-k, modeli gereğinden fazla daraltıp farklı ama makul tokenleri tamamen dışarıda bırakabilir.'
          : 'Log-olasılığı yüksek olan cevap her zaman pedagojik ya da yaratıcı olarak daha iyi olmayabilir.',
      tryNext:
        'Bu modülden sonra Bias & Fairness Explorer ile üretim kalitesinden karar kalitesine geçip threshold seçimlerinin etik etkisini incele.',
    },
    metrics: [
      {
        label: 'Beam - Greedy',
        value: beamAdvantage.toFixed(2),
        tone: beamAdvantage >= 0 ? 'primary' : 'warning',
      },
      {
        label: 'Ort Havuz',
        value: averageCandidatePool.toFixed(2),
        tone: 'secondary',
      },
      {
        label: 'Top-k',
        value: params.topK.toString(),
        tone: 'neutral',
      },
      {
        label: 'Top-p',
        value: params.topP.toFixed(2),
        tone: 'tertiary',
      },
    ],
    experiments: buildExperiments(params),
    timeline: buildTimeline(params.maxSteps),
  }
}
