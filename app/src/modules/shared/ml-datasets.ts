import { createSeededRandom, randomBetween, randomInt } from './random'

export interface Point2D {
  id: string
  x: number
  y: number
}

export interface LabeledPoint2D extends Point2D {
  label: 0 | 1
}

export interface TwoClassDatasetOptions {
  numPoints: number
  separation: number
  noise: number
  shape: 'separable' | 'borderline' | 'xor' | 'noisy-xor'
  classBalance?: number
  seed?: number
}

export interface ClusterDatasetOptions {
  numPoints: number
  clusterCount: number
  spread: number
  shape: 'blobs' | 'overlap' | 'elongated'
  seed?: number
}

function jitterMagnitude(noise: number) {
  return Math.max(0.25, 0.7 + noise * 0.22)
}

function createSeparatedPoint(
  label: 0 | 1,
  index: number,
  separation: number,
  noise: number,
  random: ReturnType<typeof createSeededRandom>,
): LabeledPoint2D {
  const spread = jitterMagnitude(noise)
  const centerX = label === 0 ? -separation : separation
  const centerY = label === 0 ? -separation * 0.55 : separation * 0.55

  return {
    id: `p-${index}`,
    x: centerX + randomBetween(random, -spread, spread),
    y: centerY + randomBetween(random, -spread, spread),
    label,
  }
}

function createXorPoint(
  quadrant: number,
  index: number,
  separation: number,
  noise: number,
  random: ReturnType<typeof createSeededRandom>,
): LabeledPoint2D {
  const spread = jitterMagnitude(noise) * 0.82
  const centerX = quadrant % 2 === 0 ? -separation : separation
  const centerY = quadrant < 2 ? separation : -separation
  const label = quadrant === 0 || quadrant === 3 ? 0 : 1

  return {
    id: `p-${index}`,
    x: centerX + randomBetween(random, -spread, spread),
    y: centerY + randomBetween(random, -spread, spread),
    label,
  }
}

export function generateTwoClassDataset(options: TwoClassDatasetOptions): LabeledPoint2D[] {
  const { numPoints, separation, noise, shape, classBalance = 0.5, seed = 42 } = options
  const random = createSeededRandom(seed)
  const classZeroCount = Math.round(numPoints * classBalance)

  return Array.from({ length: numPoints }, (_, index) => {
    if (shape === 'xor' || shape === 'noisy-xor') {
      const effectiveNoise = shape === 'noisy-xor' ? noise + 0.7 : noise
      return createXorPoint(index % 4, index, Math.max(0.8, separation), effectiveNoise, random)
    }

    const label = index < classZeroCount ? 0 : 1
    const effectiveSeparation = shape === 'borderline' ? separation * 0.65 : separation
    return createSeparatedPoint(label, index, effectiveSeparation, noise, random)
  })
}

function baseClusterCenters(
  clusterCount: number,
  shape: ClusterDatasetOptions['shape'],
): Array<{ x: number; y: number }> {
  if (shape === 'elongated') {
    return Array.from({ length: clusterCount }, (_, index) => ({
      x: -5 + index * (10 / Math.max(1, clusterCount - 1)),
      y: index % 2 === 0 ? -1.8 : 1.8,
    }))
  }

  const radius = shape === 'overlap' ? 2.4 : 4.2

  return Array.from({ length: clusterCount }, (_, index) => {
    const angle = (Math.PI * 2 * index) / clusterCount
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    }
  })
}

export function generateClusterDataset(options: ClusterDatasetOptions): Point2D[] {
  const { numPoints, clusterCount, spread, shape, seed = 42 } = options
  const random = createSeededRandom(seed)
  const centers = baseClusterCenters(clusterCount, shape)
  const points: Point2D[] = []

  for (let index = 0; index < numPoints; index += 1) {
    const clusterIndex = index % clusterCount
    const center = centers[clusterIndex] as { x: number; y: number }
    const scale = shape === 'overlap' ? spread * 1.4 : spread
    const stretchX = shape === 'elongated' ? 1.9 : 1
    const stretchY = shape === 'elongated' ? 0.75 : 1
    const jitterX = randomBetween(random, -scale, scale) * stretchX
    const jitterY = randomBetween(random, -scale, scale) * stretchY

    points.push({
      id: `c-${index}`,
      x: center.x + jitterX,
      y: center.y + jitterY,
    })
  }

  return points
}

export function pickInitialCentroidIndexes(
  points: Point2D[],
  clusterCount: number,
  strategy: 'random' | 'farthest-first',
  seed: number = 42,
): number[] {
  const random = createSeededRandom(seed)

  if (strategy === 'random') {
    const chosen = new Set<number>()

    while (chosen.size < Math.min(clusterCount, points.length)) {
      chosen.add(randomInt(random, 0, points.length - 1))
    }

    return [...chosen]
  }

  const indexes = [0]

  while (indexes.length < Math.min(clusterCount, points.length)) {
    let bestIndex = 0
    let bestDistance = -1

    for (let pointIndex = 0; pointIndex < points.length; pointIndex += 1) {
      if (indexes.includes(pointIndex)) {
        continue
      }

      const point = points[pointIndex] as Point2D
      const nearestChosen = Math.min(
        ...indexes.map((selectedIndex) => {
          const selected = points[selectedIndex] as Point2D
          return (point.x - selected.x) ** 2 + (point.y - selected.y) ** 2
        }),
      )

      if (nearestChosen > bestDistance) {
        bestDistance = nearestChosen
        bestIndex = pointIndex
      }
    }

    indexes.push(bestIndex)
  }

  return indexes
}
