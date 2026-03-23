import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  exactIntegral,
  evaluateIntegralFunction,
  getIntegralFunctionLabel,
  round,
  sampleFunction,
  type IntegralFunctionId,
  type SamplePoint,
} from '../shared/calculus'

export interface RiemannIntegralParams extends SimulationParamsBase {
  functionType: string
  startX: number
  endX: number
  subdivisions: number
  method: string
}

export interface RiemannRectangle {
  xLeft: number
  xRight: number
  sampleX: number
  height: number
  area: number
}

export interface RiemannFrame {
  rectangles: RiemannRectangle[]
  approximation: number
  error: number
  subdivisions: number
}

export interface RiemannIntegralResult extends SimulationResultBase {
  curve: SamplePoint[]
  frames: RiemannFrame[]
  exactArea: number
  convergenceData: { subdivisions: number; approximation: number; error: number }[]
  interval: { start: number; end: number }
}

function getSamplePoint(method: string, left: number, right: number): number {
  if (method === 'right') {
    return right
  }

  if (method === 'midpoint') {
    return (left + right) / 2
  }

  return left
}

function buildFrame(
  functionType: IntegralFunctionId,
  start: number,
  end: number,
  method: string,
  subdivisions: number,
  exactArea: number,
): RiemannFrame {
  const width = (end - start) / subdivisions
  const rectangles: RiemannRectangle[] = []

  for (let index = 0; index < subdivisions; index += 1) {
    const xLeft = start + index * width
    const xRight = xLeft + width
    const sampleX = getSamplePoint(method, xLeft, xRight)
    const height = evaluateIntegralFunction(functionType, sampleX)
    rectangles.push({
      xLeft,
      xRight,
      sampleX,
      height,
      area: height * width,
    })
  }

  const approximation = rectangles.reduce((sum, rectangle) => sum + rectangle.area, 0)

  return {
    rectangles,
    approximation,
    error: Math.abs(approximation - exactArea),
    subdivisions,
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Yöntem Karşılaştır',
      change: 'Aynı fonksiyonda left ve midpoint yöntemleri arasında geçiş yap.',
      expectation: 'Midpoint yöntemi genelde daha hızlı yakınsar; hata eğrisi daha hızlı küçülür.',
    },
    {
      title: 'Bölmeyi Artır',
      change: 'Subdivisions değerini yükseltip animasyonu tekrar oynat.',
      expectation: 'Dikdörtgenler inceldikçe yaklaşık alan tam integrale daha çok yaklaşır.',
    },
    {
      title: 'Fonksiyon Değiştir',
      change: 'Wave fonksiyonunda sağ toplam kullan.',
      expectation: 'Yerel eğriliğe göre bazı aralıklarda taşma, bazılarında eksik tahmin görürsün.',
    },
  ]
}

function buildTimeline(frames: RiemannFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.subdivisions} dikdörtgen`,
    })),
  }
}

export function deriveRiemannIntegralResult(
  params: RiemannIntegralParams,
): RiemannIntegralResult {
  const start = Math.min(params.startX, params.endX)
  const end = Math.max(params.startX, params.endX)
  const functionType = params.functionType as IntegralFunctionId
  const exactArea = exactIntegral(functionType, start, end)
  const frames: RiemannFrame[] = []

  for (let subdivisions = 1; subdivisions <= params.subdivisions; subdivisions += 1) {
    frames.push(buildFrame(functionType, start, end, params.method, subdivisions, exactArea))
  }

  return {
    curve: sampleFunction(
      (x) => evaluateIntegralFunction(functionType, x),
      start,
      end,
      160,
    ),
    frames,
    exactArea,
    interval: { start, end },
    convergenceData: frames.map((frame) => ({
      subdivisions: frame.subdivisions,
      approximation: round(frame.approximation),
      error: round(frame.error),
    })),
    metrics: [
      { label: 'Tam İntegral', value: exactArea.toFixed(4), tone: 'secondary' },
      {
        label: 'Son Yaklaşım',
        value: frames.at(-1)?.approximation.toFixed(4) ?? '0.0000',
        tone: 'primary',
      },
      {
        label: 'Son Hata',
        value: frames.at(-1)?.error.toFixed(4) ?? '0.0000',
        tone: (frames.at(-1)?.error ?? 1) < 0.05 ? 'secondary' : 'warning',
      },
      {
        label: 'Yöntem',
        value:
          params.method === 'midpoint'
            ? 'Orta Nokta'
            : params.method === 'right'
              ? 'Sağ Toplam'
              : 'Sol Toplam',
        tone: 'neutral',
      },
    ],
    learning: {
      summary: `${getIntegralFunctionLabel(functionType)} fonksiyonu için [${start.toFixed(1)}, ${end.toFixed(1)}] aralığında Riemann toplamları kuruldu.`,
      interpretation:
        params.method === 'midpoint'
          ? 'Orta nokta yöntemi, fonksiyonun yerel ortalamasını daha iyi yakaladığı için çoğu durumda daha hızlı yakınsar.'
          : 'Sol ve sağ toplamlar, fonksiyon artan ya da azalan olduğunda sistematik olarak eksik veya fazla tahmin üretmeye yatkındır.',
      warnings:
        params.subdivisions < 6
          ? 'Az sayıda dikdörtgen, eğriliği kaba temsil eder; görsel sezgi için iyi olsa da sayısal hata büyük kalabilir.'
          : 'Bölme sayısı artsa da integrali anlamak için her dikdörtgenin yüksekliğinin nasıl seçildiğine dikkat etmelisin.',
      tryNext:
        frames.at(-1) && frames.at(-1)!.error < 0.05
          ? 'Şimdi yöntemi değiştir ve aynı doğruluk düzeyine hangi toplamın daha hızlı ulaştığını karşılaştır.'
          : 'Subdivisions değerini artırıp hata eğrisinin nasıl aşağı indiğini izle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
