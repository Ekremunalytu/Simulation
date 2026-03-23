import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import { sampleRange } from '../shared/calculus'

export interface FourierSeriesBuilderParams extends SimulationParamsBase {
  waveType: 'square' | 'sawtooth' | 'triangle'
  harmonics: number
  amplitude: number
  period: number
  phaseShift: number
}

export interface FourierFrame {
  harmonic: number
  curve: Array<{ x: number; target: number; approximation: number }>
  spectrum: Array<{ harmonic: number; coefficient: number }>
  rmse: number
  overshoot: number
}

export interface FourierSeriesBuilderResult extends SimulationResultBase {
  frames: FourierFrame[]
  errorSeries: Array<{ harmonic: number; rmse: number }>
}

function basePhase(x: number, period: number, phaseShift: number) {
  return ((x + phaseShift) / period) * 2 * Math.PI
}

function targetWave(
  type: FourierSeriesBuilderParams['waveType'],
  x: number,
  amplitude: number,
  period: number,
  phaseShift: number,
) {
  const phase = basePhase(x, period, phaseShift)

  if (type === 'square') {
    return Math.sin(phase) >= 0 ? amplitude : -amplitude
  }

  if (type === 'sawtooth') {
    const wrapped = ((phase + Math.PI) % (2 * Math.PI)) - Math.PI
    return (amplitude / Math.PI) * wrapped
  }

  return (2 * amplitude / Math.PI) * Math.asin(Math.sin(phase))
}

function harmonicCoefficient(
  type: FourierSeriesBuilderParams['waveType'],
  n: number,
  amplitude: number,
) {
  if (type === 'square') {
    return n % 2 === 0 ? 0 : (4 * amplitude) / (Math.PI * n)
  }

  if (type === 'sawtooth') {
    return ((2 * amplitude) / Math.PI) * (((-1) ** (n + 1)) / n)
  }

  return n % 2 === 0 ? 0 : ((8 * amplitude) / (Math.PI ** 2)) * (((-1) ** ((n - 1) / 2)) / (n ** 2))
}

function partialSum(
  type: FourierSeriesBuilderParams['waveType'],
  x: number,
  amplitude: number,
  period: number,
  phaseShift: number,
  harmonics: number,
) {
  const phase = basePhase(x, period, phaseShift)
  let sum = 0

  for (let harmonic = 1; harmonic <= harmonics; harmonic += 1) {
    sum += harmonicCoefficient(type, harmonic, amplitude) * Math.sin(harmonic * phase)
  }

  return sum
}

function buildTimeline(frames: FourierFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({ label: `${frame.harmonic}. harmonic` })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Square Wave Gibbs',
      change: 'Wave typeı square yapıp harmonic sayısını artır.',
      expectation: 'Köşeler keskinleşir ama sıçrama yakınındaki overshoot tamamen kaybolmaz.',
    },
    {
      title: 'Triangle Yumuşaklığı',
      change: 'Wave typeı triangle seç.',
      expectation: 'Katsayılar daha hızlı söner; aynı harmonic sayısında daha düzgün yaklaşım oluşur.',
    },
    {
      title: 'Periyot Kaydır',
      change: 'Phase shift değerini değiştir.',
      expectation: 'Harmoniklerin genliği aynı kalır ama dalga uzayda kayar.',
    },
  ]
}

export function deriveFourierSeriesBuilderResult(
  params: FourierSeriesBuilderParams,
): FourierSeriesBuilderResult {
  const domain = sampleRange(-params.period, params.period, 180)
  const frames: FourierFrame[] = []

  for (let harmonic = 1; harmonic <= params.harmonics; harmonic += 1) {
    const curve = domain.map((x) => ({
      x,
      target: targetWave(params.waveType, x, params.amplitude, params.period, params.phaseShift),
      approximation: partialSum(
        params.waveType,
        x,
        params.amplitude,
        params.period,
        params.phaseShift,
        harmonic,
      ),
    }))
    const rmse = Math.sqrt(
      curve.reduce((sum, point) => sum + (point.target - point.approximation) ** 2, 0) / curve.length,
    )
    const overshoot = Math.max(...curve.map((point) => point.approximation)) - params.amplitude
    frames.push({
      harmonic,
      curve,
      spectrum: Array.from({ length: harmonic }, (_, index) => {
        const order = index + 1
        return {
          harmonic: order,
          coefficient: harmonicCoefficient(params.waveType, order, params.amplitude),
        }
      }),
      rmse,
      overshoot,
    })
  }

  const finalFrame = frames.at(-1) as FourierFrame

  return {
    frames,
    errorSeries: frames.map((frame) => ({
      harmonic: frame.harmonic,
      rmse: Number(frame.rmse.toFixed(6)),
    })),
    metrics: [
      { label: 'Wave', value: params.waveType, tone: 'primary' },
      { label: 'Harmonics', value: String(params.harmonics), tone: 'secondary' },
      { label: 'RMSE', value: finalFrame.rmse.toFixed(3), tone: 'tertiary' },
      { label: 'Overshoot', value: finalFrame.overshoot.toFixed(3), tone: 'neutral' },
    ],
    learning: {
      summary: `${params.waveType} dalgası, harmonikler kademeli eklenerek trigonometrik bir kısmi toplamla yeniden kuruldu.`,
      interpretation:
        params.waveType === 'triangle'
          ? 'Daha düzgün dalgalar daha hızlı yakınsar; bu yüzden triangle serisinde az sayıda harmonik bile yüksek kalite üretir.'
          : params.waveType === 'square'
            ? 'Square wave, süreksizlik nedeniyle harmonikler artsa da sıçrama çevresinde Gibbs benzeri taşmalar bırakır.'
            : 'Sawtooth dalga tüm harmonikleri kullanır; spektrum daha yavaş söndüğü için yaklaşımın incelmesi daha kademeli görünür.',
      warnings:
        params.harmonics < 4
          ? 'Az harmonikli toplam yalnızca kaba şekli yakalar; köşe ve geçiş bölgelerinde hata büyük kalır.'
          : 'Harmonik sayısını artırmak genelde faydalıdır ama süreksiz dalgalarda yerel overshoot tamamen yok olmaz.',
      tryNext:
        params.waveType === 'square'
          ? 'Triangle dalgaya geçip aynı harmonic sayısında spektrumun ne kadar daha hızlı söndüğünü karşılaştır.'
          : 'Square wave seçip Gibbs taşmasının harmonic sayısı artsa bile nasıl dirençli kaldığını izle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
