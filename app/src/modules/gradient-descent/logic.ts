import type {
  GuidedExperiment,
  LearningContent,
  SimulationMetric,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'

export interface GradientDescentParams extends SimulationParamsBase {
  learningRate: number
  iterations: number
  startX: number
  startY: number
  momentum: boolean
  stochastic: boolean
}

export interface GDPoint {
  x: number
  y: number
  loss: number
  iteration: number
}

export interface GradientDescentResult extends SimulationResultBase {
  path: GDPoint[]
  finalPoint: GDPoint
  finalGradientNorm: number
  converged: boolean
  overshooting: boolean
}

function createSeededRandom(seed: number) {
  let state = seed

  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

export function lossFunction(x: number, y: number): number {
  return x * x + 3 * y * y + 0.5 * x * y
}

export function gradient(x: number, y: number): [number, number] {
  const dx = 2 * x + 0.5 * y
  const dy = 6 * y + 0.5 * x
  return [dx, dy]
}

export function gradientNorm(x: number, y: number): number {
  const [dx, dy] = gradient(x, y)
  return Math.hypot(dx, dy)
}

export function runGradientDescent(
  params: GradientDescentParams,
  seed: number = 42,
): GDPoint[] {
  const path: GDPoint[] = []
  const random = createSeededRandom(seed)
  let x = params.startX
  let y = params.startY
  let vx = 0
  let vy = 0
  const beta = 0.9

  for (let iteration = 0; iteration <= params.iterations; iteration += 1) {
    path.push({
      x,
      y,
      loss: lossFunction(x, y),
      iteration,
    })

    if (iteration === params.iterations) {
      break
    }

    let [dx, dy] = gradient(x, y)

    if (params.stochastic) {
      dx += (random() - 0.5) * 0.5
      dy += (random() - 0.5) * 0.5
    }

    if (params.momentum) {
      vx = beta * vx + (1 - beta) * dx
      vy = beta * vy + (1 - beta) * dy
      x -= params.learningRate * vx
      y -= params.learningRate * vy
      continue
    }

    x -= params.learningRate * dx
    y -= params.learningRate * dy
  }

  return path
}

export function detectOvershooting(path: GDPoint[]): boolean {
  for (let index = 1; index < path.length; index += 1) {
    if (path[index].loss > path[index - 1].loss * 1.02) {
      return true
    }
  }

  return false
}

function buildLearningContent(
  params: GradientDescentParams,
  result: GradientDescentResult,
): LearningContent {
  const stability =
    params.learningRate > 0.5
      ? 'The current learning rate is aggressive, so the optimizer is spending more time jumping than settling.'
      : params.learningRate < 0.01
        ? 'The optimizer is taking tiny steps, which is stable but slow.'
        : 'The optimizer is operating in a balanced region where each update meaningfully reduces loss.'

  const warnings = result.overshooting
    ? 'Loss increases along the path, which is a sign of overshooting. Try lowering the learning rate or enabling momentum.'
    : params.stochastic
      ? 'Stochastic noise is active, so small upward wiggles are expected even when the long-term trend is healthy.'
      : 'The descent stays smooth. If you want a stronger contrast, push the learning rate higher until oscillation appears.'

  return {
    summary: `The optimizer moved from (${params.startX}, ${params.startY}) to (${result.finalPoint.x.toFixed(2)}, ${result.finalPoint.y.toFixed(2)}) across ${params.iterations} iterations.`,
    interpretation: `${stability} Final gradient norm is ${result.finalGradientNorm.toFixed(4)}, which ${result.converged ? 'indicates the model is close to a stationary point.' : 'shows the model is still some distance away from the minimum.'}`,
    warnings,
    tryNext: params.momentum
      ? 'Disable momentum and compare the trajectory. You should see more zig-zagging on the steeper axis.'
      : 'Enable momentum, then replay the run. The path should smooth out and reach the valley faster.',
  }
}

function buildMetrics(result: GradientDescentResult): SimulationMetric[] {
  return [
    {
      label: 'Final Loss',
      value: result.finalPoint.loss.toFixed(4),
      tone: result.converged ? 'secondary' : 'warning',
    },
    {
      label: 'Gradient Norm',
      value: result.finalGradientNorm.toFixed(4),
      tone: result.converged ? 'primary' : 'neutral',
    },
    {
      label: 'Convergence',
      value: result.converged ? 'Stable' : 'In Progress',
      tone: result.converged ? 'secondary' : 'tertiary',
    },
    {
      label: 'Overshoot',
      value: result.overshooting ? 'Detected' : 'No',
      tone: result.overshooting ? 'warning' : 'neutral',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Force Divergence',
      change: 'Increase learning rate toward 0.8 and run again.',
      expectation: 'The path should bounce around the bowl and the loss curve should stop decreasing smoothly.',
    },
    {
      title: 'Compare Momentum',
      change: 'Keep the same start point, turn momentum on, then replay.',
      expectation: 'Momentum should reduce zig-zagging and move more decisively along the shallow direction.',
    },
    {
      title: 'Add Noise',
      change: 'Enable stochastic mode without changing the learning rate.',
      expectation: 'The trajectory should become noisier, but the broad trend can still move toward the minimum.',
    },
  ]
}

function buildTimeline(path: GDPoint[]): SimulationTimeline {
  return {
    frames: path.map((point) => ({
      label: `Iteration ${point.iteration}`,
    })),
  }
}

export function deriveGradientDescentResult(
  params: GradientDescentParams,
): GradientDescentResult {
  const path = runGradientDescent(params)
  const finalPoint = path[path.length - 1]
  const finalGradient = gradientNorm(finalPoint.x, finalPoint.y)
  const converged = finalPoint.loss < 0.05 && finalGradient < 0.25
  const overshooting = detectOvershooting(path)

  const result: GradientDescentResult = {
    path,
    finalPoint,
    finalGradientNorm: finalGradient,
    converged,
    overshooting,
    learning: {
      summary: '',
      interpretation: '',
      warnings: '',
      tryNext: '',
    },
    metrics: [],
    experiments: buildExperiments(),
    timeline: buildTimeline(path),
  }

  result.learning = buildLearningContent(params, result)
  result.metrics = buildMetrics(result)

  return result
}

export function generateContourData(
  gridSize: number = 50,
  range: number = 4,
): { x: number; y: number; z: number }[] {
  const data: { x: number; y: number; z: number }[] = []

  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const x = -range + (2 * range * row) / (gridSize - 1)
      const y = -range + (2 * range * column) / (gridSize - 1)
      data.push({ x, y, z: lossFunction(x, y) })
    }
  }

  return data
}
