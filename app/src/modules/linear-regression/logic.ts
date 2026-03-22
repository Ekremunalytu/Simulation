import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

export interface LinearRegressionParams extends SimulationParamsBase {
  numPoints: number
  trueSlope: number
  trueIntercept: number
  noise: number
}

export interface DataPoint {
  x: number
  y: number
}

export interface ResidualPoint {
  x: number
  actual: number
  predicted: number
  residual: number
}

export interface RegressionResult {
  slope: number
  intercept: number
  rSquared: number
  mse: number
  predictions: { x: number; y: number }[]
  residuals: ResidualPoint[]
}

export interface LinearRegressionPlaybackFrame {
  visibleCount: number
  data: DataPoint[]
  regression: RegressionResult
}

export interface LinearRegressionDerivedResult extends SimulationResultBase {
  data: DataPoint[]
  regression: RegressionResult
  playbackFrames: LinearRegressionPlaybackFrame[]
}

function createSeededRandom(seed: number) {
  let state = seed

  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

export function generateData(
  n: number,
  trueSlope: number,
  trueIntercept: number,
  noise: number,
  seed: number = 42,
): DataPoint[] {
  const random = createSeededRandom(seed)
  const points: DataPoint[] = []

  for (let index = 0; index < n; index += 1) {
    const x = random() * 10
    const y = trueSlope * x + trueIntercept + (random() - 0.5) * 2 * noise
    points.push({ x, y })
  }

  return points.sort((left, right) => left.x - right.x)
}

export function fitRegression(data: DataPoint[]): RegressionResult {
  const n = data.length

  if (n === 0) {
    return {
      slope: 0,
      intercept: 0,
      rSquared: 0,
      mse: 0,
      predictions: [],
      residuals: [],
    }
  }

  const sumX = data.reduce((sum, point) => sum + point.x, 0)
  const sumY = data.reduce((sum, point) => sum + point.y, 0)
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0)
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0)
  const denominator = n * sumXX - sumX * sumX
  const meanY = sumY / n

  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator
  const intercept = denominator === 0 ? meanY : (sumY - slope * sumX) / n

  const residuals = data.map((point) => {
    const predicted = slope * point.x + intercept
    return {
      x: point.x,
      actual: point.y,
      predicted,
      residual: point.y - predicted,
    }
  })

  const ssTot = data.reduce((sum, point) => sum + (point.y - meanY) ** 2, 0)
  const ssRes = residuals.reduce((sum, point) => sum + point.residual ** 2, 0)
  const rSquared = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  const mse = ssRes / n

  const minX = Math.min(...data.map((point) => point.x))
  const maxX = Math.max(...data.map((point) => point.x))
  const predictions = [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ]

  return {
    slope,
    intercept,
    rSquared,
    mse,
    predictions,
    residuals,
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Noise Stress Test',
      change: 'Increase noise above 12 while keeping the same slope.',
      expectation: 'The residual bars should spread out and R² should drop because the line explains less of the variance.',
    },
    {
      title: 'Sparse Samples',
      change: 'Reduce data points to around 5 to 10.',
      expectation: 'The estimated line becomes less stable and can move noticeably with the same true relationship.',
    },
    {
      title: 'Flip the Relationship',
      change: 'Set the slope to a negative value and rerun.',
      expectation: 'The fitted line should rotate downward while residual behavior still reflects the noise level.',
    },
  ]
}

function buildPlaybackFrames(data: DataPoint[]): LinearRegressionPlaybackFrame[] {
  if (data.length < 2) {
    return [
      {
        visibleCount: data.length,
        data,
        regression: fitRegression(data),
      },
    ]
  }

  const frames: LinearRegressionPlaybackFrame[] = []

  for (let visibleCount = 2; visibleCount <= data.length; visibleCount += 1) {
    const visibleData = data.slice(0, visibleCount)
    frames.push({
      visibleCount,
      data: visibleData,
      regression: fitRegression(visibleData),
    })
  }

  return frames
}

function buildTimeline(playbackFrames: LinearRegressionPlaybackFrame[]): SimulationTimeline {
  return {
    frames: playbackFrames.map((frame) => ({
      label: `${frame.visibleCount} points visible`,
    })),
  }
}

export function deriveLinearRegressionResult(
  params: LinearRegressionParams,
): LinearRegressionDerivedResult {
  const data = generateData(
    params.numPoints,
    params.trueSlope,
    params.trueIntercept,
    params.noise,
  )
  const regression = fitRegression(data)
  const playbackFrames = buildPlaybackFrames(data)

  return {
    data,
    regression,
    playbackFrames,
    metrics: [
      {
        label: 'Slope',
        value: regression.slope.toFixed(2),
        tone: 'primary',
      },
      {
        label: 'Intercept',
        value: regression.intercept.toFixed(2),
        tone: 'neutral',
      },
      {
        label: 'R²',
        value: regression.rSquared.toFixed(4),
        tone: regression.rSquared > 0.8 ? 'secondary' : 'tertiary',
      },
      {
        label: 'MSE',
        value: regression.mse.toFixed(3),
        tone: regression.mse < 15 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `The model fitted ${params.numPoints} synthetic points sampled from y = ${params.trueSlope}x + ${params.trueIntercept}.`,
      interpretation:
        params.noise < 3
          ? 'Low noise keeps the observed points close to the true line, so the fitted parameters should stay near the generating process.'
          : params.noise > 10
            ? 'High noise injects large residuals, so the line still captures the trend but explains less of the variance.'
            : 'Moderate noise creates a realistic regression setting where the line captures the main trend without matching every point.',
      warnings:
        params.numPoints < 15
          ? 'Small samples make the fitted parameters unstable. A few unusual points can move the line more than expected.'
          : 'Sample size is large enough to make the fit more representative of the underlying relationship.',
      tryNext:
        regression.rSquared > 0.9
          ? 'Increase noise and rerun to see how residual spread grows while the underlying slope remains similar.'
          : 'Reduce noise or add more points, then compare how much the residual bars tighten around zero.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(playbackFrames),
  }
}
