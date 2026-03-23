import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  exactDoubleIntegral,
  evaluateVolumeSurface,
  getVolumeSurfaceLabel,
  round,
  type VolumeSurfaceId,
} from '../shared/calculus'

export interface DoubleIntegralParams extends SimulationParamsBase {
  surfaceType: string
  extent: number
  subdivisions: number
}

export interface VolumeCell {
  xCenter: number
  yCenter: number
  height: number
  contribution: number
  cumulative: number
  index: number
}

export interface DoubleIntegralResult extends SimulationResultBase {
  cells: VolumeCell[]
  exactValue: number
  heatmapSamples: Array<{ x: number; y: number; height: number; index: number }>
}

function buildTimeline(cells: VolumeCell[]): SimulationTimeline {
  return {
    frames: cells.map((cell) => ({
      label: `${cell.index + 1}. hücre`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Grid Sıklaştır',
      change: 'Subdivisions değerini artırıp animasyonu tekrar oynat.',
      expectation: 'Hücre hacimleri daha ince örneklenecek ve toplam değer tam integrale daha çok yaklaşacak.',
    },
    {
      title: 'Yüzey Değiştir',
      change: 'Plane ve bowl yüzeyleri arasında geçiş yap.',
      expectation: 'Lineer yüzeyde katkı dağılımı dengeli, bowl yüzeyde ise kenarlarda daha yüksek olur.',
    },
    {
      title: 'Bölgeyi Genişlet',
      change: 'Extent değerini artır.',
      expectation: 'Hem toplam alan büyür hem de yüzey yüksekliği daha geniş örneklendiği için toplam hacim hızla artar.',
    },
  ]
}

export function deriveDoubleIntegralResult(
  params: DoubleIntegralParams,
): DoubleIntegralResult {
  const surfaceType = params.surfaceType as VolumeSurfaceId
  const xMin = -params.extent
  const xMax = params.extent
  const yMin = -params.extent
  const yMax = params.extent
  const dx = (xMax - xMin) / params.subdivisions
  const dy = (yMax - yMin) / params.subdivisions
  const cells: VolumeCell[] = []
  let cumulative = 0

  for (let row = 0; row < params.subdivisions; row += 1) {
    for (let column = 0; column < params.subdivisions; column += 1) {
      const xCenter = xMin + (column + 0.5) * dx
      const yCenter = yMin + (row + 0.5) * dy
      const height = evaluateVolumeSurface(surfaceType, xCenter, yCenter)
      const contribution = height * dx * dy
      cumulative += contribution
      cells.push({
        xCenter,
        yCenter,
        height,
        contribution,
        cumulative,
        index: row * params.subdivisions + column,
      })
    }
  }

  const exactValue = exactDoubleIntegral(surfaceType, xMin, xMax, yMin, yMax)

  return {
    cells,
    exactValue,
    heatmapSamples: cells.map((cell) => ({
      x: cell.xCenter,
      y: cell.yCenter,
      height: round(cell.height),
      index: cell.index,
    })),
    metrics: [
      { label: 'Tam Değer', value: exactValue.toFixed(4), tone: 'secondary' },
      {
        label: 'Yaklaşım',
        value: cumulative.toFixed(4),
        tone: 'primary',
      },
      {
        label: 'Hata',
        value: Math.abs(cumulative - exactValue).toFixed(4),
        tone: Math.abs(cumulative - exactValue) < 0.1 ? 'secondary' : 'warning',
      },
      { label: 'Hücre', value: String(cells.length), tone: 'neutral' },
    ],
    learning: {
      summary: `${getVolumeSurfaceLabel(surfaceType)} yüzeyi, [-${params.extent}, ${params.extent}]² bölgesinde hücre bazlı örneklendi.`,
      interpretation:
        'Çift katlı integral, tek değişkenli Riemann toplamının iki boyuta genişlemiş halidir. Her hücre taban alanı ile yüzey yüksekliğinin çarpımı küçük bir hacim katkısı verir.',
      warnings:
        params.subdivisions < 5
          ? 'Kaba grid, yüzey değişimini tam yakalayamaz; özellikle ripple gibi dalgalı yüzeylerde hata daha görünür olur.'
          : 'Hücre yüksekliğinin orta nokta örneğiyle alınması, yöntemi iyi dengeler ama yine de sonlu grid sınırlaması vardır.',
      tryNext:
        Math.abs(cumulative - exactValue) < 0.1
          ? 'Şimdi yüzeyi değiştir ve aynı grid yoğunluğunda hangi yüzeyin daha zor yakalandığını karşılaştır.'
          : 'Subdivisions değerini büyüterek hata eğrisinin nasıl düştüğünü izle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(cells),
  }
}
