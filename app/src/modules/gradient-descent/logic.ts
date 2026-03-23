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
      ? 'Mevcut öğrenme oranı agresif; bu yüzden optimize edici yerleşmekten çok sıçramaya zaman harcıyor.'
      : params.learningRate < 0.01
        ? 'Optimize edici çok küçük adımlar atıyor; bu kararlı ama yavaş bir davranış.'
        : 'Optimize edici, her güncellemenin kaybı anlamlı biçimde azalttığı dengeli bir bölgede çalışıyor.'

  const warnings = result.overshooting
    ? 'Yol boyunca kayıp artıyorsa bu overshoot işaretidir. Öğrenme oranını düşürmeyi veya momentumu açmayı dene.'
    : params.stochastic
      ? 'Stokastik gürültü açık olduğu için uzun vadeli eğilim sağlıklı olsa da küçük yukarı kıpırdamalar beklenir.'
      : 'İniş akıcı kalıyor. Daha belirgin bir karşıtlık görmek istiyorsan salınım görünene kadar öğrenme oranını artır.'

  return {
    summary: `Optimize edici ${params.iterations} iterasyon boyunca (${params.startX}, ${params.startY}) noktasından (${result.finalPoint.x.toFixed(2)}, ${result.finalPoint.y.toFixed(2)}) noktasına ilerledi.`,
    interpretation: `${stability} Son gradient normu ${result.finalGradientNorm.toFixed(4)} ve bu ${result.converged ? 'modelin durağan bir noktaya yaklaştığını gösteriyor.' : 'modelin minimuma hâlâ belli bir uzaklıkta olduğunu gösteriyor.'}`,
    warnings,
    tryNext: params.momentum
      ? 'Momentumu kapatıp yörüngeyi karşılaştır. Daha dik eksende daha fazla zikzak görmelisin.'
      : 'Momentumu açıp çalıştırmayı tekrar oynat. Yol daha akıcı hale gelip vadiye daha hızlı ulaşmalı.',
  }
}

function buildMetrics(result: GradientDescentResult): SimulationMetric[] {
  return [
    {
      label: 'Son Kayıp',
      value: result.finalPoint.loss.toFixed(4),
      tone: result.converged ? 'secondary' : 'warning',
    },
    {
      label: 'Gradient Normu',
      value: result.finalGradientNorm.toFixed(4),
      tone: result.converged ? 'primary' : 'neutral',
    },
    {
      label: 'Yakınsama',
      value: result.converged ? 'Kararlı' : 'Sürüyor',
      tone: result.converged ? 'secondary' : 'tertiary',
    },
    {
      label: 'Overshoot',
      value: result.overshooting ? 'Var' : 'Yok',
      tone: result.overshooting ? 'warning' : 'neutral',
    },
  ]
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Iraksamayı Zorla',
      change: 'Öğrenme oranını 0.8 civarına çıkar ve yeniden çalıştır.',
      expectation: 'Yol çanak etrafında sıçramalı; kayıp eğrisi de artık düzgün biçimde azalmamalı.',
    },
    {
      title: 'Momentumu Karşılaştır',
      change: 'Aynı başlangıç noktasını koru, momentumu aç ve yeniden oynat.',
      expectation: 'Momentum zikzakları azaltmalı ve sığ yönde daha kararlı ilerleme sağlamalı.',
    },
    {
      title: 'Gürültü Ekle',
      change: 'Öğrenme oranını değiştirmeden stokastik modu aç.',
      expectation: 'Yörünge daha gürültülü hale gelmeli ama genel eğilim yine de minimuma doğru ilerlemeli.',
    },
  ]
}

function buildTimeline(path: GDPoint[]): SimulationTimeline {
  return {
    frames: path.map((point) => ({
      label: `İterasyon ${point.iteration}`,
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
