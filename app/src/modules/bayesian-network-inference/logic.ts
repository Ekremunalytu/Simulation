import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

type StudyHabit = 'low' | 'medium' | 'high'
type Attendance = 'low' | 'high'
type ExamDifficulty = 'easy' | 'hard'
type BinaryState = 'no' | 'yes'

type TargetNode = 'pass-course' | 'high-grade' | 'gets-recommendation'
type InferenceFocus = 'prior' | 'single-evidence' | 'multi-evidence'

export interface BayesianNetworkInferenceParams extends SimulationParamsBase {
  targetNode: TargetNode
  studyHabit: StudyHabit
  attendance: Attendance
  examDifficulty: ExamDifficulty
  showEvidence: boolean
  inferenceFocus: InferenceFocus
}

export interface BayesianNode {
  id: string
  label: string
  type: 'root' | 'derived' | 'target'
  states: string[]
}

export interface ProbabilityRow {
  state: string
  probability: number
}

export interface CptSummary {
  nodeId: string
  summary: string
}

export interface InfluencePath {
  source: string
  delta: number
  explanation: string
}

export interface BayesianNetworkInferenceResult extends SimulationResultBase {
  nodes: BayesianNode[]
  edges: Array<[string, string]>
  cpts: CptSummary[]
  evidence: Partial<Record<'study-habit' | 'attendance' | 'exam-difficulty', string>>
  posteriorTable: ProbabilityRow[]
  priorTable: ProbabilityRow[]
  influencePaths: InfluencePath[]
  mostInformativeEvidence: string | null
  targetProbabilityDelta: number
  targetLabel: string
}

interface JointAssignment {
  'study-habit': StudyHabit
  attendance: Attendance
  'exam-difficulty': ExamDifficulty
  'high-grade': BinaryState
  'pass-course': BinaryState
  'gets-recommendation': BinaryState
}

const nodes: BayesianNode[] = [
  {
    id: 'study-habit',
    label: 'Study Habit',
    type: 'root',
    states: ['low', 'medium', 'high'],
  },
  {
    id: 'attendance',
    label: 'Attendance',
    type: 'root',
    states: ['low', 'high'],
  },
  {
    id: 'exam-difficulty',
    label: 'Exam Difficulty',
    type: 'root',
    states: ['easy', 'hard'],
  },
  {
    id: 'high-grade',
    label: 'High Grade',
    type: 'derived',
    states: ['no', 'yes'],
  },
  {
    id: 'pass-course',
    label: 'Pass Course',
    type: 'target',
    states: ['no', 'yes'],
  },
  {
    id: 'gets-recommendation',
    label: 'Gets Recommendation',
    type: 'target',
    states: ['no', 'yes'],
  },
]

const edges: Array<[string, string]> = [
  ['study-habit', 'high-grade'],
  ['attendance', 'high-grade'],
  ['exam-difficulty', 'high-grade'],
  ['high-grade', 'pass-course'],
  ['attendance', 'pass-course'],
  ['pass-course', 'gets-recommendation'],
  ['study-habit', 'gets-recommendation'],
]

const studyPrior: Record<StudyHabit, number> = {
  low: 0.25,
  medium: 0.45,
  high: 0.3,
}

const attendancePrior: Record<Attendance, number> = {
  low: 0.35,
  high: 0.65,
}

const difficultyPrior: Record<ExamDifficulty, number> = {
  easy: 0.55,
  hard: 0.45,
}

const targetLabels: Record<TargetNode, string> = {
  'high-grade': 'High Grade',
  'pass-course': 'Pass Course',
  'gets-recommendation': 'Gets Recommendation',
}

function clampProbability(value: number) {
  return Math.min(0.97, Math.max(0.03, value))
}

function highGradeProbability(
  studyHabit: StudyHabit,
  attendance: Attendance,
  examDifficulty: ExamDifficulty,
) {
  const studyEffect = { low: 0.08, medium: 0.33, high: 0.56 }[studyHabit]
  const attendanceEffect = attendance === 'high' ? 0.17 : -0.07
  const difficultyEffect = examDifficulty === 'easy' ? 0.15 : -0.06
  return clampProbability(studyEffect + attendanceEffect + difficultyEffect)
}

function passCourseProbability(highGrade: BinaryState, attendance: Attendance) {
  const gradeEffect = highGrade === 'yes' ? 0.86 : 0.34
  const attendanceEffect = attendance === 'high' ? 0.09 : -0.05
  return clampProbability(gradeEffect + attendanceEffect)
}

function recommendationProbability(passCourse: BinaryState, studyHabit: StudyHabit) {
  const passEffect = passCourse === 'yes' ? 0.61 : 0.07
  const habitEffect = { low: -0.04, medium: 0.08, high: 0.21 }[studyHabit]
  return clampProbability(passEffect + habitEffect)
}

function priorForAssignment(assignment: JointAssignment) {
  const highGradeYes = highGradeProbability(
    assignment['study-habit'],
    assignment.attendance,
    assignment['exam-difficulty'],
  )
  const passCourseYes = passCourseProbability(
    assignment['high-grade'],
    assignment.attendance,
  )
  const recommendationYes = recommendationProbability(
    assignment['pass-course'],
    assignment['study-habit'],
  )

  return (
    studyPrior[assignment['study-habit']] *
    attendancePrior[assignment.attendance] *
    difficultyPrior[assignment['exam-difficulty']] *
    (assignment['high-grade'] === 'yes' ? highGradeYes : 1 - highGradeYes) *
    (assignment['pass-course'] === 'yes' ? passCourseYes : 1 - passCourseYes) *
    (assignment['gets-recommendation'] === 'yes'
      ? recommendationYes
      : 1 - recommendationYes)
  )
}

function enumerateAssignments() {
  const assignments: JointAssignment[] = []
  const studyValues: StudyHabit[] = ['low', 'medium', 'high']
  const attendanceValues: Attendance[] = ['low', 'high']
  const difficultyValues: ExamDifficulty[] = ['easy', 'hard']
  const binaryValues: BinaryState[] = ['no', 'yes']

  for (const studyHabit of studyValues) {
    for (const attendance of attendanceValues) {
      for (const examDifficulty of difficultyValues) {
        for (const highGrade of binaryValues) {
          for (const passCourse of binaryValues) {
            for (const getsRecommendation of binaryValues) {
              assignments.push({
                'study-habit': studyHabit,
                attendance,
                'exam-difficulty': examDifficulty,
                'high-grade': highGrade,
                'pass-course': passCourse,
                'gets-recommendation': getsRecommendation,
              })
            }
          }
        }
      }
    }
  }

  return assignments
}

function tableForTarget(
  targetNode: TargetNode,
  evidence: Partial<Record<'study-habit' | 'attendance' | 'exam-difficulty', string>>,
) {
  const assignments = enumerateAssignments().filter((assignment) =>
    Object.entries(evidence).every(([key, value]) => assignment[key as keyof JointAssignment] === value),
  )
  const totals = new Map<string, number>()
  let totalMass = 0

  for (const assignment of assignments) {
    const probability = priorForAssignment(assignment)
    totalMass += probability
    const state =
      targetNode === 'high-grade'
        ? assignment['high-grade']
        : targetNode === 'pass-course'
          ? assignment['pass-course']
          : assignment['gets-recommendation']

    totals.set(state, (totals.get(state) ?? 0) + probability)
  }

  return ['no', 'yes'].map((state) => ({
    state,
    probability: totalMass === 0 ? 0 : (totals.get(state) ?? 0) / totalMass,
  }))
}

function favorableProbability(table: ProbabilityRow[]) {
  return table.find((row) => row.state === 'yes')?.probability ?? 0
}

function buildEvidence(
  params: BayesianNetworkInferenceParams,
  priorTable: ProbabilityRow[],
) {
  if (!params.showEvidence || params.inferenceFocus === 'prior') {
    return {
      evidence: {},
      mostInformativeEvidence: null,
      influencePaths: [
        {
          source: 'No Evidence',
          delta: 0,
          explanation: 'Posterior tablosu, yalnızca network öncüllerinden hesaplandı.',
        },
      ],
    }
  }

  const candidateEvidence = {
    'study-habit': params.studyHabit,
    attendance: params.attendance,
    'exam-difficulty': params.examDifficulty,
  } as const

  const priorYes = favorableProbability(priorTable)
  const influencePaths = (Object.entries(candidateEvidence) as Array<
    ['study-habit' | 'attendance' | 'exam-difficulty', string]
  >).map(([key, value]) => {
    const table = tableForTarget(params.targetNode, { [key]: value })
    const delta = favorableProbability(table) - priorYes
    return {
      source: key,
      delta,
      explanation: `${key}=${value} kanıtı hedef olasılığı ${delta >= 0 ? 'yukarı' : 'aşağı'} itti.`,
    }
  })

  const mostInformative = [...influencePaths].sort(
    (left, right) => Math.abs(right.delta) - Math.abs(left.delta),
  )[0]

  if (params.inferenceFocus === 'single-evidence') {
    return {
      evidence: mostInformative
        ? { [mostInformative.source]: candidateEvidence[mostInformative.source] }
        : {},
      mostInformativeEvidence: mostInformative?.source ?? null,
      influencePaths,
    }
  }

  return {
    evidence: candidateEvidence,
    mostInformativeEvidence: mostInformative?.source ?? null,
    influencePaths,
  }
}

function buildLearning(
  params: BayesianNetworkInferenceParams,
  result: BayesianNetworkInferenceResult,
) : LearningContent {
  const evidenceText =
    Object.keys(result.evidence).length > 0
      ? Object.entries(result.evidence)
          .map(([key, value]) => `${key}=${value}`)
          .join(', ')
      : 'kanıt yok'

  return {
    summary: `${result.targetLabel} hedefi için ${params.inferenceFocus} modunda posterior güncellemesi yapıldı.`,
    interpretation:
      `Prior durumunda olumlu hedef olasılığı ${(favorableProbability(result.priorTable) * 100).toFixed(1)}% idi. ${evidenceText} ile posterior ${(favorableProbability(result.posteriorTable) * 100).toFixed(1)}% seviyesine taşındı.`,
    warnings:
      'Posterior değişiminin büyük olması tek başına nedensel kesinlik anlamına gelmez; network yalnızca tanımladığımız bağımlılık yapısını yansıtır.',
    tryNext:
      'Önce single-evidence modunda hangi kök değişkenin hedefi en çok ittiğine bak, sonra multi-evidence modunda birleşik etkinin ne kadar büyüdüğünü karşılaştır.',
  }
}

function buildMetrics(result: BayesianNetworkInferenceResult): SimulationMetric[] {
  return [
    {
      label: 'Target',
      value: result.targetLabel,
      tone: 'primary',
    },
    {
      label: 'Prior P(yes)',
      value: `${(favorableProbability(result.priorTable) * 100).toFixed(1)}%`,
      tone: 'neutral',
    },
    {
      label: 'Posterior P(yes)',
      value: `${(favorableProbability(result.posteriorTable) * 100).toFixed(1)}%`,
      tone: 'secondary',
    },
    {
      label: 'Delta',
      value: `${(result.targetProbabilityDelta * 100).toFixed(1)} pts`,
      tone: result.targetProbabilityDelta >= 0 ? 'tertiary' : 'warning',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Single vs Multi Evidence',
      change: 'Önce single-evidence, sonra multi-evidence moduna geç.',
      expectation: 'Birden fazla kanıt birlikte kullanıldığında posterior kayması daha belirgin olur.',
    },
    {
      title: 'Difficulty Shift',
      change: 'Exam difficulty değerini easy ve hard arasında değiştir.',
      expectation: 'High Grade ve Pass Course olasılıkları difficulty üzerinden anlamlı biçimde yer değiştirir.',
    },
    {
      title: 'Study Habit Etkisi',
      change: 'Study habit değerini low ile high arasında karşılaştır.',
      expectation: 'Recommendation ve high-grade düğümleri aynı kök kanıttan farklı büyüklükte etkilenir.',
    },
  ]
}

function buildTimeline(): SimulationTimeline {
  return {
    frames: [
      { label: 'Prior dağılımı' },
      { label: 'Kanıt seçimi' },
      { label: 'Posterior güncelleme' },
      { label: 'Etki yolu yorumu' },
    ],
  }
}

export function deriveBayesianNetworkInferenceResult(
  params: BayesianNetworkInferenceParams,
): BayesianNetworkInferenceResult {
  const priorTable = tableForTarget(params.targetNode, {})
  const evidenceState = buildEvidence(params, priorTable)
  const posteriorTable = tableForTarget(params.targetNode, evidenceState.evidence)
  const targetProbabilityDelta =
    favorableProbability(posteriorTable) - favorableProbability(priorTable)

  const result: BayesianNetworkInferenceResult = {
    nodes,
    edges,
    cpts: [
      {
        nodeId: 'high-grade',
        summary:
          'Study habit, attendance ve exam difficulty birlikte high-grade olasılığını belirler.',
      },
      {
        nodeId: 'pass-course',
        summary: 'Pass-course, high-grade ve attendance tarafından etkilenir.',
      },
      {
        nodeId: 'gets-recommendation',
        summary: 'Recommendation, pass-course ve study habit bilgisini birleştirir.',
      },
    ],
    evidence: evidenceState.evidence,
    posteriorTable,
    priorTable,
    influencePaths: evidenceState.influencePaths,
    mostInformativeEvidence: evidenceState.mostInformativeEvidence,
    targetProbabilityDelta,
    targetLabel: targetLabels[params.targetNode],
    learning: {
      summary: '',
      interpretation: '',
      warnings: '',
      tryNext: '',
    },
    metrics: [],
    experiments: buildExperiments(),
    timeline: buildTimeline(),
  }

  result.learning = buildLearning(params, result)
  result.metrics = buildMetrics(result)

  return result
}
