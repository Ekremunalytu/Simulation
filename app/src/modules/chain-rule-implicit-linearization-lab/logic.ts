import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { sampleRange } from '../shared/calculus'

type ScenarioId = 'chain' | 'implicit' | 'linearization'

export interface ChainRuleImplicitLinearizationLabParams extends SimulationParamsBase {
  scenario: ScenarioId
  anchor: number
  neighborhood: number
  steps: number
}

export interface ApproximationSample {
  input: number
  exact: number
  approximation: number
}

export interface ChainRuleFrame {
  offset: number
  input: number
  exact: number
  approximation: number
  error: number
}

export interface ChainRuleImplicitLinearizationLabResult extends SimulationResultBase {
  scenarioLabel: string
  axisLabel: string
  anchorInput: number
  anchorOutput: number
  localSlope: number
  derivativeBreakdown: string
  approximationSamples: ApproximationSample[]
  frames: ChainRuleFrame[]
}

function chainFunction(x: number) {
  return Math.sin(x * x + 0.5 * x)
}

function chainDerivative(x: number) {
  const inner = x * x + 0.5 * x
  return Math.cos(inner) * (2 * x + 0.5)
}

function implicitY(x: number) {
  const discriminant = Math.max(0, 28 - 3 * x * x)
  return (-x + Math.sqrt(discriminant)) / 2
}

function implicitDerivative(x: number) {
  const y = implicitY(x)
  return -(2 * x + y) / (x + 2 * y)
}

function planeFunction(x: number, y: number) {
  return x * Math.exp(y) + y * y
}

function planeGradient(x: number, y: number) {
  return {
    fx: Math.exp(y),
    fy: x * Math.exp(y) + 2 * y,
  }
}

function buildOffsets(neighborhood: number, steps: number) {
  return sampleRange(-neighborhood, neighborhood, steps)
}

function buildTimeline(frames: ChainRuleFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `Δ ${frame.offset >= 0 ? '+' : ''}${frame.offset.toFixed(2)}`,
    })),
    initialFrameIndex: Math.floor(frames.length / 2),
  }
}

function buildExperiments(scenario: ScenarioId): GuidedExperiment[] {
  if (scenario === 'implicit') {
    return [
      {
        title: 'Eğim İşareti',
        change: 'Anchor değerini negatiften pozitife taşı.',
        expectation:
          'Aynı implicit eğri üzerinde teğet eğiminin işaret ve büyüklüğünün nasıl değiştiğini karşılaştırırsın.',
      },
      {
        title: 'Yerel Yaklaşım Bandı',
        change: 'Komşuluk değerini büyüt.',
        expectation:
          'Tangent doğrusu kısa mesafede iyi çalışırken uzaklaşınca hata görünür biçimde büyür.',
      },
    ]
  }

  if (scenario === 'linearization') {
    return [
      {
        title: 'Yakın Nokta Avantajı',
        change: 'Komşuluk değerini 0.4 civarına düşür.',
        expectation:
          'Tangent plane yaklaşımı özellikle anchor noktasına yakın örneklerde çok daha güçlü hale gelir.',
      },
      {
        title: 'Eğim Kaynağı',
        change: 'Anchor değerini değiştir.',
        expectation:
          'fx ve fy birlikte değiştiği için lineer yaklaşım yönünün de yeniden şekillendiğini görürsün.',
      },
    ]
  }

  return [
    {
      title: 'İç ve Dış Türev',
      change: 'Anchor değerini 0 civarından uzaklaştır.',
      expectation:
        'İç fonksiyonun eğimi ile dış fonksiyonun duyarlılığı birlikte değiştiği için toplam türev de sert biçimde oynar.',
    },
    {
      title: 'Tangent Gücü',
      change: 'Komşuluk aralığını genişlet.',
      expectation:
        'Tangent doğrusunun iyi bir yerel yaklaşım olduğu ama uzak noktalarda sapma verdiği daha net görünür.',
    },
  ]
}

export function deriveChainRuleImplicitLinearizationLabResult(
  params: ChainRuleImplicitLinearizationLabParams,
): ChainRuleImplicitLinearizationLabResult {
  const safeAnchor = Math.max(-1.6, Math.min(1.6, params.anchor))
  const offsets = buildOffsets(params.neighborhood, params.steps)
  let scenarioLabel = 'Chain Rule'
  let axisLabel = 'x'
  let anchorInput = safeAnchor
  let anchorOutput = 0
  let localSlope = 0
  let derivativeBreakdown = ''
  let approximationSamples: ApproximationSample[] = []
  const frames: ChainRuleFrame[] = []

  if (params.scenario === 'implicit') {
    scenarioLabel = 'Implicit Differentiation'
    anchorInput = Math.max(-2.2, Math.min(2.2, safeAnchor * 1.4))
    anchorOutput = implicitY(anchorInput)
    localSlope = implicitDerivative(anchorInput)
    derivativeBreakdown = `dy/dx = -(2x + y) / (x + 2y) => ${localSlope.toFixed(3)}`

    approximationSamples = sampleRange(anchorInput - params.neighborhood, anchorInput + params.neighborhood, 48).map((x) => {
      const exact = implicitY(x)
      const approximation = anchorOutput + localSlope * (x - anchorInput)
      return { input: x, exact, approximation }
    })

    offsets.forEach((offset) => {
      const input = anchorInput + offset
      const exact = implicitY(input)
      const approximation = anchorOutput + localSlope * offset
      frames.push({
        offset,
        input,
        exact,
        approximation,
        error: Math.abs(exact - approximation),
      })
    })
  } else if (params.scenario === 'linearization') {
    scenarioLabel = 'Linearization'
    axisLabel = 't'
    const anchorY = safeAnchor / 2
    anchorOutput = planeFunction(safeAnchor, anchorY)
    const gradient = planeGradient(safeAnchor, anchorY)
    localSlope = Math.sqrt(gradient.fx ** 2 + gradient.fy ** 2)
    derivativeBreakdown = `fx=${gradient.fx.toFixed(3)}, fy=${gradient.fy.toFixed(3)}`

    approximationSamples = sampleRange(-params.neighborhood, params.neighborhood, 48).map((t) => {
      const x = safeAnchor + t
      const y = anchorY - t / 2
      const exact = planeFunction(x, y)
      const approximation =
        anchorOutput + gradient.fx * (x - safeAnchor) + gradient.fy * (y - anchorY)
      return { input: t, exact, approximation }
    })

    offsets.forEach((offset) => {
      const x = safeAnchor + offset
      const y = anchorY - offset / 2
      const exact = planeFunction(x, y)
      const approximation =
        anchorOutput + gradient.fx * (x - safeAnchor) + gradient.fy * (y - anchorY)
      frames.push({
        offset,
        input: offset,
        exact,
        approximation,
        error: Math.abs(exact - approximation),
      })
    })
  } else {
    anchorOutput = chainFunction(safeAnchor)
    localSlope = chainDerivative(safeAnchor)
    const inner = safeAnchor * safeAnchor + 0.5 * safeAnchor
    derivativeBreakdown = `g(x)=${inner.toFixed(3)}, f'(g(x))=${Math.cos(inner).toFixed(3)}, g'(x)=${(2 * safeAnchor + 0.5).toFixed(3)}`

    approximationSamples = sampleRange(safeAnchor - params.neighborhood, safeAnchor + params.neighborhood, 48).map((x) => {
      const exact = chainFunction(x)
      const approximation = anchorOutput + localSlope * (x - safeAnchor)
      return { input: x, exact, approximation }
    })

    offsets.forEach((offset) => {
      const input = safeAnchor + offset
      const exact = chainFunction(input)
      const approximation = anchorOutput + localSlope * offset
      frames.push({
        offset,
        input,
        exact,
        approximation,
        error: Math.abs(exact - approximation),
      })
    })
  }

  const maxError = Math.max(...frames.map((frame) => frame.error))

  return {
    scenarioLabel,
    axisLabel,
    anchorInput,
    anchorOutput,
    localSlope,
    derivativeBreakdown,
    approximationSamples,
    frames,
    metrics: [
      { label: 'Senaryo', value: scenarioLabel, tone: 'primary' },
      { label: 'Anchor Çıktı', value: anchorOutput.toFixed(3), tone: 'secondary' },
      { label: 'Yerel Eğim', value: localSlope.toFixed(3), tone: 'tertiary' },
      {
        label: 'Maks Error',
        value: maxError.toFixed(3),
        tone: maxError < 0.25 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `${scenarioLabel} senaryosu anchor noktası çevresinde ${params.steps} örnekle incelendi.`,
      interpretation:
        params.scenario === 'linearization'
          ? 'Tangent plane, yüzeyin anchor noktasındaki ilk dereceden davranışını taşır. Yakın çevrede güçlü; uzaklaştıkça yetersizdir.'
          : 'Yerel türev bilgisi, ister bileşik yapı ister implicit eğri olsun, anchor noktasındaki en iyi doğrusal davranışı verir.',
      warnings:
        maxError > 0.4
          ? 'Komşuluk genişledikçe doğrusal yaklaşımın sınırı belirginleşir; türev bilgisi tek başına global şekli taşımaz.'
          : 'Yakın çevrede hata küçük olsa da bu, fonksiyonun tüm bölgede lineer davrandığı anlamına gelmez.',
      tryNext:
        params.scenario === 'chain'
          ? 'Implicit veya linearization senaryosuna geçip aynı yerel yaklaşım fikrinin nasıl başka yüzeylerde tekrar kullanıldığını karşılaştır.'
          : 'Anchor noktasını değiştirip aynı formülün farklı geometri üzerinde nasıl başka eğimler ürettiğini incele.',
    },
    experiments: buildExperiments(params.scenario),
    timeline: buildTimeline(frames),
  }
}
