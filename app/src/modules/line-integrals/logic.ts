import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  derivativeLineIntegralCurve,
  evaluateLineIntegralCurve,
  evaluateVectorField,
  getLineIntegralCurveLabel,
  getVectorFieldLabel,
  lineIntegralCurveRange,
  sampleRange,
  type LineIntegralCurveId,
  type LineIntegralMode,
  type VectorFieldId,
} from '../shared/calculus'

export interface LineIntegralsParams extends SimulationParamsBase {
  curveType: string
  fieldType: string
  integralMode: string
  steps: number
}

export interface LineIntegralFrame {
  step: number
  t: number
  point: { x: number; y: number }
  tangent: { x: number; y: number }
  field: { x: number; y: number }
  contribution: number
  cumulative: number
}

export interface LineIntegralsResult extends SimulationResultBase {
  path: Array<{ t: number; x: number; y: number }>
  frames: LineIntegralFrame[]
  cumulativeData: Array<{ step: number; cumulative: number }>
}

function buildTimeline(frames: LineIntegralFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.step}. adım · t=${frame.t.toFixed(2)}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Mod Değiştir',
      change: 'Scalar ve work modları arasında aynı eğri/alan için geçiş yap.',
      expectation: 'Aynı geometri üzerinde birikimin anlamı tamamen değişir; biri büyüklük, diğeri yönlü iş ölçer.',
    },
    {
      title: 'Alan Karşılaştır',
      change: 'Rotation ve radial alanları aynı eğri boyunca karşılaştır.',
      expectation: 'Eğriye teğet hizalanan alanlarda iş integrali büyür; dik hizalarda küçülür.',
    },
    {
      title: 'Adım Sayısı',
      change: 'Steps değerini yükselt.',
      expectation: 'Kümülatif integral eğrisi daha düzgün hale gelir ve toplam değer kararlılık kazanır.',
    },
  ]
}

export function deriveLineIntegralsResult(
  params: LineIntegralsParams,
): LineIntegralsResult {
  const curveType = params.curveType as LineIntegralCurveId
  const fieldType = params.fieldType as VectorFieldId
  const integralMode = params.integralMode as LineIntegralMode
  const [start, end] = lineIntegralCurveRange(curveType)
  const stepCount = Math.max(params.steps, 2)
  const dt = (end - start) / stepCount
  let cumulative = 0
  const frames: LineIntegralFrame[] = []

  for (let index = 0; index < stepCount; index += 1) {
    const t = start + (index + 0.5) * dt
    const point = evaluateLineIntegralCurve(curveType, t)
    const tangent = derivativeLineIntegralCurve(curveType, t)
    const field = evaluateVectorField(fieldType, point.x, point.y)
    const speed = Math.hypot(tangent.x, tangent.y)
    const fieldMagnitude = Math.hypot(field.x, field.y)
    const contribution =
      integralMode === 'work'
        ? (field.x * tangent.x + field.y * tangent.y) * dt
        : fieldMagnitude * speed * dt
    cumulative += contribution
    frames.push({
      step: index + 1,
      t,
      point,
      tangent,
      field,
      contribution,
      cumulative,
    })
  }

  return {
    path: sampleRange(start, end, 180).map((t) => ({
      t,
      ...evaluateLineIntegralCurve(curveType, t),
    })),
    frames,
    cumulativeData: frames.map((frame) => ({
      step: frame.step,
      cumulative: frame.cumulative,
    })),
    metrics: [
      { label: 'Eğri', value: getLineIntegralCurveLabel(curveType), tone: 'primary' },
      { label: 'Alan', value: getVectorFieldLabel(fieldType), tone: 'secondary' },
      { label: 'Mod', value: integralMode === 'work' ? 'iş integrali' : 'skaler integral', tone: 'tertiary' },
      { label: 'Toplam', value: cumulative.toFixed(3), tone: 'neutral' },
    ],
    learning: {
      summary: `${getLineIntegralCurveLabel(curveType)} eğrisi boyunca ${integralMode === 'work' ? 'vektör alanı iş integrali' : 'skaler eğrisel integral'} biriktirildi.`,
      interpretation:
        'Eğrisel integral, katkıyı artık eksen boyunca değil eğrinin kendisi boyunca toplar. Yerel tangent yönü bu yüzden merkezi rol oynar.',
      warnings:
        'Aynı alan ve aynı eğri, mod değiştiğinde aynı niceliği ölçmez. İş integrali yön bilgisini, skaler integral ise büyüklük birikimini öne çıkarır.',
      tryNext:
        'Çember üzerinde rotation alanını work modunda dene; alanın eğriyle hizalanması toplam birikimi hızla artıracaktır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
