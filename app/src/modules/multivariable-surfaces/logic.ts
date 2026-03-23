import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  evaluateSurface,
  getSurfaceLabel,
  round,
  sampleRange,
  sampleSurfaceContourGrid,
  surfaceLevelPoints,
  type SurfaceId,
} from '../shared/calculus'

export interface MultivariableSurfacesParams extends SimulationParamsBase {
  surfaceType: string
  levelValue: number
  sliceAxis: string
  sliceValue: number
}

export interface SurfaceLevelFrame {
  levelValue: number
  levelPoints: Array<{ x: number; y: number }>
}

export interface MultivariableSurfacesResult extends SimulationResultBase {
  contourSamples: Array<{ x: number; y: number; z: number }>
  sliceData: Array<{ axisValue: number; surface: number }>
  sliceAxisLabel: string
  fixedAxisLabel: string
  frames: SurfaceLevelFrame[]
}

function buildTimeline(frames: SurfaceLevelFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame, index) => ({
      label: `${index + 1}. seviye · z=${frame.levelValue.toFixed(2)}`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Seviye Kaydır',
      change: 'Playback’i çalıştırıp seviye değerinin contour noktalarını nasıl taşıdığını izle.',
      expectation: 'Seviye değeri arttıkça aynı yüzey üzerinde bambaşka iz eğrileri ortaya çıkar.',
    },
    {
      title: 'Kesit Yönünü Değiştir',
      change: 'Sabit x ve sabit y kesitlerini karşılaştır.',
      expectation: 'Aynı yüzey, farklı eksenlerden bakıldığında farklı tek değişkenli davranışlar sergiler.',
    },
    {
      title: 'Yüzey Ailesi',
      change: 'Paraboloid ile saddle arasında geçiş yap.',
      expectation: 'Contour yoğunluğu ve kesit geometrisi, yüzey türüne göre hemen değişir.',
    },
  ]
}

export function deriveMultivariableSurfacesResult(
  params: MultivariableSurfacesParams,
): MultivariableSurfacesResult {
  const surfaceType = params.surfaceType as SurfaceId
  const contourSamples = sampleSurfaceContourGrid(surfaceType, -2.4, 2.4, 13).map((sample) => ({
    ...sample,
    z: round(sample.z, 3),
  }))
  const varyingAxis = params.sliceAxis === 'x' ? 'y' : 'x'
  const sliceData = sampleRange(-2.5, 2.5, 80).map((axisValue) => ({
    axisValue,
    surface:
      params.sliceAxis === 'x'
        ? evaluateSurface(surfaceType, params.sliceValue, axisValue)
        : evaluateSurface(surfaceType, axisValue, params.sliceValue),
  }))
  const levelOffsets = [-1.2, -0.6, 0, 0.6, 1.2]
  const frames = levelOffsets.map((offset) => {
    const levelValue = params.levelValue + offset
    return {
      levelValue,
      levelPoints: surfaceLevelPoints(surfaceType, levelValue, -2.4, 2.4, 27, 0.22),
    }
  })
  const centerValue =
    params.sliceAxis === 'x'
      ? evaluateSurface(surfaceType, params.sliceValue, 0)
      : evaluateSurface(surfaceType, 0, params.sliceValue)

  return {
    contourSamples,
    sliceData,
    sliceAxisLabel: varyingAxis,
    fixedAxisLabel: params.sliceAxis,
    frames,
    metrics: [
      { label: 'Yüzey', value: getSurfaceLabel(surfaceType), tone: 'primary' },
      { label: 'Başlangıç Seviyesi', value: params.levelValue.toFixed(2), tone: 'secondary' },
      { label: 'Sabit Eksen', value: `${params.sliceAxis} = ${params.sliceValue.toFixed(2)}`, tone: 'tertiary' },
      { label: 'Kesit Merkezi', value: centerValue.toFixed(3), tone: 'neutral' },
    ],
    learning: {
      summary: `${getSurfaceLabel(surfaceType)} yüzeyi için contour haritası ve tek eksenli kesit birlikte okundu.`,
      interpretation:
        'Çok değişkenli fonksiyonu aynı anda iki şekilde görüyorsun: üstten bakışta seviye eğrileri, kesitte ise tek değişkenli grafik. Bu iki temsil aynı nesnenin farklı okumalarıdır.',
      warnings:
        'Tek bir kesite bakıp tüm yüzey geometriğini anladığını varsayma. Seviye eğrileri ve kesitler birlikte okunmalıdır.',
      tryNext:
        'Aynı seviye değerini başka bir yüzey ailesine taşıyıp contour yoğunluğunun ve kesit eğiminin nasıl değiştiğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
