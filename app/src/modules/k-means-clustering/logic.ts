import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  generateClusterDataset,
  pickInitialCentroidIndexes,
  type Point2D,
} from '../shared/ml-datasets'

export interface KMeansClusteringParams extends SimulationParamsBase {
  clusterCount: number
  numPoints: number
  spread: number
  datasetShape: 'blobs' | 'overlap' | 'elongated'
  initStrategy: 'random' | 'farthest-first'
  maxIterations: number
}

export interface ClusterPoint extends Point2D {
  cluster: number
}

export interface Centroid {
  cluster: number
  x: number
  y: number
}

export interface KMeansSnapshot {
  iteration: number
  points: ClusterPoint[]
  centroids: Centroid[]
  inertia: number
  centroidShift: number
}

export interface KMeansClusteringResult extends SimulationResultBase {
  points: Point2D[]
  snapshots: KMeansSnapshot[]
  finalInertia: number
  converged: boolean
  finalShift: number
}

function squaredDistance(left: { x: number; y: number }, right: { x: number; y: number }) {
  return (left.x - right.x) ** 2 + (left.y - right.y) ** 2
}

function assignPoints(points: Point2D[], centroids: Centroid[]): ClusterPoint[] {
  return points.map((point) => {
    let bestCluster = 0
    let bestDistance = Number.POSITIVE_INFINITY

    centroids.forEach((centroid) => {
      const distance = squaredDistance(point, centroid)
      if (distance < bestDistance) {
        bestDistance = distance
        bestCluster = centroid.cluster
      }
    })

    return {
      ...point,
      cluster: bestCluster,
    }
  })
}

function updateCentroids(points: ClusterPoint[], previous: Centroid[]): Centroid[] {
  return previous.map((centroid) => {
    const members = points.filter((point) => point.cluster === centroid.cluster)

    if (members.length === 0) {
      return centroid
    }

    const sum = members.reduce(
      (accumulator, point) => ({
        x: accumulator.x + point.x,
        y: accumulator.y + point.y,
      }),
      { x: 0, y: 0 },
    )

    return {
      cluster: centroid.cluster,
      x: sum.x / members.length,
      y: sum.y / members.length,
    }
  })
}

function computeInertia(points: ClusterPoint[], centroids: Centroid[]) {
  return points.reduce((sum, point) => {
    const centroid = centroids.find((item) => item.cluster === point.cluster) as Centroid
    return sum + squaredDistance(point, centroid)
  }, 0)
}

function computeShift(previous: Centroid[], next: Centroid[]) {
  return previous.reduce((sum, centroid) => {
    const moved = next.find((item) => item.cluster === centroid.cluster) as Centroid
    return sum + Math.sqrt(squaredDistance(centroid, moved))
  }, 0)
}

export function runKMeans(params: KMeansClusteringParams, points: Point2D[]): KMeansSnapshot[] {
  const initialIndexes = pickInitialCentroidIndexes(
    points,
    params.clusterCount,
    params.initStrategy,
  )
  let centroids = initialIndexes.map((pointIndex, cluster) => {
    const point = points[pointIndex] as Point2D
    return {
      cluster,
      x: point.x,
      y: point.y,
    }
  })
  const snapshots: KMeansSnapshot[] = []

  for (let iteration = 1; iteration <= params.maxIterations; iteration += 1) {
    const assigned = assignPoints(points, centroids)
    const nextCentroids = updateCentroids(assigned, centroids)
    const reassigned = assignPoints(points, nextCentroids)
    const inertia = computeInertia(reassigned, nextCentroids)
    const centroidShift = computeShift(centroids, nextCentroids)

    snapshots.push({
      iteration,
      points: reassigned,
      centroids: nextCentroids,
      inertia,
      centroidShift,
    })

    centroids = nextCentroids

    if (centroidShift < 0.01) {
      break
    }
  }

  return snapshots
}

function buildLearningContent(
  params: KMeansClusteringParams,
  result: KMeansClusteringResult,
): LearningContent {
  return {
    summary: `${params.clusterCount} küme için ${result.snapshots.length} iterasyon yürütüldü ve son inertia ${result.finalInertia.toFixed(2)} oldu.`,
    interpretation:
      result.converged
        ? 'Centroid hareketi neredeyse durduğu için sistem dengeli bir kümelenmeye ulaştı. K-Means burada veri uzayını merkezler etrafında parçalıyor.'
        : 'İterasyon sınırına ulaşıldı fakat merkezler hâlâ hareket ediyor. Bu genellikle üst üste binen veri ya da zayıf başlangıç merkezleriyle görülür.',
    warnings:
      params.initStrategy === 'random'
        ? 'Rastgele başlangıç, farklı lokal çözümlere gidebilir. Aynı veri üstünde başlangıç merkezleri sonucu belirgin şekilde etkiler.'
        : 'Farthest-first başlangıcı genelde daha kararlı davranır ama küresel optimum garantisi vermez.',
    tryNext:
      'Aynı veri biçiminde cluster sayısını artırıp azalt. Özellikle overlap presetinde inertia ile yorumlanabilirlik arasındaki dengeyi karşılaştır.',
  }
}

function buildMetrics(result: KMeansClusteringResult): SimulationMetric[] {
  return [
    {
      label: 'Inertia',
      value: result.finalInertia.toFixed(2),
      tone: result.converged ? 'secondary' : 'warning',
    },
    {
      label: 'İterasyon',
      value: result.snapshots.length.toString(),
      tone: 'primary',
    },
    {
      label: 'Merkez Kayması',
      value: result.finalShift.toFixed(3),
      tone: 'tertiary',
    },
    {
      label: 'Durum',
      value: result.converged ? 'Yakınsadı' : 'Sürüyor',
      tone: result.converged ? 'neutral' : 'warning',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Başlangıcı Karşılaştır',
      change: 'Random ve farthest-first başlangıçları arasında geçiş yap.',
      expectation: 'Başlangıç centroidleri farklı lokal çözümlere ve farklı inertia değerlerine gidebilir.',
    },
    {
      title: 'Küme Sayısını Artır',
      change: 'Cluster sayısını 2’den 4 ya da 5’e çıkar.',
      expectation: 'Inertia tipik olarak düşer ama kümeler yorumlanabilirliğini kaybedebilir.',
    },
    {
      title: 'Overlap Verisi',
      change: 'Dataset shape değerini overlap yap.',
      expectation: 'Kümeler arası sınırlar bulanıklaştıkça centroidler daha kararsız hareket eder.',
    },
  ]
}

function buildTimeline(snapshots: KMeansSnapshot[]): SimulationTimeline {
  return {
    frames: snapshots.map((snapshot) => ({
      label: `İterasyon ${snapshot.iteration}`,
    })),
  }
}

export function deriveKMeansClusteringResult(
  params: KMeansClusteringParams,
): KMeansClusteringResult {
  const points = generateClusterDataset({
    numPoints: params.numPoints,
    clusterCount: params.clusterCount,
    spread: params.spread,
    shape: params.datasetShape,
  })
  const snapshots = runKMeans(params, points)
  const finalSnapshot = snapshots.at(-1) as KMeansSnapshot

  const result: KMeansClusteringResult = {
    points,
    snapshots,
    finalInertia: finalSnapshot.inertia,
    converged: finalSnapshot.centroidShift < 0.01,
    finalShift: finalSnapshot.centroidShift,
    learning: {
      summary: '',
      interpretation: '',
      warnings: '',
      tryNext: '',
    },
    metrics: [],
    experiments: buildExperiments(),
    timeline: buildTimeline(snapshots),
  }

  result.learning = buildLearningContent(params, result)
  result.metrics = buildMetrics(result)

  return result
}
