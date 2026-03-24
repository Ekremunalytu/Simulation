import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

export interface BiasFairnessExplorerParams extends SimulationParamsBase {
  scenario: 'loan-approval' | 'hiring-screen'
  threshold: number
  fairnessAdjustment: boolean
}

interface CandidateRecord {
  id: string
  group: 'A' | 'B'
  label: 0 | 1
  score: number
}

interface ScenarioDefinition {
  label: string
  adjustmentBoost: number
  mitigatedGroup: 'A' | 'B'
  candidates: CandidateRecord[]
}

export interface EvaluatedCandidate extends CandidateRecord {
  adjustedScore: number
  predicted: boolean
}

export interface GroupMetric {
  group: 'A' | 'B'
  selectionRate: number
  truePositiveRate: number
  falsePositiveRate: number
  precision: number
  approvals: number
}

export interface ThresholdSnapshot {
  threshold: number
  overallAccuracy: number
  overallPrecision: number
  overallRecall: number
  demographicParityGap: number
  equalOpportunityGap: number
  falsePositiveGap: number
  groupMetrics: GroupMetric[]
  evaluatedCandidates: EvaluatedCandidate[]
}

export interface BiasFairnessExplorerResult extends SimulationResultBase {
  scenarioLabel: string
  snapshots: ThresholdSnapshot[]
  selectedThresholdIndex: number
  thresholdSeries: Array<Record<string, number>>
}

const scenarios: Record<BiasFairnessExplorerParams['scenario'], ScenarioDefinition> = {
  'loan-approval': {
    label: 'Loan Approval',
    adjustmentBoost: 0.06,
    mitigatedGroup: 'B',
    candidates: [
      { id: 'A1', group: 'A', label: 1, score: 0.88 },
      { id: 'A2', group: 'A', label: 1, score: 0.81 },
      { id: 'A3', group: 'A', label: 1, score: 0.76 },
      { id: 'A4', group: 'A', label: 1, score: 0.67 },
      { id: 'A5', group: 'A', label: 1, score: 0.59 },
      { id: 'A6', group: 'A', label: 0, score: 0.64 },
      { id: 'A7', group: 'A', label: 0, score: 0.46 },
      { id: 'A8', group: 'A', label: 0, score: 0.38 },
      { id: 'B1', group: 'B', label: 1, score: 0.78 },
      { id: 'B2', group: 'B', label: 1, score: 0.72 },
      { id: 'B3', group: 'B', label: 1, score: 0.61 },
      { id: 'B4', group: 'B', label: 1, score: 0.54 },
      { id: 'B5', group: 'B', label: 1, score: 0.49 },
      { id: 'B6', group: 'B', label: 0, score: 0.58 },
      { id: 'B7', group: 'B', label: 0, score: 0.44 },
      { id: 'B8', group: 'B', label: 0, score: 0.35 },
    ],
  },
  'hiring-screen': {
    label: 'Hiring Screen',
    adjustmentBoost: 0.05,
    mitigatedGroup: 'B',
    candidates: [
      { id: 'A1', group: 'A', label: 1, score: 0.85 },
      { id: 'A2', group: 'A', label: 1, score: 0.79 },
      { id: 'A3', group: 'A', label: 1, score: 0.71 },
      { id: 'A4', group: 'A', label: 1, score: 0.65 },
      { id: 'A5', group: 'A', label: 0, score: 0.68 },
      { id: 'A6', group: 'A', label: 0, score: 0.55 },
      { id: 'A7', group: 'A', label: 0, score: 0.47 },
      { id: 'A8', group: 'A', label: 0, score: 0.36 },
      { id: 'B1', group: 'B', label: 1, score: 0.76 },
      { id: 'B2', group: 'B', label: 1, score: 0.69 },
      { id: 'B3', group: 'B', label: 1, score: 0.58 },
      { id: 'B4', group: 'B', label: 1, score: 0.53 },
      { id: 'B5', group: 'B', label: 0, score: 0.61 },
      { id: 'B6', group: 'B', label: 0, score: 0.52 },
      { id: 'B7', group: 'B', label: 0, score: 0.43 },
      { id: 'B8', group: 'B', label: 0, score: 0.32 },
    ],
  },
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function calculateGroupMetrics(group: 'A' | 'B', evaluated: EvaluatedCandidate[]): GroupMetric {
  const groupItems = evaluated.filter((item) => item.group === group)
  const approvals = groupItems.filter((item) => item.predicted).length
  const positives = groupItems.filter((item) => item.label === 1).length
  const negatives = groupItems.length - positives
  const truePositives = groupItems.filter((item) => item.predicted && item.label === 1).length
  const falsePositives = groupItems.filter((item) => item.predicted && item.label === 0).length

  return {
    group,
    selectionRate: approvals / Math.max(groupItems.length, 1),
    truePositiveRate: truePositives / Math.max(positives, 1),
    falsePositiveRate: falsePositives / Math.max(negatives, 1),
    precision: truePositives / Math.max(approvals, 1),
    approvals,
  }
}

function evaluateScenario(
  scenario: ScenarioDefinition,
  threshold: number,
  fairnessAdjustment: boolean,
): ThresholdSnapshot {
  const evaluated = scenario.candidates.map((candidate) => {
    const adjustedScore =
      fairnessAdjustment && candidate.group === scenario.mitigatedGroup
        ? clamp(candidate.score + scenario.adjustmentBoost, 0, 0.99)
        : candidate.score

    return {
      ...candidate,
      adjustedScore: Number(adjustedScore.toFixed(3)),
      predicted: adjustedScore >= threshold,
    }
  })
  const groupMetrics = (['A', 'B'] as const).map((group) => calculateGroupMetrics(group, evaluated))
  const correct = evaluated.filter((item) => Number(item.predicted) === item.label).length
  const predictedPositives = evaluated.filter((item) => item.predicted).length
  const actualPositives = evaluated.filter((item) => item.label === 1).length
  const truePositives = evaluated.filter((item) => item.predicted && item.label === 1).length

  return {
    threshold: Number(threshold.toFixed(2)),
    overallAccuracy: correct / evaluated.length,
    overallPrecision: truePositives / Math.max(predictedPositives, 1),
    overallRecall: truePositives / Math.max(actualPositives, 1),
    demographicParityGap: Math.abs(
      (groupMetrics[0]?.selectionRate ?? 0) - (groupMetrics[1]?.selectionRate ?? 0),
    ),
    equalOpportunityGap: Math.abs(
      (groupMetrics[0]?.truePositiveRate ?? 0) - (groupMetrics[1]?.truePositiveRate ?? 0),
    ),
    falsePositiveGap: Math.abs(
      (groupMetrics[0]?.falsePositiveRate ?? 0) - (groupMetrics[1]?.falsePositiveRate ?? 0),
    ),
    groupMetrics: groupMetrics.map((metric) => ({
      ...metric,
      selectionRate: Number(metric.selectionRate.toFixed(4)),
      truePositiveRate: Number(metric.truePositiveRate.toFixed(4)),
      falsePositiveRate: Number(metric.falsePositiveRate.toFixed(4)),
      precision: Number(metric.precision.toFixed(4)),
    })),
    evaluatedCandidates: evaluated,
  }
}

function buildThresholdSweep(threshold: number) {
  const candidates = [-0.16, -0.08, 0, 0.08, 0.16].map((offset) =>
    Number(clamp(threshold + offset, 0.3, 0.85).toFixed(2)),
  )

  return [...new Set(candidates)].sort((left, right) => left - right)
}

function buildTimeline(thresholds: number[], initialFrameIndex: number): SimulationTimeline {
  return {
    frames: thresholds.map((threshold) => ({
      label: `Threshold ${threshold.toFixed(2)}`,
    })),
    initialFrameIndex,
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Threshold Yükselt',
      change: 'Threshold değerini 0.70 üstüne taşı ve kabul oranı ile recall arasındaki kırılmayı izle.',
      expectation:
        'Pozitif karar sayısı azalır, precision genelde artar fakat özellikle daha düşük skorlu pozitifler dışarıda kaldığı için recall düşer.',
    },
    {
      title: 'Mitigation Aç',
      change: 'Fairness adjustment toggleını açıp grup B skor bandını tekrar incele.',
      expectation:
        'Seçili grup için kabul oranı ve TPR yükselir; demographic parity ve equal opportunity gap çoğu senaryoda daralır.',
    },
    {
      title: 'Senaryoyu Değiştir',
      change: 'Loan Approval ile Hiring Screen presetlerini aynı threshold bandında karşılaştır.',
      expectation:
        'Aynı metrik adı farklı senaryolarda başka risk profilleri doğurur; fairness gapler bağlama göre yeniden yorumlanmalıdır.',
    },
  ]
}

export function deriveBiasFairnessExplorerResult(
  params: BiasFairnessExplorerParams,
): BiasFairnessExplorerResult {
  const scenario = scenarios[params.scenario]
  const thresholds = buildThresholdSweep(params.threshold)
  const snapshots = thresholds.map((threshold) =>
    evaluateScenario(scenario, threshold, params.fairnessAdjustment),
  )
  const selectedThresholdIndex = thresholds.findIndex(
    (threshold) => threshold === Number(params.threshold.toFixed(2)),
  )
  const selectedSnapshot =
    snapshots[selectedThresholdIndex >= 0 ? selectedThresholdIndex : Math.floor(snapshots.length / 2)]
  const thresholdSeries = snapshots.map((snapshot) => ({
    threshold: snapshot.threshold,
    accuracy: Number(snapshot.overallAccuracy.toFixed(4)),
    precision: Number(snapshot.overallPrecision.toFixed(4)),
    recall: Number(snapshot.overallRecall.toFixed(4)),
    demographicParityGap: Number(snapshot.demographicParityGap.toFixed(4)),
    equalOpportunityGap: Number(snapshot.equalOpportunityGap.toFixed(4)),
  }))

  return {
    scenarioLabel: scenario.label,
    snapshots,
    selectedThresholdIndex:
      selectedThresholdIndex >= 0 ? selectedThresholdIndex : Math.floor(snapshots.length / 2),
    thresholdSeries,
    learning: {
      summary:
        `${scenario.label} senaryosunda threshold ${selectedSnapshot.threshold.toFixed(2)} seviyesinde accuracy ${(selectedSnapshot.overallAccuracy * 100).toFixed(1)}% ve equal opportunity gap ${(selectedSnapshot.equalOpportunityGap * 100).toFixed(1)}% olarak ölçüldü.`,
      interpretation:
        params.fairnessAdjustment
          ? 'Adjustment açıkken sistem belirli bir grup için daha düşük skorlu pozitifleri görünür hale getiriyor; bu fairness gapleri daraltsa da operasyonel dengeyi yeniden kuruyor.'
          : 'Adjustment kapalıyken modelin ham skoru doğrudan karara çevriliyor; bu yaklaşım geçmiş dengesizlikleri olduğu gibi yansıtabilir.',
      warnings:
        selectedSnapshot.demographicParityGap > 0.2
          ? 'Demographic parity gap yüksek; yalnızca toplam başarıya bakmak grup bazlı ayrışmayı maskeleyebilir.'
          : 'Fairness metrikleri yakın görünse bile tek tek aday seviyesindeki hata kalıpları ayrıca incelenmelidir.',
      tryNext:
        'Bu modülden sonra checkpoint sorularını çözerek hangi metrik çatışmasının hangi riskte daha anlamlı olduğunu sabitle.',
    },
    metrics: [
      {
        label: 'Accuracy',
        value: `${(selectedSnapshot.overallAccuracy * 100).toFixed(1)}%`,
        tone: 'primary',
      },
      {
        label: 'Recall',
        value: `${(selectedSnapshot.overallRecall * 100).toFixed(1)}%`,
        tone: 'secondary',
      },
      {
        label: 'DP Gap',
        value: `${(selectedSnapshot.demographicParityGap * 100).toFixed(1)}%`,
        tone: selectedSnapshot.demographicParityGap > 0.15 ? 'warning' : 'tertiary',
      },
      {
        label: 'EO Gap',
        value: `${(selectedSnapshot.equalOpportunityGap * 100).toFixed(1)}%`,
        tone: selectedSnapshot.equalOpportunityGap > 0.15 ? 'warning' : 'neutral',
      },
    ],
    experiments: buildExperiments(),
    timeline: buildTimeline(
      thresholds,
      selectedThresholdIndex >= 0 ? selectedThresholdIndex : Math.floor(snapshots.length / 2),
    ),
  }
}
