import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  regionBounds,
  regionContains,
  regionExactArea,
  type RegionId,
} from '../shared/calculus'

export interface MultipleIntegralRegionsParams extends SimulationParamsBase {
  regionType: string
  subdivisions: number
}

export interface RegionCell {
  xCenter: number
  yCenter: number
  included: boolean
  contribution: number
  cumulative: number
  index: number
}

export interface MultipleIntegralRegionsResult extends SimulationResultBase {
  cells: RegionCell[]
  exactArea: number
}

function buildTimeline(cells: RegionCell[]): SimulationTimeline {
  return {
    frames: cells.map((cell) => ({
      label: `${cell.index + 1}. hücre`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Bölge Değiştir',
      change: 'Triangle, disk ve between-curves arasında geçiş yap.',
      expectation: 'Aynı hücreleme mantığının çok farklı sınır geometrilerine uyarlanabildiğini görürsün.',
    },
    {
      title: 'Grid Sıklaştır',
      change: 'Subdivisions değerini artır.',
      expectation: 'Bölge sınırları daha net yakalanır ve alan yaklaşımı gerçek değere yaklaşır.',
    },
    {
      title: 'Maskeyi Oku',
      change: 'Isı haritasında dahil ve dışarıda kalan hücreleri takip et.',
      expectation: 'Çoklu integralde asıl kritik kararın hangi noktaların bölge içinde sayıldığı olduğunu fark edersin.',
    },
  ]
}

export function deriveMultipleIntegralRegionsResult(
  params: MultipleIntegralRegionsParams,
): MultipleIntegralRegionsResult {
  const regionType = params.regionType as RegionId
  const bounds = regionBounds(regionType)
  const dx = (bounds.xMax - bounds.xMin) / params.subdivisions
  const dy = (bounds.yMax - bounds.yMin) / params.subdivisions
  const exactArea = regionExactArea(regionType)
  const cells: RegionCell[] = []
  let cumulative = 0

  for (let row = 0; row < params.subdivisions; row += 1) {
    for (let column = 0; column < params.subdivisions; column += 1) {
      const xCenter = bounds.xMin + (column + 0.5) * dx
      const yCenter = bounds.yMin + (row + 0.5) * dy
      const included = regionContains(regionType, xCenter, yCenter)
      const contribution = included ? dx * dy : 0
      cumulative += contribution
      cells.push({
        xCenter,
        yCenter,
        included,
        contribution,
        cumulative,
        index: row * params.subdivisions + column,
      })
    }
  }

  return {
    cells,
    exactArea,
    metrics: [
      { label: 'Bölge', value: regionType, tone: 'primary' },
      { label: 'Tam Alan', value: exactArea.toFixed(4), tone: 'secondary' },
      {
        label: 'Yaklaşım',
        value: cells.at(-1)?.cumulative.toFixed(4) ?? '0.0000',
        tone: 'tertiary',
      },
      {
        label: 'Hata',
        value: Math.abs((cells.at(-1)?.cumulative ?? 0) - exactArea).toFixed(4),
        tone: Math.abs((cells.at(-1)?.cumulative ?? 0) - exactArea) < 0.2 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `${regionType} bölgesi, hücre bazlı maskeleme ile çoklu integral alanına çevrildi.`,
      interpretation: 'Dikdörtgensel olmayan bölgelerde asıl iş, integrand kadar bölge tanımını da doğru örneklemektir. Hücre maskesi bu sınırı görünür kılar.',
      warnings: 'Kaba grid, eğriyle sınırlı bölgelerde sınırı köşeli gösterir; bu durum hata üretir ve çoklu integral kararını etkiler.',
      tryNext: 'Bölgeyi değiştir ve aynı grid yoğunluğunda hangi geometrinin daha zor örneklendiğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(cells),
  }
}
