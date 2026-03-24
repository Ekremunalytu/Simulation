import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

export type KnowledgeRepresentationStrategy = 'forward' | 'backward'
export type KnowledgeRepresentationGoal =
  | 'search'
  | 'supervised-learning'
  | 'reinforcement-learning'
  | 'symbolic-ai'
  | 'generative-ai'

export interface KnowledgeRepresentationParams extends SimulationParamsBase {
  strategy: KnowledgeRepresentationStrategy
  goal: KnowledgeRepresentationGoal
  labelledDataAvailable: boolean
  rewardSignalAvailable: boolean
  stateTransitionsKnown: boolean
  explanationRequired: boolean
  contentGenerationNeeded: boolean
  pathCostRelevant: boolean
  maxSteps: number
}

type RepresentationLayerId = 'observed' | 'derived' | 'methods'

type EventType = 'start' | 'rule-fired' | 'concept-derived' | 'goal-reached' | 'failure'

interface FactDefinition {
  id: string
  label: string
  description: string
  layer: RepresentationLayerId
}

export interface KnowledgeRule {
  id: string
  conditions: string[]
  conclusion: string
  explanation: string
}

export interface InferenceEvent {
  id: string
  type: EventType
  message: string
  focus: string
  facts: string[]
  ruleId?: string
  unmetFacts?: string[]
}

export interface BlockedRule {
  ruleId: string
  conclusion: string
  unmetFacts: string[]
  explanation: string
}

export interface RepresentationLayer {
  id: RepresentationLayerId
  title: string
  nodes: FactDefinition[]
}

export interface KnowledgeRepresentationResult extends SimulationResultBase {
  initialFacts: string[]
  derivedFacts: string[]
  rules: KnowledgeRule[]
  events: InferenceEvent[]
  activeGoal: KnowledgeRepresentationGoal
  goalReached: boolean
  proofChain: string[]
  blockedRules: BlockedRule[]
  representationLayers: RepresentationLayer[]
  strategyLabel: string
  inferenceDepth: number
}

const factDefinitions: FactDefinition[] = [
  {
    id: 'labelled-data-available',
    label: 'Labelled Data',
    description: 'Örnekler doğru cevap etiketiyle birlikte geliyor.',
    layer: 'observed',
  },
  {
    id: 'reward-signal-available',
    label: 'Reward Signal',
    description: 'Sistem deneme yaptıktan sonra başarıyı ölçen bir ödül alıyor.',
    layer: 'observed',
  },
  {
    id: 'state-transitions-known',
    label: 'State Transitions',
    description: 'Durumlar ve olası geçişler açık biçimde tanımlanabiliyor.',
    layer: 'observed',
  },
  {
    id: 'explanation-required',
    label: 'Explanation Required',
    description: 'Çözümün nedenini açık kural veya sembol düzeyinde anlatmak gerekiyor.',
    layer: 'observed',
  },
  {
    id: 'content-generation-needed',
    label: 'Content Generation',
    description: 'Sistem yeni metin, cevap veya içerik üretmeli.',
    layer: 'observed',
  },
  {
    id: 'path-cost-relevant',
    label: 'Path Cost Matters',
    description: 'Adımların maliyeti, yol uzunluğu veya arama bütçesi kritik.',
    layer: 'observed',
  },
  {
    id: 'pattern-learning-possible',
    label: 'Pattern Learning Possible',
    description: 'Etiketli örnekler üzerinden örüntü öğrenimi yapılabilir.',
    layer: 'derived',
  },
  {
    id: 'trial-feedback-available',
    label: 'Trial Feedback Available',
    description: 'Ajan dene-gör döngüsünden öğrenebilir.',
    layer: 'derived',
  },
  {
    id: 'symbolic-structure-available',
    label: 'Symbolic Structure',
    description: 'Kurallar ve açıklanabilir sembolik yapı kurulabilir.',
    layer: 'derived',
  },
  {
    id: 'search-space-defined',
    label: 'Search Space Defined',
    description: 'Açık durum uzayı ve yol maliyeti ile arama yapılabilir.',
    layer: 'derived',
  },
  {
    id: 'generation-objective-present',
    label: 'Generation Objective',
    description: 'Görev doğrudan üretim hedefi taşıyor.',
    layer: 'derived',
  },
  {
    id: 'supervised-learning',
    label: 'Supervised Learning',
    description: 'Etiketli örneklerden tahmin modeli öğrenme yaklaşımı.',
    layer: 'methods',
  },
  {
    id: 'reinforcement-learning',
    label: 'Reinforcement Learning',
    description: 'Ödül sinyali ile politika geliştiren yaklaşım.',
    layer: 'methods',
  },
  {
    id: 'symbolic-ai',
    label: 'Symbolic AI',
    description: 'Kurallar, mantık ve açıklanabilir bilgi gösterimi kullanan yaklaşım.',
    layer: 'methods',
  },
  {
    id: 'search',
    label: 'Search',
    description: 'Durum uzayında yol ve karar arayan yaklaşım.',
    layer: 'methods',
  },
  {
    id: 'generative-ai',
    label: 'Generative AI',
    description: 'Yeni içerik üreten model ailesi.',
    layer: 'methods',
  },
]

const factDefinitionMap = new Map(factDefinitions.map((fact) => [fact.id, fact]))

const knowledgeRules: KnowledgeRule[] = [
  {
    id: 'R1',
    conditions: ['labelled-data-available'],
    conclusion: 'pattern-learning-possible',
    explanation: 'Etiketli örnek varsa örüntü öğrenimi için doğrudan eğitim sinyali vardır.',
  },
  {
    id: 'R2',
    conditions: ['pattern-learning-possible'],
    conclusion: 'supervised-learning',
    explanation: 'Örüntü öğrenimi mümkün olduğunda en doğal aile supervised learning olur.',
  },
  {
    id: 'R3',
    conditions: ['reward-signal-available'],
    conclusion: 'trial-feedback-available',
    explanation: 'Ödül sinyali, dene-gör döngüsünü öğrenmeye çevirebilir.',
  },
  {
    id: 'R4',
    conditions: ['trial-feedback-available'],
    conclusion: 'reinforcement-learning',
    explanation: 'Deneyimden gelen ödül geri bildirimi reinforcement learning için temel işarettir.',
  },
  {
    id: 'R5',
    conditions: ['state-transitions-known', 'explanation-required'],
    conclusion: 'symbolic-structure-available',
    explanation: 'Açık durum yapısı ve açıklama ihtiyacı sembolik modellemeyi güçlendirir.',
  },
  {
    id: 'R6',
    conditions: ['symbolic-structure-available'],
    conclusion: 'symbolic-ai',
    explanation: 'Kurallar açıkça kurulabiliyorsa symbolic AI güçlü bir adaydır.',
  },
  {
    id: 'R7',
    conditions: ['state-transitions-known', 'path-cost-relevant'],
    conclusion: 'search-space-defined',
    explanation: 'Geçişler ve maliyetler biliniyorsa problem arama uzayı olarak modellenebilir.',
  },
  {
    id: 'R8',
    conditions: ['search-space-defined'],
    conclusion: 'search',
    explanation: 'Arama uzayı tanımlandığında search yöntemleri uygun hale gelir.',
  },
  {
    id: 'R9',
    conditions: ['content-generation-needed'],
    conclusion: 'generation-objective-present',
    explanation: 'İçerik üretme ihtiyacı görevin generative bir hedef taşıdığını gösterir.',
  },
  {
    id: 'R10',
    conditions: ['generation-objective-present', 'labelled-data-available'],
    conclusion: 'generative-ai',
    explanation: 'Üretim hedefi ve örnek veri birlikte olduğunda generative AI güçlü aday olur.',
  },
]

const goalLabels: Record<KnowledgeRepresentationGoal, string> = {
  search: 'Search',
  'supervised-learning': 'Supervised Learning',
  'reinforcement-learning': 'Reinforcement Learning',
  'symbolic-ai': 'Symbolic AI',
  'generative-ai': 'Generative AI',
}

function dedupe(items: string[]) {
  return [...new Set(items)]
}

function formatFact(factId: string) {
  return factDefinitionMap.get(factId)?.label ?? factId
}

function formatRule(rule: KnowledgeRule) {
  return `${rule.id}: ${rule.conditions.map(formatFact).join(' ∧ ')} ⇒ ${formatFact(rule.conclusion)}`
}

function resolveInitialFacts(params: KnowledgeRepresentationParams) {
  const facts: string[] = []

  if (params.labelledDataAvailable) {
    facts.push('labelled-data-available')
  }
  if (params.rewardSignalAvailable) {
    facts.push('reward-signal-available')
  }
  if (params.stateTransitionsKnown) {
    facts.push('state-transitions-known')
  }
  if (params.explanationRequired) {
    facts.push('explanation-required')
  }
  if (params.contentGenerationNeeded) {
    facts.push('content-generation-needed')
  }
  if (params.pathCostRelevant) {
    facts.push('path-cost-relevant')
  }

  return facts
}

function buildRepresentationLayers(): RepresentationLayer[] {
  return [
    {
      id: 'observed',
      title: 'Observed Facts',
      nodes: factDefinitions.filter((fact) => fact.layer === 'observed'),
    },
    {
      id: 'derived',
      title: 'Derived Concepts',
      nodes: factDefinitions.filter((fact) => fact.layer === 'derived'),
    },
    {
      id: 'methods',
      title: 'AI Methods',
      nodes: factDefinitions.filter((fact) => fact.layer === 'methods'),
    },
  ]
}

function buildRuleAgenda(knownFacts: Set<string>, firedRuleIds: Set<string>) {
  return knowledgeRules.map((rule) => ({
    rule,
    unmetFacts: rule.conditions.filter((condition) => !knownFacts.has(condition)),
    fired: firedRuleIds.has(rule.id),
  }))
}

function buildBlockedRules(knownFacts: Set<string>, firedRuleIds: Set<string>): BlockedRule[] {
  return buildRuleAgenda(knownFacts, firedRuleIds)
    .filter((entry) => !entry.fired)
    .map((entry) => ({
      ruleId: entry.rule.id,
      conclusion: entry.rule.conclusion,
      unmetFacts: entry.unmetFacts,
      explanation: entry.rule.explanation,
    }))
    .filter((entry) => entry.unmetFacts.length > 0)
}

function buildProofChain(
  goal: string,
  initialFacts: Set<string>,
  parentRuleByFact: Map<string, KnowledgeRule>,
): string[] {
  const chain: string[] = []
  const visited = new Set<string>()

  function visit(factId: string) {
    if (visited.has(factId)) {
      return
    }
    visited.add(factId)

    if (initialFacts.has(factId)) {
      chain.push(`Gerçek: ${formatFact(factId)}`)
      return
    }

    const parent = parentRuleByFact.get(factId)
    if (!parent) {
      chain.push(`Kanıt eksik: ${formatFact(factId)}`)
      return
    }

    parent.conditions.forEach(visit)
    chain.push(formatRule(parent))
  }

  visit(goal)
  return chain
}

function runForwardChaining(
  initialFacts: string[],
  goal: KnowledgeRepresentationGoal,
  maxSteps: number,
) {
  const knownFacts = new Set(initialFacts)
  const firedRuleIds = new Set<string>()
  const parentRuleByFact = new Map<string, KnowledgeRule>()
  const events: InferenceEvent[] = [
    {
      id: 'start',
      type: 'start',
      message: `Başlangıçta ${initialFacts.length} gözlenen gerçek yüklendi.`,
      focus: goal,
      facts: [...knownFacts],
    },
  ]

  for (let step = 0; step < maxSteps && !knownFacts.has(goal); step += 1) {
    const nextRule = knowledgeRules.find(
      (rule) =>
        !firedRuleIds.has(rule.id) &&
        !knownFacts.has(rule.conclusion) &&
        rule.conditions.every((condition) => knownFacts.has(condition)),
    )

    if (!nextRule) {
      break
    }

    firedRuleIds.add(nextRule.id)
    events.push({
      id: `rule-${step + 1}`,
      type: 'rule-fired',
      message: `${nextRule.id} tetiklendi: ${nextRule.explanation}`,
      focus: nextRule.conclusion,
      facts: [...knownFacts],
      ruleId: nextRule.id,
    })

    knownFacts.add(nextRule.conclusion)
    parentRuleByFact.set(nextRule.conclusion, nextRule)

    if (nextRule.conclusion === goal) {
      events.push({
        id: `goal-${step + 1}`,
        type: 'goal-reached',
        message: `${formatFact(goal)} hedefi kanıtlandı.`,
        focus: goal,
        facts: [...knownFacts],
        ruleId: nextRule.id,
      })
    } else {
      events.push({
        id: `fact-${step + 1}`,
        type: 'concept-derived',
        message: `${formatFact(nextRule.conclusion)} yeni bir çıkarım olarak eklendi.`,
        focus: nextRule.conclusion,
        facts: [...knownFacts],
        ruleId: nextRule.id,
      })
    }
  }

  const blockedRules = buildBlockedRules(knownFacts, firedRuleIds)

  if (!knownFacts.has(goal)) {
    const primaryBlock =
      knowledgeRules.find((rule) => rule.conclusion === goal) ??
      blockedRules.find((entry) => entry.conclusion === goal)

    const unmetFacts =
      'conditions' in (primaryBlock ?? {})
        ? (primaryBlock as KnowledgeRule).conditions.filter((condition) => !knownFacts.has(condition))
        : (primaryBlock as BlockedRule | undefined)?.unmetFacts ?? []

    events.push({
      id: 'failure',
      type: 'failure',
      message:
        unmetFacts.length > 0
          ? `${formatFact(goal)} hedefi için ${unmetFacts.map(formatFact).join(', ')} eksik kaldı.`
          : `${formatFact(goal)} hedefine ulaşacak uygun bir kural tetiklenemedi.`,
      focus: goal,
      facts: [...knownFacts],
      unmetFacts,
    })
  }

  return {
    knownFacts,
    firedRuleIds,
    parentRuleByFact,
    events,
    blockedRules,
  }
}

interface BackwardState {
  knownFacts: Set<string>
  firedRuleIds: Set<string>
  parentRuleByFact: Map<string, KnowledgeRule>
  events: InferenceEvent[]
  blockedRules: BlockedRule[]
  visitCount: number
}

interface BackwardAttempt {
  success: boolean
  unmetFacts: string[]
}

function runBackwardAttempt(
  factId: string,
  rootGoal: string,
  state: BackwardState,
  maxSteps: number,
  visited: Set<string>,
): BackwardAttempt {
  if (state.knownFacts.has(factId)) {
    return { success: true, unmetFacts: [] }
  }

  if (visited.has(factId)) {
    return { success: false, unmetFacts: [factId] }
  }

  if (state.visitCount >= maxSteps) {
    return { success: false, unmetFacts: [factId] }
  }

  const supportingRules = knowledgeRules.filter((rule) => rule.conclusion === factId)
  if (supportingRules.length === 0) {
    return { success: false, unmetFacts: [factId] }
  }

  visited.add(factId)
  state.visitCount += 1

  for (const rule of supportingRules) {
    const unmetFacts: string[] = []
    let allConditionsMet = true

    for (const condition of rule.conditions) {
      const attempt = runBackwardAttempt(condition, rootGoal, state, maxSteps, visited)
      if (!attempt.success) {
        allConditionsMet = false
        unmetFacts.push(...attempt.unmetFacts)
      }
    }

    if (!allConditionsMet) {
      const uniqueUnmet = dedupe(unmetFacts)
      state.blockedRules.push({
        ruleId: rule.id,
        conclusion: rule.conclusion,
        unmetFacts: uniqueUnmet,
        explanation: rule.explanation,
      })
      state.events.push({
        id: `failure-${state.events.length}`,
        type: 'failure',
        message: `${rule.id} ${formatFact(rule.conclusion)} sonucuna gidemedi.`,
        focus: rule.conclusion,
        facts: [...state.knownFacts],
        ruleId: rule.id,
        unmetFacts: uniqueUnmet,
      })
      continue
    }

    state.events.push({
      id: `rule-${state.events.length}`,
      type: 'rule-fired',
      message: `${rule.id} geri zincirde doğrulandı.`,
      focus: rule.conclusion,
      facts: [...state.knownFacts],
      ruleId: rule.id,
    })
    state.firedRuleIds.add(rule.id)
    state.parentRuleByFact.set(rule.conclusion, rule)
    state.knownFacts.add(rule.conclusion)

    if (factId === rootGoal) {
      state.events.push({
        id: `goal-${state.events.length}`,
        type: 'goal-reached',
        message: `${formatFact(rootGoal)} hedefi geri zincirleme ile kanıtlandı.`,
        focus: rootGoal,
        facts: [...state.knownFacts],
        ruleId: rule.id,
      })
    } else {
      state.events.push({
        id: `fact-${state.events.length}`,
        type: 'concept-derived',
        message: `${formatFact(rule.conclusion)} alt hedefi başarıyla doğrulandı.`,
        focus: rule.conclusion,
        facts: [...state.knownFacts],
        ruleId: rule.id,
      })
    }

    visited.delete(factId)
    return { success: true, unmetFacts: [] }
  }

  visited.delete(factId)
  return { success: false, unmetFacts: [factId] }
}

function runBackwardChaining(
  initialFacts: string[],
  goal: KnowledgeRepresentationGoal,
  maxSteps: number,
) {
  const state: BackwardState = {
    knownFacts: new Set(initialFacts),
    firedRuleIds: new Set<string>(),
    parentRuleByFact: new Map<string, KnowledgeRule>(),
    events: [
      {
        id: 'start',
        type: 'start',
        message: `Hedef ${formatFact(goal)} için geri zincirleme başlatıldı.`,
        focus: goal,
        facts: initialFacts,
      },
    ],
    blockedRules: [],
    visitCount: 0,
  }

  const attempt = runBackwardAttempt(goal, goal, state, maxSteps, new Set<string>())

  if (!attempt.success) {
    const unmetFacts = dedupe(
      state.blockedRules
        .filter((entry) => entry.conclusion === goal || entry.unmetFacts.includes(goal))
        .flatMap((entry) => entry.unmetFacts),
    )
    const failureUnmet = unmetFacts.length > 0 ? unmetFacts : attempt.unmetFacts

    state.events.push({
      id: 'failure-final',
      type: 'failure',
      message: `${formatFact(goal)} hedefi için ${failureUnmet.map(formatFact).join(', ')} doğrulanamadı.`,
      focus: goal,
      facts: [...state.knownFacts],
      unmetFacts: failureUnmet,
    })
  }

  return state
}

function buildMetrics(
  goal: KnowledgeRepresentationGoal,
  goalReached: boolean,
  initialFacts: string[],
  derivedFacts: string[],
  inferenceDepth: number,
  blockedRules: BlockedRule[],
): SimulationMetric[] {
  return [
    {
      label: 'Seçili Hedef',
      value: goalLabels[goal],
      tone: 'primary',
    },
    {
      label: 'Durum',
      value: goalReached ? 'Kanıtlandı' : 'Eksik Kanıt',
      tone: goalReached ? 'secondary' : 'warning',
    },
    {
      label: 'Başlangıç Gerçeği',
      value: String(initialFacts.length),
      tone: 'neutral',
    },
    {
      label: 'Türetilen Düğüm',
      value: String(derivedFacts.length),
      tone: 'tertiary',
    },
    {
      label: 'Çıkarım Derinliği',
      value: String(inferenceDepth),
      tone: 'primary',
    },
    {
      label: 'Bloke Kural',
      value: String(blockedRules.length),
      tone: blockedRules.length > 0 ? 'warning' : 'neutral',
    },
  ]
}

function buildLearning(
  goal: KnowledgeRepresentationGoal,
  goalReached: boolean,
  initialFacts: string[],
  blockedRules: BlockedRule[],
  strategy: KnowledgeRepresentationStrategy,
  proofChain: string[],
): LearningContent {
  const observedEvidence = initialFacts.map(formatFact).join(', ') || 'Hiçbiri'
  const primaryBlock = blockedRules.find((entry) => entry.conclusion === goal) ?? blockedRules[0]
  const blockSummary = primaryBlock
    ? primaryBlock.unmetFacts.map(formatFact).join(', ')
    : 'Uygun öncüller oluşmadı'

  return {
    summary: goalReached
      ? `${goalLabels[goal]} için gereken kanıt zinciri ${strategy === 'forward' ? 'forward chaining' : 'backward chaining'} ile tamamlandı.`
      : `${goalLabels[goal]} hedefi için bilgi tabanı yeterli kanıt üretmedi.`,
    interpretation: goalReached
      ? `Gözlenen kanıtlar: ${observedEvidence}. Bu kanıtlar, ${proofChain.at(-1) ?? goalLabels[goal]} hattına bağlandı ve seçili yöntemin neden uygun olduğunu görünür hale getirdi.`
      : `Gözlenen kanıtlar: ${observedEvidence}. Ancak ${blockSummary} eksik olduğu için hedef yöntem doğrulanamadı.`,
    warnings: goalReached
      ? 'Bir yöntemin kanıtlanması, diğer yöntemlerin yanlış olduğu anlamına gelmez; yalnızca mevcut bilgi gösterimine göre en güçlü açıklamayı verir.'
      : 'Eksik kanıt genellikle yanlış yöntem seçildiği anlamına gelmez; çoğu zaman bilgi gösterimi yetersizdir ya da kritik bir öncül eklenmemiştir.',
    tryNext:
      goal === 'search'
        ? 'Durum geçişleri ve yol maliyeti birlikte açık olduğunda search daha anlamlı hale gelir. Path cost kapalıysa yeniden dene.'
        : goal === 'symbolic-ai'
          ? 'Açıklanabilirlik gereksinimini açıp state transitions bilgisini koruyarak symbolic AI zincirini yeniden izle.'
          : goal === 'reinforcement-learning'
            ? 'Reward signal kapatıldığında RL zincirinin nasıl kırıldığına bak. Sonra reward signal ile supervised learning farkını karşılaştır.'
            : goal === 'generative-ai'
              ? 'Content generation açık kalsın ama labelled data kapansın; generative AI hedefinin neden bloklandığını incele.'
              : 'Labelled data açıkken supervised learning, reward signal açıkken reinforcement learning zincirlerini karşılaştır.',
  }
}

function buildExperiments(goal: KnowledgeRepresentationGoal): GuidedExperiment[] {
  return [
    {
      title: 'Aynı problemi başka yöntemle test et',
      change: 'Hedefi search veya symbolic AI olarak değiştir, diğer toggle ayarlarını koru.',
      expectation: 'Aynı gözlenen gerçekler altında bilgi tabanı farklı bir yöntemi kanıtlayamayabilir.',
    },
    {
      title: 'Kanıtı tek öncülden mahrum bırak',
      change:
        goal === 'generative-ai'
          ? 'Labelled data toggle değerini kapat.'
          : 'Goal ile ilişkili ana öncüllerden birini kapat ve timeline akışını tekrar oynat.',
      expectation: 'Proof chain kırılır ve failure olayları hangi öncülün eksik kaldığını görünür kılar.',
    },
    {
      title: 'Çıkarım stratejisini tersine çevir',
      change: 'Forward chaining ile backward chaining arasında geçiş yap.',
      expectation: 'Aynı hedefe giderken ziyaret edilen olay sırası değişir; backward chaining daha hedef odaklı görünür.',
    },
  ]
}

function buildTimeline(events: InferenceEvent[]): SimulationTimeline {
  return {
    frames: events.map((event, index) => ({
      label: `${index + 1}. ${event.type === 'goal-reached' ? 'Hedef' : event.type === 'failure' ? 'Blokaj' : formatFact(event.focus)}`,
    })),
  }
}

export function deriveKnowledgeRepresentationResult(
  params: KnowledgeRepresentationParams,
): KnowledgeRepresentationResult {
  const initialFacts = resolveInitialFacts(params)
  const strategyLabel =
    params.strategy === 'forward' ? 'Forward Chaining' : 'Backward Chaining'

  const inference =
    params.strategy === 'forward'
      ? runForwardChaining(initialFacts, params.goal, params.maxSteps)
      : runBackwardChaining(initialFacts, params.goal, params.maxSteps)

  const allKnownFacts = [...inference.knownFacts]
  const derivedFacts = allKnownFacts.filter((fact) => !initialFacts.includes(fact))
  const goalReached = inference.knownFacts.has(params.goal)
  const proofChain = goalReached
    ? buildProofChain(params.goal, new Set(initialFacts), inference.parentRuleByFact)
    : []
  const inferenceDepth = inference.events.filter((event) => event.type === 'rule-fired').length

  return {
    initialFacts,
    derivedFacts,
    rules: knowledgeRules,
    events: inference.events,
    activeGoal: params.goal,
    goalReached,
    proofChain,
    blockedRules: dedupe(
      inference.blockedRules.map((entry) => `${entry.ruleId}|${entry.conclusion}|${entry.unmetFacts.join(',')}`),
    ).map((key) => {
      const [ruleId, conclusion, unmetFacts] = key.split('|')
      const source = inference.blockedRules.find(
        (entry) =>
          entry.ruleId === ruleId &&
          entry.conclusion === conclusion &&
          entry.unmetFacts.join(',') === unmetFacts,
      )

      return (
        source ?? {
          ruleId,
          conclusion,
          unmetFacts: unmetFacts ? unmetFacts.split(',') : [],
          explanation: '',
        }
      )
    }),
    representationLayers: buildRepresentationLayers(),
    strategyLabel,
    inferenceDepth,
    learning: buildLearning(
      params.goal,
      goalReached,
      initialFacts,
      inference.blockedRules,
      params.strategy,
      proofChain,
    ),
    metrics: buildMetrics(
      params.goal,
      goalReached,
      initialFacts,
      derivedFacts,
      inferenceDepth,
      inference.blockedRules,
    ),
    experiments: buildExperiments(params.goal),
    timeline: buildTimeline(inference.events),
  }
}
