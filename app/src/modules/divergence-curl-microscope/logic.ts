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

export interface DivergenceCurlMicroscopeParams extends SimulationParamsBase {
  fieldType: VectorFieldId
  probeX: number
  probeY: number
  probeRadius: number
  sampleCount: number
  probeShape: 'circle' | 'square'
}

export interface ProbeFrame {
  step: number
  point: { x: number; y: number }
  tangent: { x: number; y: number }
  normal: { x: number; y: number }
  field: { x: number; y: number }
  cumulativeFlux: number
  cumulativeCirculation: number
}

export interface DivergenceCurlMicroscopeResult extends SimulationResultBase {
  vectorSamples: Array<{ x: number; y: number; vx: number; vy: number; magnitude: number }>
  probeFrames: ProbeFrame[]
  probeOutline: Array<{ x: number; y: number }>
  cumulativeSeries: Array<{ step: number; flux: number; circulation: number }>
  estimatedDivergence: number
  estimatedCurl: number
  exactDivergence: number
  exactCurl: number
}

function normalize(vector: { x: number; y: number }) {
  const magnitude = Math.hypot(vector.x, vector.y) || 1
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  }
}

function buildProbePoint(
  params: DivergenceCurlMicroscopeParams,
  index: number,
) {
  if (params.probeShape === 'circle') {
    const theta = (index / params.sampleCount) * Math.PI * 2
    return {
      point: {
        x: params.probeX + params.probeRadius * Math.cos(theta),
        y: params.probeY + params.probeRadius * Math.sin(theta),
      },
      tangent: normalize({ x: -Math.sin(theta), y: Math.cos(theta) }),
      normal: normalize({ x: Math.cos(theta), y: Math.sin(theta) }),
      ds: (2 * Math.PI * params.probeRadius) / params.sampleCount,
    }
  }

  const perimeter = params.probeRadius * 8
  const distance = (index / params.sampleCount) * perimeter
  const side = params.probeRadius * 2
  const section = Math.floor(distance / side)
  const local = distance % side
  const r = params.probeRadius

  switch (section) {
    case 0:
      return {
        point: { x: params.probeX - r + local, y: params.probeY - r },
        tangent: { x: 1, y: 0 },
        normal: { x: 0, y: -1 },
        ds: perimeter / params.sampleCount,
      }
    case 1:
      return {
        point: { x: params.probeX + r, y: params.probeY - r + local },
        tangent: { x: 0, y: 1 },
        normal: { x: 1, y: 0 },
        ds: perimeter / params.sampleCount,
      }
    case 2:
      return {
        point: { x: params.probeX + r - local, y: params.probeY + r },
        tangent: { x: -1, y: 0 },
        normal: { x: 0, y: 1 },
        ds: perimeter / params.sampleCount,
      }
    default:
      return {
        point: { x: params.probeX - r, y: params.probeY + r - local },
        tangent: { x: 0, y: -1 },
        normal: { x: -1, y: 0 },
        ds: perimeter / params.sampleCount,
      }
  }
}

function buildTimeline(frames: ProbeFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({ label: `${frame.step}. probe adımı` })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Rotation Alanı',
      change: 'Field type seçimini rotation yap.',
      expectation: 'Circulation hızla büyürken net flux sıfıra yakın kalır; curl baskın hale gelir.',
    },
    {
      title: 'Radial Alan',
      change: 'Field type seçimini radial yap.',
      expectation: 'Probe dışa taşan akışı toplar; flux artar ama circulation küçük kalır.',
    },
    {
      title: 'Probe Boyutu',
      change: 'Probe radius değerini değiştir.',
      expectation: 'Flux ve circulation mutlak olarak değişse de alanla normalize edilen divergence/curl tahminleri daha kararlı kalır.',
    },
  ]
}

export function deriveDivergenceCurlMicroscopeResult(
  params: DivergenceCurlMicroscopeParams,
): DivergenceCurlMicroscopeResult {
  const vectorSamples = sampleRange(-2, 2, 9).flatMap((x) =>
    sampleRange(-2, 2, 9).map((y) => {
      const vector = evaluateVectorField(params.fieldType, x, y)
      return {
        x,
        y,
        vx: vector.x,
        vy: vector.y,
        magnitude: Math.hypot(vector.x, vector.y),
      }
    }),
  )

  let cumulativeFlux = 0
  let cumulativeCirculation = 0
  const probeFrames: ProbeFrame[] = []
  const probeOutline: Array<{ x: number; y: number }> = []

  for (let index = 0; index < params.sampleCount; index += 1) {
    const probe = buildProbePoint(params, index)
    const field = evaluateVectorField(params.fieldType, probe.point.x, probe.point.y)
    cumulativeFlux += (field.x * probe.normal.x + field.y * probe.normal.y) * probe.ds
    cumulativeCirculation += (field.x * probe.tangent.x + field.y * probe.tangent.y) * probe.ds
    probeFrames.push({
      step: index + 1,
      point: probe.point,
      tangent: probe.tangent,
      normal: probe.normal,
      field,
      cumulativeFlux,
      cumulativeCirculation,
    })
    probeOutline.push(probe.point)
  }

  const area =
    params.probeShape === 'circle'
      ? Math.PI * params.probeRadius ** 2
      : (params.probeRadius * 2) ** 2

  return {
    vectorSamples,
    probeFrames,
    probeOutline,
    cumulativeSeries: probeFrames.map((frame) => ({
      step: frame.step,
      flux: frame.cumulativeFlux,
      circulation: frame.cumulativeCirculation,
    })),
    estimatedDivergence: cumulativeFlux / area,
    estimatedCurl: cumulativeCirculation / area,
    exactDivergence: vectorFieldDivergence(params.fieldType),
    exactCurl: vectorFieldCurl(params.fieldType),
    metrics: [
      { label: 'Flux', value: cumulativeFlux.toFixed(3), tone: 'primary' },
      { label: 'Circulation', value: cumulativeCirculation.toFixed(3), tone: 'secondary' },
      { label: 'div F', value: (cumulativeFlux / area).toFixed(3), tone: 'tertiary' },
      { label: 'curl F', value: (cumulativeCirculation / area).toFixed(3), tone: 'neutral' },
    ],
    learning: {
      summary: `${getVectorFieldLabel(params.fieldType)} alanında lokal bir probe üzerinden flux ve circulation biriktirildi.`,
      interpretation:
        params.fieldType === 'rotation'
          ? 'Dönel alanlarda probe boyunca teğetsel akış baskın olduğu için circulation öne çıkar; bu, curl sezgisini doğrudan görünür yapar.'
          : params.fieldType === 'radial'
            ? 'Radial alan dışarı taşan bir akış ürettiği için probe yüzeyinden net çıkış görülür; divergence burada ana niceliktir.'
            : 'Sink alanı içeri toplanan akış üretir; net flux negatif yönde büyür ve divergence işareti tersine döner.',
      warnings:
        params.sampleCount < 12
          ? 'Az örnekli probe, integral tahminini köşeli ve gürültülü yapabilir.'
          : 'Divergence ve curl yerel niceliklerdir; farklı merkez noktalarında benzer alan tipi altında bile farklı integral davranışları görülebilir.',
      tryNext:
        params.probeShape === 'circle'
          ? 'Aynı merkez ve yarıçapla square probe seçip integral yaklaşımının şekilden çok lokal alana bağlı kaldığını karşılaştır.'
          : 'Şimdi probe yarıçapını küçültüp tahminin exact divergence/curl değerlerine daha sıkı yaklaşıp yaklaşmadığını izle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(probeFrames),
  }
}
