import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveExpertSystemInferenceResult,
  type ExpertSystemInferenceParams,
  type ExpertSystemInferenceResult,
} from './logic'

const ExpertSystemInferenceVisualization = lazy(async () => ({
  default: (await import('./Visualization')).ExpertSystemInferenceVisualization,
}))

const defaultParams: ExpertSystemInferenceParams = {
  strategy: 'forward',
  scenario: 'device-diagnosis',
  goal: 'batarya-degistir',
  maxSteps: 6,
}

const presets: PresetConfig<ExpertSystemInferenceParams>[] = [
  { name: 'Cihaz Arızası', params: defaultParams },
  {
    name: 'Tıbbi Triaj',
    params: {
      strategy: 'backward',
      scenario: 'medical-triage',
      goal: 'acil-mudahale',
      maxSteps: 6,
    },
  },
  {
    name: 'Ders Önerisi',
    params: {
      strategy: 'forward',
      scenario: 'course-advisor',
      goal: 'ml-dersi-al',
      maxSteps: 6,
    },
  },
]

const expertSystemInferenceDefinition = {
  id: 'expert-system-inference',
  title: 'Uzman Sistem Çıkarımı',
  subtitle: 'Bilgi Gösterimi ve Kural Tabanlı Akıl Yürütme',
  category: 'ml',
  description:
    'Kural tabanlı bilgi tabanlarında ileri ve geri zincirlemenin nasıl çalıştığını izle. Hedefe giden kanıt zinciri, fired rule sırası ve türetilen gerçekler birlikte görünür.',
  icon: '🧠',
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
        { label: 'İleri Zincirleme', value: 'forward' },
        { label: 'Geri Zincirleme', value: 'backward' },
      ],
    },
    {
      key: 'scenario',
      label: 'Senaryo',
      type: 'select',
      options: [
        { label: 'Cihaz Arızası', value: 'device-diagnosis' },
        { label: 'Tıbbi Triaj', value: 'medical-triage' },
        { label: 'Ders Önerisi', value: 'course-advisor' },
      ],
    },
    {
      key: 'goal',
      label: 'Hedef',
      type: 'select',
      options: [
        { label: 'Batarya Değiştir', value: 'batarya-degistir' },
        { label: 'Sürücü Güncelle', value: 'surucu-guncelle' },
        { label: 'Adaptörü Tak', value: 'adaptoru-tak' },
        { label: 'Acil Müdahale', value: 'acil-mudahale' },
        { label: 'Evde İstirahat', value: 'evde-istirahat' },
        { label: 'Sıvı Desteği', value: 'sivi-destegi' },
        { label: 'ML Dersi Al', value: 'ml-dersi-al' },
        { label: 'Matematiği Güçlendir', value: 'matematik-guclendir' },
        { label: 'Veri Tabanı Seçin', value: 'veri-tabani-secin' },
      ],
    },
    {
      key: 'maxSteps',
      label: 'Maksimum Adım',
      type: 'slider',
      min: 2,
      max: 10,
      step: 1,
    },
  ],
  formulaTeX: 'IF p₁ ∧ p₂ ∧ ... ∧ pₙ THEN q',
  theory: {
    primaryFormula: 'Forward chaining: facts ⇒ rules ⇒ new facts, Backward chaining: goal ⇒ supporting rules ⇒ subgoals',
    formulaLabel: 'Kural tabanlı çıkarımın iki yönü',
    symbols: [
      { symbol: 'pᵢ', meaning: 'Koşul ya da öncül gerçek' },
      { symbol: 'q', meaning: 'Üretilen sonuç ya da hedef' },
      { symbol: 'knowledge base', meaning: 'Gerçekler ve kuralların birleşimi' },
    ],
    derivationSteps: [
      'Başlangıç gerçekleri bilgi tabanına yüklenir.',
      'Forward chaining, koşulları sağlanan kuralları tetikleyerek yeni gerçekler üretir.',
      'Backward chaining, hedefi seçip onu kanıtlayabilecek kuralları geriye doğru açar.',
      'Her iki yaklaşım da açıklanabilir bir çıkarım zinciri üretir ama ziyaret ettikleri düğümler farklı olabilir.',
    ],
    interpretation:
      'Bilgi gösteriminin gücü sadece sonucu üretmek değil, sonucun hangi sembolik bağlamdan geldiğini açıklamaktır.',
    pitfalls: [
      'Hedefe ulaşılamamasını yöntemin yanlışlığı sanmak; çoğu zaman sorun eksik bilgi tabanıdır.',
      'Tüm kuralların her senaryo için geçerli olduğunu varsaymak.',
    ],
  },
  derive: deriveExpertSystemInferenceResult,
  VisualizationComponent: ExpertSystemInferenceVisualization,
  codeExample: `rules = [
    (["cihaz-acilmiyor", "batarya-led-kapali"], "guc-problemi"),
    (["guc-problemi", "adapter-takili", "batarya-eski"], "batarya-degistir"),
]

known = set(initial_facts)
for conditions, conclusion in rules:
    if all(item in known for item in conditions):
        known.add(conclusion)`,
} satisfies SimulationModule<ExpertSystemInferenceParams, ExpertSystemInferenceResult>

export const expertSystemInferenceModule = defineSimulationModule(
  expertSystemInferenceDefinition,
)
