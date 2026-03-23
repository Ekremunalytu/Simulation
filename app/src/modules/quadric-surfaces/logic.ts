import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  describeQuadricSection,
  getQuadricEquation,
  getQuadricLabel,
  quadricSliceAxes,
  quadricSliceRange,
  sampleQuadricSection,
  type QuadricSliceVariable,
  type QuadricSurfaceId,
} from '../shared/calculus'

export interface QuadricSurfacesParams extends SimulationParamsBase {
  quadricType: string
  sliceVariable: string
  sliceValue: number
}

export interface QuadricSectionFrame {
  sliceValue: number
  sectionData: Array<{ u: number; upper: number | null; lower: number | null }>
}

export interface QuadricSurfacesResult extends SimulationResultBase {
  equation: string
  horizontalAxis: string
  verticalAxis: string
  planeLabel: string
  sectionData: Array<{ u: number; upper: number | null; lower: number | null }>
  frames: QuadricSectionFrame[]
}

function buildTimeline(frames: QuadricSectionFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame, index) => ({
      label: `${index + 1}. kesit · sabit=${frame.sliceValue.toFixed(2)}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Kesit Düzlemi',
      change: 'Aynı yüzeyde x, y ve z sabit kesitlerini sırayla karşılaştır.',
      expectation: 'Kesit yönü değiştikçe aynı kuadratik yüzey bambaşka 2B geometrilere açılır.',
    },
    {
      title: 'Değeri Kaydır',
      change: 'Slice value değerini uçlara taşı.',
      expectation: 'Bazı kesitler küçülür, bazıları kaybolur, bazıları iki kola ayrılır.',
    },
    {
      title: 'Yüzey Tipi',
      change: 'Küre ile eliptik paraboloid arasında geçiş yap.',
      expectation: 'Kapalı ve açık yüzeylerin kesitleri arasında net bir fark görürsün.',
    },
  ]
}

export function deriveQuadricSurfacesResult(
  params: QuadricSurfacesParams,
): QuadricSurfacesResult {
  const quadricType = params.quadricType as QuadricSurfaceId
  const sliceVariable = params.sliceVariable as QuadricSliceVariable
  const axes = quadricSliceAxes(sliceVariable)
  const sectionData = sampleQuadricSection(quadricType, sliceVariable, params.sliceValue)
  const [rangeMin, rangeMax] = quadricSliceRange(quadricType)
  const frames = [-0.5, -0.2, 0, 0.2, 0.5].map((ratio) => {
    const sliceValue = params.sliceValue + ratio * (rangeMax - rangeMin)
    return {
      sliceValue,
      sectionData: sampleQuadricSection(quadricType, sliceVariable, sliceValue),
    }
  })
  const visibleCount = sectionData.filter(
    (point) => point.upper !== null || point.lower !== null,
  ).length

  return {
    equation: getQuadricEquation(quadricType),
    horizontalAxis: axes.horizontal,
    verticalAxis: axes.vertical,
    planeLabel: axes.plane,
    sectionData,
    frames,
    metrics: [
      { label: 'Yüzey', value: getQuadricLabel(quadricType), tone: 'primary' },
      { label: 'Kesit Düzlemi', value: axes.plane, tone: 'secondary' },
      { label: 'Sabit Değer', value: params.sliceValue.toFixed(2), tone: 'tertiary' },
      { label: 'Görünür Örnek', value: String(visibleCount), tone: 'neutral' },
    ],
    learning: {
      summary: `${getQuadricLabel(quadricType)} yüzeyi ${axes.plane} üzerinde ardışık kesitlerle incelendi.`,
      interpretation:
        'Kuadratik yüzeyler 3B görünse de en iyi, düzlemsel kesitlerin nasıl değiştiğine bakılarak anlaşılır. Kanonik denklem bu kesitlerin tipini belirler.',
      warnings:
        'Bir yüzeyin tek bir kesiti tüm geometriyi temsil etmez. Özellikle kapalı ve açık yüzeyler farklı düzlemlerde bambaşka görünür.',
      tryNext:
        describeQuadricSection(quadricType, sliceVariable, params.sliceValue),
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
