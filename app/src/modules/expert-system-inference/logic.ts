import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

export interface ExpertSystemInferenceParams extends SimulationParamsBase {
  strategy: 'forward' | 'backward'
  scenario: 'device-diagnosis' | 'medical-triage' | 'course-advisor'
  goal: string
  maxSteps: number
}

export interface KnowledgeRule {
  id: string
  conditions: string[]
  conclusion: string
  explanation: string
}

export interface InferenceScenario {
  title: string
  initialFacts: string[]
  rules: KnowledgeRule[]
  defaultGoal: string
  allowedGoals: string[]
}

export interface InferenceEvent {
  id: string
  type: 'start' | 'rule' | 'fact' | 'goal' | 'failure'
  message: string
  focus: string
  facts: string[]
  ruleId?: string
}

export interface ExpertSystemInferenceResult extends SimulationResultBase {
  scenarioTitle: string
  activeGoal: string
  initialFacts: string[]
  rules: KnowledgeRule[]
  events: InferenceEvent[]
  proofChain: string[]
  targetReached: boolean
  derivedFacts: string[]
  inferenceDepth: number
  strategyLabel: string
}

const scenarios: Record<ExpertSystemInferenceParams['scenario'], InferenceScenario> = {
  'device-diagnosis': {
    title: 'Cihaz Arızası',
    initialFacts: ['cihaz-acilmiyor', 'batarya-led-kapali', 'adapter-takili', 'batarya-eski'],
    defaultGoal: 'batarya-degistir',
    allowedGoals: ['batarya-degistir', 'surucu-guncelle', 'adaptoru-tak'],
    rules: [
      {
        id: 'R1',
        conditions: ['cihaz-acilmiyor', 'batarya-led-kapali'],
        conclusion: 'guc-problemi',
        explanation: 'Enerji belirtisi yoksa sorun güç zincirinde aranır.',
      },
      {
        id: 'R2',
        conditions: ['guc-problemi', 'adapter-takili', 'batarya-eski'],
        conclusion: 'batarya-degistir',
        explanation: 'Adaptör bağlıysa ve pil yaşlıysa en güçlü aday bataryadır.',
      },
      {
        id: 'R3',
        conditions: ['guc-problemi', 'adapter-takili', 'batarya-yeni'],
        conclusion: 'surucu-guncelle',
        explanation: 'Güç hattı temiz ama cihaz açılmıyorsa firmware/driver hattı kontrol edilir.',
      },
      {
        id: 'R4',
        conditions: ['guc-problemi', 'adapter-takili-degil'],
        conclusion: 'adaptoru-tak',
        explanation: 'Güç kaynağı takılı değilse ilk eylem bağlantıyı doğrulamaktır.',
      },
    ],
  },
  'medical-triage': {
    title: 'Tıbbi Triaj',
    initialFacts: ['ates-yuksek', 'nefes-darligi', 'oksijen-dusuk', 'sivi-kaybi-var'],
    defaultGoal: 'acil-mudahale',
    allowedGoals: ['acil-mudahale', 'evde-istirahat', 'sivi-destegi'],
    rules: [
      {
        id: 'R1',
        conditions: ['nefes-darligi', 'oksijen-dusuk'],
        conclusion: 'solunum-riski',
        explanation: 'Nefes darlığı ile düşük oksijen birlikteyse solunum riski yükselir.',
      },
      {
        id: 'R2',
        conditions: ['solunum-riski', 'ates-yuksek'],
        conclusion: 'acil-mudahale',
        explanation: 'Solunum riski ve yüksek ateş birlikte acil değerlendirme gerektirir.',
      },
      {
        id: 'R3',
        conditions: ['sivi-kaybi-var', 'ates-yuksek'],
        conclusion: 'sivi-destegi',
        explanation: 'Ateşle beraber sıvı kaybı varsa öncelik hidrasyon planıdır.',
      },
      {
        id: 'R4',
        conditions: ['ates-dusuk', 'oksijen-normal'],
        conclusion: 'evde-istirahat',
        explanation: 'Belirtiler hafifse evde izlem yeterli olabilir.',
      },
    ],
  },
  'course-advisor': {
    title: 'Ders Öneri Sistemi',
    initialFacts: ['lineer-cebir-guclu', 'istatistik-temeli-var', 'optimizasyon-seviyor'],
    defaultGoal: 'ml-dersi-al',
    allowedGoals: ['ml-dersi-al', 'matematik-guclendir', 'veri-tabani-secin'],
    rules: [
      {
        id: 'R1',
        conditions: ['lineer-cebir-guclu', 'istatistik-temeli-var'],
        conclusion: 'ml-hazirligi-var',
        explanation: 'Lineer cebir ve istatistik, makine öğrenmesi için temel hazırbulunuşluk sağlar.',
      },
      {
        id: 'R2',
        conditions: ['ml-hazirligi-var', 'optimizasyon-seviyor'],
        conclusion: 'ml-dersi-al',
        explanation: 'Hazırbulunuşluk ve optimizasyona ilgi birlikteyse ML dersi önerilir.',
      },
      {
        id: 'R3',
        conditions: ['lineer-cebir-zayif'],
        conclusion: 'matematik-guclendir',
        explanation: 'Temel lineer cebir zayıfsa önce bu eksik kapatılmalıdır.',
      },
      {
        id: 'R4',
        conditions: ['sql-seviyor', 'sistem-tasarimi-ilgisi'],
        conclusion: 'veri-tabani-secin',
        explanation: 'Sorgu ve sistem tasarım ilgisi veri tabanı tarafını öne çıkarır.',
      },
    ],
  },
}

function resolveGoal(params: ExpertSystemInferenceParams, scenario: InferenceScenario) {
  return scenario.allowedGoals.includes(params.goal) ? params.goal : scenario.defaultGoal
}

function dedupe(items: string[]) {
  return [...new Set(items)]
}

function buildProofChain(
  goal: string,
  initialFacts: Set<string>,
  parentRuleByFact: Map<string, KnowledgeRule>,
): string[] {
  const chain: string[] = []

  function visit(fact: string) {
    if (initialFacts.has(fact)) {
      chain.push(`Gerçek: ${fact}`)
      return
    }

    const parent = parentRuleByFact.get(fact)
    if (!parent) {
      chain.push(`Kanıt yok: ${fact}`)
      return
    }

    parent.conditions.forEach(visit)
    chain.push(`${parent.id}: ${parent.conditions.join(' ∧ ')} ⇒ ${parent.conclusion}`)
  }

  visit(goal)
  return dedupe(chain)
}

function runForwardChaining(
  scenario: InferenceScenario,
  goal: string,
  maxSteps: number,
): Pick<ExpertSystemInferenceResult, 'events' | 'proofChain' | 'targetReached' | 'derivedFacts' | 'inferenceDepth'> {
  const knownFacts = new Set(scenario.initialFacts)
  const firedRuleIds = new Set<string>()
  const parentRuleByFact = new Map<string, KnowledgeRule>()
  const events: InferenceEvent[] = [
    {
      id: 'start',
      type: 'start',
      message: `Başlangıç gerçekleri yüklendi (${scenario.initialFacts.length})`,
      focus: goal,
      facts: [...knownFacts],
    },
  ]

  for (let step = 0; step < maxSteps && !knownFacts.has(goal); step += 1) {
    const nextRule = scenario.rules.find(
      (rule) =>
        !firedRuleIds.has(rule.id) &&
        !knownFacts.has(rule.conclusion) &&
        rule.conditions.every((condition) => knownFacts.has(condition)),
    )

    if (!nextRule) {
      break
    }

    firedRuleIds.add(nextRule.id)
    knownFacts.add(nextRule.conclusion)
    parentRuleByFact.set(nextRule.conclusion, nextRule)
    events.push({
      id: `rule-${step + 1}`,
      type: 'rule',
      message: `${nextRule.id} tetiklendi ve ${nextRule.conclusion} üretildi`,
      focus: nextRule.conclusion,
      facts: [...knownFacts],
      ruleId: nextRule.id,
    })
  }

  const targetReached = knownFacts.has(goal)
  events.push({
    id: targetReached ? 'goal' : 'failure',
    type: targetReached ? 'goal' : 'failure',
    message: targetReached ? `Hedefe ulaşıldı: ${goal}` : `Hedef üretilemedi: ${goal}`,
    focus: goal,
    facts: [...knownFacts],
  })

  return {
    events,
    proofChain: targetReached ? buildProofChain(goal, new Set(scenario.initialFacts), parentRuleByFact) : [],
    targetReached,
    derivedFacts: [...knownFacts],
    inferenceDepth: Math.max(0, events.filter((event) => event.type === 'rule').length),
  }
}

interface BackwardResult {
  success: boolean
  facts: Set<string>
  events: InferenceEvent[]
  proofChain: string[]
  ruleCount: number
}

function runBackwardChaining(
  scenario: InferenceScenario,
  goal: string,
  maxDepth: number,
): Pick<ExpertSystemInferenceResult, 'events' | 'proofChain' | 'targetReached' | 'derivedFacts' | 'inferenceDepth'> {
  const initialFacts = new Set(scenario.initialFacts)
  let eventIndex = 0

  const prove = (target: string, depth: number, path: Set<string>): BackwardResult => {
    const currentFacts = new Set(initialFacts)

    if (initialFacts.has(target)) {
      return {
        success: true,
        facts: currentFacts,
        events: [
          {
            id: `fact-${eventIndex += 1}`,
            type: 'fact',
            message: `${target} başlangıç gerçekleri içinde bulundu`,
            focus: target,
            facts: [...currentFacts],
          },
        ],
        proofChain: [`Gerçek: ${target}`],
        ruleCount: 0,
      }
    }

    if (depth >= maxDepth || path.has(target)) {
      return {
        success: false,
        facts: currentFacts,
        events: [
          {
            id: `fail-${eventIndex += 1}`,
            type: 'failure',
            message: `${target} için geri zincirleme sınırı aşıldı`,
            focus: target,
            facts: [...currentFacts],
          },
        ],
        proofChain: [],
        ruleCount: 0,
      }
    }

    const candidateRules = scenario.rules.filter((rule) => rule.conclusion === target)
    let bestFailure: BackwardResult = {
      success: false,
      facts: currentFacts,
      events: [
        {
          id: `goal-${eventIndex += 1}`,
          type: 'goal',
          message: `${target} için kural aranıyor`,
          focus: target,
          facts: [...currentFacts],
        },
      ],
      proofChain: [],
      ruleCount: 0,
    }

    for (const rule of candidateRules) {
      const entryEvent: InferenceEvent = {
        id: `rule-${eventIndex += 1}`,
        type: 'rule',
        message: `${rule.id} ile ${target} hedefi deneniyor`,
        focus: target,
        facts: [...currentFacts],
        ruleId: rule.id,
      }
      const childPath = new Set(path)
      childPath.add(target)

      const conditionResults = rule.conditions.map((condition) => prove(condition, depth + 1, childPath))
      const success = conditionResults.every((result) => result.success)
      const mergedFacts = new Set<string>(initialFacts)
      conditionResults.forEach((result) => {
        result.facts.forEach((fact) => mergedFacts.add(fact))
      })

      if (success) {
        mergedFacts.add(target)
        return {
          success: true,
          facts: mergedFacts,
          events: [
            entryEvent,
            ...conditionResults.flatMap((result) => result.events),
            {
              id: `goal-${eventIndex += 1}`,
              type: 'goal',
              message: `${target} hedefi ${rule.id} ile kanıtlandı`,
              focus: target,
              facts: [...mergedFacts],
              ruleId: rule.id,
            },
          ],
          proofChain: dedupe([
            ...conditionResults.flatMap((result) => result.proofChain),
            `${rule.id}: ${rule.conditions.join(' ∧ ')} ⇒ ${rule.conclusion}`,
          ]),
          ruleCount: 1 + conditionResults.reduce((sum, result) => sum + result.ruleCount, 0),
        }
      }

      bestFailure = {
        success: false,
        facts: mergedFacts,
        events: [
          ...bestFailure.events,
          entryEvent,
          ...conditionResults.flatMap((result) => result.events),
        ],
        proofChain: [],
        ruleCount: 0,
      }
    }

    bestFailure.events.push({
      id: `fail-${eventIndex += 1}`,
      type: 'failure',
      message: `${target} için geçerli kanıt zinciri kurulamadı`,
      focus: target,
      facts: [...bestFailure.facts],
    })

    return bestFailure
  }

  const result = prove(goal, 0, new Set())

  return {
    events: [
      {
        id: 'start',
        type: 'start',
        message: `Hedef sorgusu başlatıldı: ${goal}`,
        focus: goal,
        facts: scenario.initialFacts,
      },
      ...result.events,
    ],
    proofChain: result.proofChain,
    targetReached: result.success,
    derivedFacts: [...result.facts],
    inferenceDepth: result.ruleCount,
  }
}

function buildLearningContent(result: ExpertSystemInferenceResult): LearningContent {
  return {
    summary: `${result.scenarioTitle} senaryosunda ${result.activeGoal} hedefi ${
      result.targetReached ? 'kanıtlandı' : 'kanıtlanamadı'
    }. ${result.strategyLabel} stratejisi ${result.inferenceDepth} kritik çıkarım adımı üretti.`,
    interpretation: result.targetReached
      ? 'Kural tabanlı sistem, başlangıç gerçeklerinden hedefe kadar açıklanabilir bir zincir kurabildi. Bu, sembolik AI tarafında kararın hangi öncüllerden geldiğini görünür kılar.'
      : 'Seçili hedef mevcut bilgi tabanından çıkarılamadı. Bu durum ya bilgi eksikliğine ya da yanlış hedef seçimine işaret eder; expert systemlerde bilgi tabanı kalitesi burada belirleyicidir.',
    warnings:
      'Kural tabanlı çıkarım doğruluk kadar kapsam sorununa da açıktır. Eksik bir kural ya da başlangıç gerçeği, aslında doğru olan sonucun üretilememesine neden olabilir.',
    tryNext:
      'Aynı senaryoda ileri ve geri zincirlemeyi karşılaştır. Özellikle hedef odaklı backward chaining daha az kuralı ziyaret ederek sonuca gidebilir.',
  }
}

function buildMetrics(result: ExpertSystemInferenceResult): SimulationMetric[] {
  return [
    {
      label: 'Hedef',
      value: result.targetReached ? 'Kanıtlandı' : 'Ulaşılamadı',
      tone: result.targetReached ? 'secondary' : 'warning',
    },
    {
      label: 'Kural Adımı',
      value: result.events.filter((event) => event.type === 'rule').length.toString(),
      tone: 'primary',
    },
    {
      label: 'Çıkarım Derinliği',
      value: result.inferenceDepth.toString(),
      tone: 'tertiary',
    },
    {
      label: 'Bilinen Gerçek',
      value: result.derivedFacts.length.toString(),
      tone: 'neutral',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'İleri ve Geri Zincirleme',
      change: 'Aynı hedefi iki strateji arasında değiştirerek tekrar çalıştır.',
      expectation: 'Backward chaining daha hedef odaklı ilerlerken forward chaining daha fazla ara gerçek türetebilir.',
    },
    {
      title: 'Ulaşılamayan Hedef',
      change: 'Senaryoya uymayan veya bilgi tabanında desteklenmeyen bir hedef seç.',
      expectation: 'Zincir erken kırılır ve sistem hangi adımda kanıt bulamadığını daha görünür hale getirir.',
    },
    {
      title: 'Adım Sınırı',
      change: 'Maksimum adım sayısını düşür.',
      expectation: 'Özellikle backward chaining tarafında kanıt ağacı tamamlanmadan arama kesilebilir.',
    },
  ]
}

function buildTimeline(events: InferenceEvent[]): SimulationTimeline {
  return {
    frames: events.map((event, index) => ({
      label: index === 0 ? 'Başlangıç' : event.message,
    })),
  }
}

export function deriveExpertSystemInferenceResult(
  params: ExpertSystemInferenceParams,
): ExpertSystemInferenceResult {
  const scenario = scenarios[params.scenario]
  const activeGoal = resolveGoal(params, scenario)
  const strategyResult =
    params.strategy === 'forward'
      ? runForwardChaining(scenario, activeGoal, params.maxSteps)
      : runBackwardChaining(scenario, activeGoal, params.maxSteps)

  const result: ExpertSystemInferenceResult = {
    scenarioTitle: scenario.title,
    activeGoal,
    initialFacts: scenario.initialFacts,
    rules: scenario.rules,
    events: strategyResult.events,
    proofChain: strategyResult.proofChain,
    targetReached: strategyResult.targetReached,
    derivedFacts: strategyResult.derivedFacts,
    inferenceDepth: strategyResult.inferenceDepth,
    strategyLabel: params.strategy === 'forward' ? 'İleri zincirleme' : 'Geri zincirleme',
    learning: {
      summary: '',
      interpretation: '',
      warnings: '',
      tryNext: '',
    },
    metrics: [],
    experiments: buildExperiments(),
    timeline: buildTimeline(strategyResult.events),
  }

  result.learning = buildLearningContent(result)
  result.metrics = buildMetrics(result)

  return result
}
