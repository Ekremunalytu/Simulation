import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { round, sampleRange, type SamplePoint } from '../shared/calculus'

export interface LimitExplorerParams extends SimulationParamsBase {
  functionType: string
  approachPoint: number
  direction: string
  zoom: number
}

export interface ProbePoint {
  x: number
  y: number
  side: 'left' | 'right'
}

export interface LimitApproachFrame {
  offset: number
  visibleProbes: ProbePoint[]
  currentLeftProbe: ProbePoint | null
  currentRightProbe: ProbePoint | null
}

export interface LimitExplorerResult extends SimulationResultBase {
  curve: SamplePoint[]
  frames: LimitApproachFrame[]
  leftEstimate: number | null
  rightEstimate: number | null
  limitValue: number | null
  pointValue: number | null
  leftDisplay: string
  rightDisplay: string
  twoSidedDisplay: string
  holePoint: { x: number; y: number } | null
  definedPoint: { x: number; y: number } | null
  classification: 'removable' | 'jump' | 'asymptotic'
}

function classifyFunction(functionType: string): LimitExplorerResult['classification'] {
  switch (functionType) {
    case 'jump':
      return 'jump'
    case 'asymptote':
      return 'asymptotic'
    default:
      return 'removable'
  }
}

function evaluateLimitFunction(
  functionType: string,
  x: number,
  approachPoint: number,
): number {
  const t = x - approachPoint

  switch (functionType) {
    case 'jump':
      return x < approachPoint ? 1 : 3
    case 'asymptote':
      return 1 / t
    default:
      if (Math.abs(t) < 1e-9) {
        return Number.NaN
      }

      return x + approachPoint
  }
}

function getPointValue(functionType: string, approachPoint: number): number | null {
  switch (functionType) {
    case 'jump':
      return 2
    case 'asymptote':
      return null
    default:
      return 2 * approachPoint + 1
  }
}

function buildCurve(
  functionType: string,
  approachPoint: number,
  zoom: number,
): SamplePoint[] {
  const xMin = approachPoint - zoom
  const xMax = approachPoint + zoom

  return sampleRange(xMin, xMax, 220).map((x) => {
    const y = evaluateLimitFunction(functionType, x, approachPoint)
    if (!Number.isFinite(y) || Math.abs(y) > 25) {
      return { x, y: null }
    }

    return { x, y }
  })
}

function buildOffsets(zoom: number): number[] {
  return [0.6, 0.32, 0.16, 0.08, 0.035, 0.012].map((ratio) =>
    round(Math.max(zoom * ratio, 0.004), 4),
  )
}

function buildFrames(
  functionType: string,
  approachPoint: number,
  zoom: number,
  direction: string,
): LimitApproachFrame[] {
  const offsets = buildOffsets(zoom)
  const leftVisible: ProbePoint[] = []
  const rightVisible: ProbePoint[] = []

  return offsets.map((offset) => {
    let currentLeftProbe: ProbePoint | null = null
    let currentRightProbe: ProbePoint | null = null

    if (direction !== 'right') {
      const x = approachPoint - offset
      const y = evaluateLimitFunction(functionType, x, approachPoint)
      if (Number.isFinite(y) && Math.abs(y) <= 25) {
        currentLeftProbe = { x, y, side: 'left' }
        leftVisible.push(currentLeftProbe)
      }
    }

    if (direction !== 'left') {
      const x = approachPoint + offset
      const y = evaluateLimitFunction(functionType, x, approachPoint)
      if (Number.isFinite(y) && Math.abs(y) <= 25) {
        currentRightProbe = { x, y, side: 'right' }
        rightVisible.push(currentRightProbe)
      }
    }

    return {
      offset,
      visibleProbes: [...leftVisible, ...rightVisible],
      currentLeftProbe,
      currentRightProbe,
    }
  })
}

function estimateSide(
  functionType: string,
  approachPoint: number,
  zoom: number,
  side: 'left' | 'right',
): number | null {
  if (functionType === 'asymptote') {
    return null
  }

  const offset = Math.min(zoom * 0.012, 0.004)
  const x = side === 'left' ? approachPoint - offset : approachPoint + offset
  return round(evaluateLimitFunction(functionType, x, approachPoint), 3)
}

function formatSideDisplay(
  functionType: string,
  approachPoint: number,
  zoom: number,
  side: 'left' | 'right',
  estimate: number | null,
): string {
  if (functionType !== 'asymptote') {
    return estimate === null ? 'Tanımsız' : estimate.toFixed(3)
  }

  const offset = Math.min(zoom * 0.012, 0.004)
  const x = side === 'left' ? approachPoint - offset : approachPoint + offset
  const y = evaluateLimitFunction(functionType, x, approachPoint)
  return y > 0 ? '+∞' : '-∞'
}

function buildTimeline(frames: LimitApproachFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame, index) => ({
      label: `${index + 1}. yaklaşım · |x-a|=${frame.offset.toFixed(3)}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Delik ile Yanılsama',
      change: 'Removable davranışını seçip yaklaşım noktasını değiştir.',
      expectation: 'Grafikte açık daire ve dolu nokta ayrışır; limitin gerçek değerle değil komşu davranışla geldiğini görürsün.',
    },
    {
      title: 'Sıçrama Kararı',
      change: 'Jump fonksiyonunda iki taraflı oynatmayı sona kadar izle.',
      expectation: 'Soldaki ve sağdaki örneklerin farklı yüksekliklerde sabitlendiğini göreceksin; ortak limit oluşmayacak.',
    },
    {
      title: 'Asimptot İşareti',
      change: 'Asymptote seçip soldan ve sağdan ayrı ayrı oyna.',
      expectation: 'Bir tarafta -∞, diğer tarafta +∞ eğilimi oluşur; “yok” demek yerine sonsuza hangi işaretle gittiği görünür.',
    },
  ]
}

export function deriveLimitExplorerResult(
  params: LimitExplorerParams,
): LimitExplorerResult {
  const zoom = Math.max(params.zoom, 0.35)
  const curve = buildCurve(params.functionType, params.approachPoint, zoom)
  const frames = buildFrames(
    params.functionType,
    params.approachPoint,
    zoom,
    params.direction,
  )
  const leftEstimate = estimateSide(
    params.functionType,
    params.approachPoint,
    zoom,
    'left',
  )
  const rightEstimate = estimateSide(
    params.functionType,
    params.approachPoint,
    zoom,
    'right',
  )
  const limitValue =
    leftEstimate !== null &&
    rightEstimate !== null &&
    Math.abs(leftEstimate - rightEstimate) < 0.02
      ? round((leftEstimate + rightEstimate) / 2, 3)
      : null
  const classification = classifyFunction(params.functionType)
  const pointValue = getPointValue(params.functionType, params.approachPoint)
  const leftDisplay = formatSideDisplay(
    params.functionType,
    params.approachPoint,
    zoom,
    'left',
    leftEstimate,
  )
  const rightDisplay = formatSideDisplay(
    params.functionType,
    params.approachPoint,
    zoom,
    'right',
    rightEstimate,
  )
  const twoSidedDisplay =
    limitValue !== null
      ? limitValue.toFixed(3)
      : classification === 'asymptotic'
        ? 'Sonsuza gidiyor'
        : 'Oluşmuyor'

  const removableTarget = 2 * params.approachPoint

  return {
    curve,
    frames,
    leftEstimate,
    rightEstimate,
    limitValue,
    pointValue,
    leftDisplay,
    rightDisplay,
    twoSidedDisplay,
    holePoint:
      classification === 'removable'
        ? { x: params.approachPoint, y: removableTarget }
        : null,
    definedPoint:
      pointValue !== null
        ? { x: params.approachPoint, y: pointValue }
        : null,
    classification,
    metrics: [
      { label: 'Sol Limit', value: leftDisplay, tone: 'primary' },
      { label: 'Sağ Limit', value: rightDisplay, tone: 'secondary' },
      {
        label: 'İki Taraflı',
        value: twoSidedDisplay,
        tone: limitValue !== null ? 'tertiary' : 'warning',
      },
      {
        label: 'Davranış',
        value:
          classification === 'removable'
            ? 'Delikli süreksizlik'
            : classification === 'jump'
              ? 'Sıçrama süreksizliği'
              : 'Düşey asimptot',
        tone: 'neutral',
      },
    ],
    learning: {
      summary:
        classification === 'removable'
          ? `x -> ${params.approachPoint.toFixed(2)} iken örnek noktalar aynı yüksekliğe toplanıyor; fakat fonksiyonun tanımlı noktası özellikle başka yerde tutuluyor.`
          : classification === 'jump'
            ? `x -> ${params.approachPoint.toFixed(2)} yaklaşımında iki tarafın örnekleri farklı yatay bantlarda kalıyor.`
            : `x -> ${params.approachPoint.toFixed(2)} yaklaşımında değerler sonlu bir sayıya değil işaretli sonsuza doğru patlıyor.`,
      interpretation:
        classification === 'removable'
          ? 'Bu modülde açık daire limitin gerçek hedefini, dolu nokta ise fonksiyonun o noktada tanımlı değerini gösterir. İkisi farklı olabilir.'
          : classification === 'jump'
            ? 'İki taraflı limitin var olabilmesi için her frame sonunda iki tarafın aynı seviyeye yaklaşması gerekir; burada bu koşul bozulur.'
            : 'Asimptotlu durumda “limit yok” demek tek başına zayıf kalır; hangi tarafta +∞, hangi tarafta -∞ davranışı olduğunu ayrıca okumak gerekir.',
      warnings:
        params.direction === 'both'
          ? 'Sadece son kartlara değil, yaklaşım animasyonundaki iki tarafın eşzamanlı hareketine bak. Limit kararı burada verilir.'
          : 'Tek taraflı modda gördüğün şey yalnızca bir yüzdür; iki taraflı limit için diğer yönü de kontrol etmelisin.',
      tryNext:
        classification === 'removable'
          ? 'Şimdi jump moduna geç ve açık deliğin yerini gerçek bir yükseklik farkının aldığını karşılaştır.'
          : 'Aynı parametrelerle yönü değiştirip tek taraflı davranışın karar mekanizmasını nasıl değiştirdiğini gözlemle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
