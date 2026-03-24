import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveKnowledgeRepresentationResult,
  type KnowledgeRepresentationParams,
  type KnowledgeRepresentationResult,
} from './logic'

const KnowledgeRepresentationVisualization = lazy(async () => ({
  default: (await import('./Visualization')).KnowledgeRepresentationVisualization,
}))

const defaultParams: KnowledgeRepresentationParams = {
  strategy: 'forward',
  goal: 'supervised-learning',
  labelledDataAvailable: true,
  rewardSignalAvailable: false,
  stateTransitionsKnown: false,
  explanationRequired: false,
  contentGenerationNeeded: false,
  pathCostRelevant: false,
  maxSteps: 6,
}

const presets: PresetConfig<KnowledgeRepresentationParams>[] = [
  {
    name: 'Denetimli Öğrenme Adayı',
    params: {
      strategy: 'forward',
      goal: 'supervised-learning',
      labelledDataAvailable: true,
      rewardSignalAvailable: false,
      stateTransitionsKnown: false,
      explanationRequired: false,
      contentGenerationNeeded: false,
      pathCostRelevant: false,
      maxSteps: 6,
    },
  },
  {
    name: 'Arama Problemi',
    params: {
      strategy: 'backward',
      goal: 'search',
      labelledDataAvailable: false,
      rewardSignalAvailable: false,
      stateTransitionsKnown: true,
      explanationRequired: false,
      contentGenerationNeeded: false,
      pathCostRelevant: true,
      maxSteps: 6,
    },
  },
  {
    name: 'Üretici AI Görevi',
    params: {
      strategy: 'forward',
      goal: 'generative-ai',
      labelledDataAvailable: true,
      rewardSignalAvailable: false,
      stateTransitionsKnown: false,
      explanationRequired: false,
      contentGenerationNeeded: true,
      pathCostRelevant: false,
      maxSteps: 7,
    },
  },
]

const knowledgeRepresentationLabDefinition = {
  id: 'knowledge-representation-lab',
  title: 'Knowledge Representation Lab',
  subtitle: 'Facts, Rules, and AI Method Selection',
  category: 'ml',
  description:
    'Bir problemin hangi AI yaklaşımına daha uygun olduğunu sembolik gerçekler ve kurallar üzerinden izle. Toggle edilen kanıtlar, rule agenda ve proof chain aynı görsel akışta birleşir.',
  icon: '🧩',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'strategy',
      label: 'Çıkarım Stratejisi',
      type: 'select',
      options: [
        { label: 'Forward Chaining', value: 'forward' },
        { label: 'Backward Chaining', value: 'backward' },
      ],
    },
    {
      key: 'goal',
      label: 'Hedef Yöntem',
      type: 'select',
      options: [
        { label: 'Search', value: 'search' },
        { label: 'Supervised Learning', value: 'supervised-learning' },
        { label: 'Reinforcement Learning', value: 'reinforcement-learning' },
        { label: 'Symbolic AI', value: 'symbolic-ai' },
        { label: 'Generative AI', value: 'generative-ai' },
      ],
    },
    {
      key: 'labelledDataAvailable',
      label: 'Labelled Data',
      type: 'toggle',
    },
    {
      key: 'rewardSignalAvailable',
      label: 'Reward Signal',
      type: 'toggle',
    },
    {
      key: 'stateTransitionsKnown',
      label: 'State Transitions',
      type: 'toggle',
    },
    {
      key: 'explanationRequired',
      label: 'Explanation Required',
      type: 'toggle',
    },
    {
      key: 'contentGenerationNeeded',
      label: 'Content Generation',
      type: 'toggle',
    },
    {
      key: 'pathCostRelevant',
      label: 'Path Cost Matters',
      type: 'toggle',
    },
    {
      key: 'maxSteps',
      label: 'Maksimum Adım',
      type: 'slider',
      min: 3,
      max: 10,
      step: 1,
    },
  ],
  formulaTeX: 'IF evidence \\Rightarrow derived\\ concept \\Rightarrow method',
  theory: {
    primaryFormula: 'Facts + Horn-style rules + inference strategy = explainable method selection',
    formulaLabel: 'Bilgi gösterimi ile yöntem seçimi',
    symbols: [
      { symbol: 'fact', meaning: 'Probleme dair gözlenen özellik veya gereksinim' },
      { symbol: 'rule', meaning: 'IF koşullar THEN sonuç biçiminde sembolik çıkarım' },
      { symbol: 'forward chaining', meaning: 'Kanıttan sonuca giden veri odaklı çıkarım' },
      { symbol: 'backward chaining', meaning: 'Hedeften kanıta giden amaç odaklı çıkarım' },
    ],
    derivationSteps: [
      'Önce problem hakkında gözlenen gerçekler sembolik fact olarak yazılır.',
      'Horn-clause benzeri kurallar bu fact kümelerinden ara kavramlar ve yöntem önerileri üretir.',
      'Forward chaining, aktif gerçeklerden başlayarak tüm tetiklenebilir kuralları ilerletir.',
      'Backward chaining, seçili hedef yöntemi kanıtlamak için yalnızca gerekli öncülleri sorgular.',
    ],
    interpretation:
      'Knowledge representation, sadece sonucun ne olduğunu değil, neden o sonuca gidildiğini de görünür kılar. Bu yüzden yöntem seçimi açıklanabilir hale gelir.',
    pitfalls: [
      'Bir yöntemin kanıtlanması diğer tüm yöntemlerin hatalı olduğu anlamına gelmez.',
      'Eksik toggle bilgisi, hatalı yöntem seçiminden çok eksik knowledge base belirtisi olabilir.',
    ],
  },
  derive: deriveKnowledgeRepresentationResult,
  VisualizationComponent: KnowledgeRepresentationVisualization,
  codeExample: `facts = {"labelled-data-available", "content-generation-needed"}

rules = [
    (["labelled-data-available"], "pattern-learning-possible"),
    (["pattern-learning-possible"], "supervised-learning"),
    (["content-generation-needed"], "generation-objective-present"),
    (["generation-objective-present", "labelled-data-available"], "generative-ai"),
]

for conditions, conclusion in rules:
    if all(item in facts for item in conditions):
        facts.add(conclusion)`,
} satisfies SimulationModule<KnowledgeRepresentationParams, KnowledgeRepresentationResult>

export const knowledgeRepresentationLabModule = defineSimulationModule(
  knowledgeRepresentationLabDefinition,
)
