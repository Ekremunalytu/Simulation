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
      title: 'Gürültü Stres Testi',
      change: 'Eğimi aynı tutup gürültüyü 12 üzerine çıkar.',
      expectation: 'Residual çubukları daha çok yayılmalı ve doğru varyansın daha azını açıkladığı için R² düşmeli.',
    },
    {
      title: 'Seyrek Örnekler',
      change: 'Veri noktalarını yaklaşık 5 ile 10 arasına düşür.',
      expectation: 'Tahmin edilen doğru daha az kararlı hale gelir ve aynı gerçek ilişki altında belirgin biçimde yer değiştirebilir.',
    },
    {
      title: 'İlişkiyi Tersine Çevir',
      change: 'Eğimi negatif bir değere çekip yeniden çalıştır.',
      expectation: 'Uydurulan doğru aşağı yönlü dönmeli; residual davranışı ise gürültü seviyesini yansıtmaya devam etmeli.',
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
      label: `${frame.visibleCount} nokta görünür`,
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
        label: 'Eğim',
        value: regression.slope.toFixed(2),
        tone: 'primary',
      },
      {
        label: 'Kesişim',
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
      summary: `Model, y = ${params.trueSlope}x + ${params.trueIntercept} doğrusundan üretilen ${params.numPoints} sentetik noktaya uyum sağladı.`,
      interpretation:
        params.noise < 3
          ? 'Düşük gürültü, gözlenen noktaları gerçek doğruya yakın tutar; bu yüzden bulunan parametreler üretici sürece yakın kalır.'
        : params.noise > 10
            ? 'Yüksek gürültü büyük residual değerleri üretir; doğru genel eğilimi yakalasa da varyansın daha azını açıklar.'
            : 'Orta düzey gürültü, doğrunun her noktayı ezberlemeden ana eğilimi yakaladığı daha gerçekçi bir regresyon ortamı oluşturur.',
      warnings:
        params.numPoints < 15
          ? 'Küçük örneklem, bulunan parametreleri kararsız yapar. Birkaç sıra dışı nokta doğruyu beklenenden fazla oynatabilir.'
          : 'Örneklem boyutu, uyumun alttaki ilişkiyi daha temsil edici hale getirecek kadar büyük.',
      tryNext:
        regression.rSquared > 0.9
          ? 'Gürültüyü artırıp yeniden çalıştır; alttaki eğim benzer kalırken residual yayılımının nasıl büyüdüğünü gözlemle.'
          : 'Gürültüyü azalt veya daha fazla nokta ekle; residual çubuklarının sıfır etrafında ne kadar sıkılaştığını karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(playbackFrames),
  }
}
