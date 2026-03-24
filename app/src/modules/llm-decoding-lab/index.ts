import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveLlmDecodingLabResult,
  type LlmDecodingLabParams,
  type LlmDecodingLabResult,
} from './logic'

const LlmDecodingLabVisualization = lazy(async () => ({
  default: (await import('./Visualization')).LlmDecodingLabVisualization,
}))

const defaultParams: LlmDecodingLabParams = {
  scenario: 'campfire-story',
  temperature: 0.92,
  topK: 3,
  topP: 0.82,
  beamWidth: 3,
  maxSteps: 4,
}

const presets: PresetConfig<LlmDecodingLabParams>[] = [
  {
    name: 'Campfire Story',
    params: {
      scenario: 'campfire-story',
      temperature: 0.92,
      topK: 3,
      topP: 0.82,
      beamWidth: 3,
      maxSteps: 4,
    },
  },
  {
    name: 'SQL Assistant',
    params: {
      scenario: 'sql-assistant',
      temperature: 0.78,
      topK: 4,
      topP: 0.86,
      beamWidth: 3,
      maxSteps: 4,
    },
  },
  {
    name: 'Travel Planner',
    params: {
      scenario: 'travel-planner',
      temperature: 1.05,
      topK: 3,
      topP: 0.78,
      beamWidth: 4,
      maxSteps: 4,
    },
  },
]

const llmDecodingLabDefinition = {
  id: 'llm-decoding-lab',
  title: 'LLM Decoding Lab',
  subtitle: 'Temperature, Top-k, Top-p and Beam Search',
  category: 'ml',
  description:
    'Aynı prompt için farklı decoding stratejilerinin hangi token havuzundan seçim yaptığını ve neden farklı çıktılar ürettiğini izle. Seçim anındaki dağılım, filtre sonrası kalan adaylar ve kümülatif olasılık aynı ekranda karşılaştırılır.',
  icon: '🪄',
  difficulty: 'advanced',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'scenario',
      label: 'Prompt Senaryosu',
      type: 'select',
      options: [
        { label: 'Campfire Story', value: 'campfire-story' },
        { label: 'SQL Assistant', value: 'sql-assistant' },
        { label: 'Travel Planner', value: 'travel-planner' },
      ],
    },
    { key: 'temperature', label: 'Temperature', type: 'slider', min: 0.55, max: 1.4, step: 0.05 },
    { key: 'topK', label: 'Top-k', type: 'slider', min: 1, max: 6, step: 1 },
    { key: 'topP', label: 'Top-p', type: 'slider', min: 0.55, max: 0.98, step: 0.01 },
    { key: 'beamWidth', label: 'Beam Width', type: 'slider', min: 2, max: 5, step: 1 },
    { key: 'maxSteps', label: 'Üretim Adımı', type: 'slider', min: 3, max: 6, step: 1 },
  ],
  formulaTeX: 'p_τ(token) ∝ exp(logit / τ)',
  theory: {
    primaryFormula: 'Decoding, modelin ürettiği token dağılımını bir arama ya da örnekleme politikasına dönüştürür.',
    formulaLabel: 'Logits → filtered distribution → chosen token',
    symbols: [
      { symbol: 'temperature', meaning: 'Dağılımı keskinleştirir ya da yayar' },
      { symbol: 'top-k', meaning: 'Yalnızca en yüksek k adayı bırakır' },
      { symbol: 'top-p', meaning: 'Kümülatif olasılığı p eşiğine ulaşan en küçük kümeyi bırakır' },
      { symbol: 'beam search', meaning: 'Tek token yerine en güçlü kısmi dizileri takip eder' },
    ],
    derivationSteps: [
      'Model her adımda aday tokenler için bir logit ya da olasılık dağılımı üretir.',
      'Temperature bu dağılımın ne kadar sivri ya da düz olacağını belirler.',
      'Top-k ve top-p, örnekleme yapılmadan önce aday havuzunu sınırlar.',
      'Beam search tek adımda en yüksek tokeni seçmek yerine birden fazla kısmi diziyi birlikte taşır.',
    ],
    interpretation:
      'Aynı modelden farklı üretimler çıkmasının önemli bir kısmı decoding politikası kaynaklıdır; modelin bilgisi aynı kalsa da arama şekli değişir.',
    pitfalls: [
      'Beam search her zaman daha yaratıcı değildir; çoğu zaman daha güvenli ama daha dar bir cevap üretir.',
      'Top-p ile top-k aynı işi yapmaz; biri sabit adet, diğeri sabit kümülatif kütle sınırlar.',
    ],
  },
  derive: deriveLlmDecodingLabResult,
  VisualizationComponent: LlmDecodingLabVisualization,
  codeExample: `logits = model(prompt_tokens)
probs = softmax(logits / temperature)

filtered = nucleus_filter(probs, top_p=0.9)
next_token = sample(filtered)

beam_candidates = expand_beams(beams, logits, beam_width=4)`,
} satisfies SimulationModule<LlmDecodingLabParams, LlmDecodingLabResult>

export const llmDecodingLabModule = defineSimulationModule(llmDecodingLabDefinition)
