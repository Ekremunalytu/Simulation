import { describe, expect, it } from 'vitest'
import { deriveKMeansClusteringResult, runKMeans } from './logic'
import { generateClusterDataset } from '../shared/ml-datasets'

describe('k-means clustering logic', () => {
  it('keeps inertia non-increasing across iterations', () => {
    const params = {
      clusterCount: 3,
      numPoints: 90,
      spread: 1.2,
      datasetShape: 'blobs' as const,
      initStrategy: 'farthest-first' as const,
      maxIterations: 10,
    }
    const points = generateClusterDataset({
      numPoints: params.numPoints,
      clusterCount: params.clusterCount,
      spread: params.spread,
      shape: params.datasetShape,
    })
    const snapshots = runKMeans(params, points)

    const inertias = snapshots.map((snapshot) => snapshot.inertia)
    expect(
      inertias.every((value, index) => index === 0 || value <= (inertias[index - 1] as number)),
    ).toBe(true)
  })

  it('is deterministic for the same parameters', () => {
    const params = {
      clusterCount: 4,
      numPoints: 100,
      spread: 1.1,
      datasetShape: 'elongated' as const,
      initStrategy: 'farthest-first' as const,
      maxIterations: 10,
    }

    expect(deriveKMeansClusteringResult(params)).toEqual(deriveKMeansClusteringResult(params))
  })

  it('handles empty cluster fallback without crashing', () => {
    const result = deriveKMeansClusteringResult({
      clusterCount: 5,
      numPoints: 40,
      spread: 0.6,
      datasetShape: 'blobs',
      initStrategy: 'random',
      maxIterations: 6,
    })

    expect(result.snapshots.length).toBeGreaterThan(0)
    expect(result.snapshots.at(-1)?.centroids).toHaveLength(5)
  })

  it('keeps displayed point assignments consistent with displayed centroids', () => {
    const params2 = {
      clusterCount: 3,
      numPoints: 90,
      spread: 1.2,
      datasetShape: 'blobs' as const,
      initStrategy: 'random' as const,
      maxIterations: 10,
    }
    const points2 = generateClusterDataset({
      numPoints: params2.numPoints,
      clusterCount: params2.clusterCount,
      spread: params2.spread,
      shape: params2.datasetShape,
    })
    const snapshots = runKMeans(params2, points2)

    const squaredDistance = (
      left: { x: number; y: number },
      right: { x: number; y: number },
    ) => (left.x - right.x) ** 2 + (left.y - right.y) ** 2

    snapshots.forEach((snapshot) => {
      snapshot.points.forEach((point) => {
        const nearest = snapshot.centroids.reduce((best, centroid) =>
          squaredDistance(point, centroid) < squaredDistance(point, best) ? centroid : best,
        )

        expect(point.cluster).toBe(nearest.cluster)
      })
    })
  })
})
