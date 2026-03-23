import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  evaluateVectorField,
  getVectorFieldLabel,
  sampleRange,
  vectorFieldCurl,
  vectorFieldDivergence,
  type VectorFieldId,
} from '../shared/calculus'

export interface VectorFieldsParams extends SimulationParamsBase {
  fieldType: string
  pointX: number
  pointY: number
}

export interface VectorSample {
  x: number
  y: number
  vx: number
  vy: number
  magnitude: number
}

export interface VectorFieldsResult extends SimulationResultBase {
  samples: VectorSample[]
  selectedVector: VectorSample
  streamline: Array<{ x: number; y: number }>
  currentVectorFrames: Array<{
    step: number
    point: { x: number; y: number }
    vector: { x: number; y: number }
  }>
}

function buildStreamline(fieldType: VectorFieldId, startX: number, startY: number) {
  const points = [{ x: startX, y: startY }]
  let x = startX
  let y = startY

  for (let step = 0; step < 24; step += 1) {
    const vector = evaluateVectorField(fieldType, x, y)
    const magnitude = Math.hypot(vector.x, vector.y) || 1
    x += (vector.x / magnitude) * 0.18
    y += (vector.y / magnitude) * 0.18
    points.push({ x, y })
  }

  return points
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Alan Değiştir',
      change: 'Radial ve rotation alanları arasında geçiş yap.',
      expectation: 'Birinde akış dışarı itilirken diğerinde noktalar dönme davranışı sergiler.',
    },
    {
      title: 'Nokta Taşı',
      change: 'Seçili noktayı merkeze ve kenarlara götür.',
      expectation: 'Yerel vektör büyüklüğü ve akış çizgisi alanın geometriğine göre değişir.',
    },
    {
      title: 'Divergence / Curl Okuması',
      change: 'Metrics panelini alan görseliyle birlikte oku.',
      expectation: 'Aynı ok deseni altında divergence ile curl sezgisinin farklı şeyler anlattığını görürsün.',
    },
  ]
}

function buildTimeline(
  frames: VectorFieldsResult['currentVectorFrames'],
): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.step}. akış adımı`,
    })),
  }
}

export function deriveVectorFieldsResult(
  params: VectorFieldsParams,
): VectorFieldsResult {
  const fieldType = params.fieldType as VectorFieldId
  const samples = sampleRange(-2, 2, 9).flatMap((x) =>
    sampleRange(-2, 2, 9).map((y) => {
      const vector = evaluateVectorField(fieldType, x, y)
      return {
        x,
        y,
        vx: vector.x,
        vy: vector.y,
        magnitude: Math.hypot(vector.x, vector.y),
      }
    }),
  )

  const selected = evaluateVectorField(fieldType, params.pointX, params.pointY)
  const selectedVector: VectorSample = {
    x: params.pointX,
    y: params.pointY,
    vx: selected.x,
    vy: selected.y,
    magnitude: Math.hypot(selected.x, selected.y),
  }
  const streamline = buildStreamline(fieldType, params.pointX, params.pointY)
  const currentVectorFrames = streamline.map((point, index) => {
    const vector = evaluateVectorField(fieldType, point.x, point.y)
    return {
      step: index + 1,
      point,
      vector,
    }
  })

  return {
    samples,
    selectedVector,
    streamline,
    currentVectorFrames,
    metrics: [
      { label: 'Alan', value: getVectorFieldLabel(fieldType), tone: 'primary' },
      { label: 'Büyüklük', value: selectedVector.magnitude.toFixed(3), tone: 'secondary' },
      { label: 'Divergence', value: vectorFieldDivergence(fieldType).toFixed(1), tone: 'tertiary' },
      { label: 'Curl', value: vectorFieldCurl(fieldType).toFixed(1), tone: 'neutral' },
    ],
    learning: {
      summary: `${getVectorFieldLabel(fieldType)} alanında (${params.pointX.toFixed(1)}, ${params.pointY.toFixed(1)}) noktasındaki yerel vektör incelendi.`,
      interpretation: 'Vektör alanı, her noktaya bir yön ve büyüklük atar. Bu sürümde streamline adım adım ilerlediği için yerel alan bilgisinin zamansal bir akış gibi nasıl okunacağını da görebilirsin.',
      warnings: 'Tek bir ok bütün alanın davranışını özetlemez; divergence ve curl gibi nicelikler alanın küresel karakterini okumaya yardım eder.',
      tryNext: 'Alan tipini değiştirip aynı noktada yerel vektörün nasıl tamamen farklı bir anlam taşıdığını karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(currentVectorFrames),
  }
}
