import { lazy } from 'react'
import {
  defineSimulationModule,
  type PresetConfig,
  type SimulationModule,
} from '../../types/simulation'
import {
  deriveBayesianNetworkInferenceResult,
  type BayesianNetworkInferenceParams,
  type BayesianNetworkInferenceResult,
} from './logic'

const BayesianNetworkVisualization = lazy(async () => ({
  default: (await import('./Visualization')).BayesianNetworkInferenceVisualization,
}))

const defaultParams: BayesianNetworkInferenceParams = {
  targetNode: 'pass-course',
  studyHabit: 'medium',
  attendance: 'high',
  examDifficulty: 'easy',
  showEvidence: true,
  inferenceFocus: 'single-evidence',
}

const presets: PresetConfig<BayesianNetworkInferenceParams>[] = [
  {
    name: 'Prior Dağılımı',
    params: {
      targetNode: 'pass-course',
      studyHabit: 'medium',
      attendance: 'high',
      examDifficulty: 'easy',
      showEvidence: false,
      inferenceFocus: 'prior',
    },
  },
  {
    name: 'Tek Kanıt Etkisi',
    params: {
      targetNode: 'high-grade',
      studyHabit: 'high',
      attendance: 'high',
      examDifficulty: 'hard',
      showEvidence: true,
      inferenceFocus: 'single-evidence',
    },
  },
  {
    name: 'Birleşik Kanıt',
    params: {
      targetNode: 'gets-recommendation',
      studyHabit: 'high',
      attendance: 'high',
      examDifficulty: 'easy',
      showEvidence: true,
      inferenceFocus: 'multi-evidence',
    },
  },
]

const bayesianNetworkDefinition = {
  id: 'bayesian-network-inference',
  title: 'Bayesian Network Inference',
  subtitle: 'Posterior Updates in a Student Performance Graph',
  category: 'ml',
  description:
    'Naive Bayes ötesine geçip nedensel ilişkileri bir Bayesian network üzerinde izle. Prior, single-evidence ve multi-evidence modlarında posterior kaymasının nasıl oluştuğunu gör.',
  icon: '📊',
  difficulty: 'intermediate',
  runMode: 'timeline',
  defaultParams,
  presets,
  controlSchema: [
    {
      key: 'targetNode',
      label: 'Target Node',
      type: 'select',
      options: [
        { label: 'Pass Course', value: 'pass-course' },
        { label: 'High Grade', value: 'high-grade' },
        { label: 'Gets Recommendation', value: 'gets-recommendation' },
      ],
    },
    {
      key: 'studyHabit',
      label: 'Study Habit',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      key: 'attendance',
      label: 'Attendance',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      key: 'examDifficulty',
      label: 'Exam Difficulty',
      type: 'select',
      options: [
        { label: 'Easy', value: 'easy' },
        { label: 'Hard', value: 'hard' },
      ],
    },
    {
      key: 'showEvidence',
      label: 'Evidence Açık',
      type: 'toggle',
    },
    {
      key: 'inferenceFocus',
      label: 'Inference Focus',
      type: 'select',
      options: [
        { label: 'Prior', value: 'prior' },
        { label: 'Single Evidence', value: 'single-evidence' },
        { label: 'Multi Evidence', value: 'multi-evidence' },
      ],
    },
  ],
  formulaTeX: 'P(X \\mid E) = \\alpha P(E \\mid X) P(X)',
  theory: {
    primaryFormula: 'Posterior = prior updated by evidence through graph structure',
    formulaLabel: 'Bayesian network çıkarımı',
    symbols: [
      { symbol: 'P(X)', meaning: 'Hedef düğüm için öncül olasılık' },
      { symbol: 'E', meaning: 'Gözlenen evidence düğümleri' },
      { symbol: 'P(X | E)', meaning: 'Evidence sonrası posterior' },
      { symbol: 'edge', meaning: 'Koşullu bağımlılığı gösteren yönlü bağlantı' },
    ],
    derivationSteps: [
      'Önce kök düğümlerin prior dağılımları tanımlanır.',
      'Derived düğümler, parent node kombinasyonlarına bağlı CPT değerleriyle hesaplanır.',
      'Single-evidence modunda en etkili tek kanıt kullanılır, multi-evidence modunda tüm seçili kök kanıtlar birlikte uygulanır.',
      'Posterior tablosu, evidence ile tutarlı tüm olası dünyaların normalize edilmesiyle elde edilir.',
    ],
    interpretation:
      'Bayesian network, hangi kanıtın hedefi ne kadar ittiğini açıklanabilir biçimde gösterebildiği için tek bir sınıflandırıcıdan daha zengin bir öğrenme yüzeyi sunar.',
    pitfalls: [
      'Büyük posterior kayması tek başına kesin nedensellik kanıtı değildir.',
      'Graph yapısına eklenmeyen bir ilişki, model tarafından hiç temsil edilmez.',
    ],
  },
  derive: deriveBayesianNetworkInferenceResult,
  VisualizationComponent: BayesianNetworkVisualization,
  codeExample: `prior = P(study_habit) * P(attendance) * P(exam_difficulty)
posterior = normalize(
    prior
    * P(high_grade | study_habit, attendance, exam_difficulty)
    * P(pass_course | high_grade, attendance)
    * P(recommendation | pass_course, study_habit)
)`,
} satisfies SimulationModule<BayesianNetworkInferenceParams, BayesianNetworkInferenceResult>

export const bayesianNetworkInferenceModule = defineSimulationModule(
  bayesianNetworkDefinition,
)
