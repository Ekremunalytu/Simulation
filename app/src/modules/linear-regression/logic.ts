export interface DataPoint {
  x: number
  y: number
}

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  predictions: { x: number; y: number }[]
  residuals: { x: number; actual: number; predicted: number; residual: number }[]
}

export function generateData(
  n: number,
  trueSlope: number,
  trueIntercept: number,
  noise: number,
  seed: number = 42
): DataPoint[] {
  // Simple seeded random
  let s = seed
  const rand = () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }

  const points: DataPoint[] = []
  for (let i = 0; i < n; i++) {
    const x = rand() * 10
    const y = trueSlope * x + trueIntercept + (rand() - 0.5) * 2 * noise
    points.push({ x, y })
  }
  return points.sort((a, b) => a.x - b.x)
}

export function fitRegression(data: DataPoint[]): RegressionResult {
  const n = data.length
  if (n === 0) return { slope: 0, intercept: 0, rSquared: 0, predictions: [], residuals: [] }

  const sumX = data.reduce((s, p) => s + p.x, 0)
  const sumY = data.reduce((s, p) => s + p.y, 0)
  const sumXY = data.reduce((s, p) => s + p.x * p.y, 0)
  const sumXX = data.reduce((s, p) => s + p.x * p.x, 0)
  const meanY = sumY / n

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const ssTot = data.reduce((s, p) => s + (p.y - meanY) ** 2, 0)
  const ssRes = data.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0)
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot

  const minX = Math.min(...data.map((p) => p.x))
  const maxX = Math.max(...data.map((p) => p.x))
  const predictions = [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ]

  const residuals = data.map((p) => ({
    x: p.x,
    actual: p.y,
    predicted: slope * p.x + intercept,
    residual: p.y - (slope * p.x + intercept),
  }))

  return { slope, intercept, rSquared, predictions, residuals }
}
