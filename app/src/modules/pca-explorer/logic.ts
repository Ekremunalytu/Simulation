import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  generateRotatedGaussianDataset,
  type ClusteredPoint2D,
} from '../shared/ml-datasets'

export interface PCAExplorerParams extends SimulationParamsBase {
  sampleCount: number
  datasetShape: 'ellipse' | 'two-clusters' | 'line'
  rotation: number
  spreadX: number
  spreadY: number
  noise: number
  componentCount: number
}

export interface PrincipalComponentVector {
  x: number
  y: number
  eigenvalue: number
}

export interface PCAFrame {
  stage: 'raw' | 'centered' | 'axes' | 'projection' | 'reconstruction'
  label: string
}

export interface PCAExplorerResult extends SimulationResultBase {
  rawPoints: ClusteredPoint2D[]
  centeredPoints: ClusteredPoint2D[]
  pc1ProjectedPoints: ClusteredPoint2D[]
  reconstructedPoints: ClusteredPoint2D[]
  mean: { x: number; y: number }
  components: PrincipalComponentVector[]
  explainedVariance: Array<{ component: string; ratio: number }>
  reconstructionError: number
  frames: PCAFrame[]
}

function meanOf(points: ClusteredPoint2D[]) {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / points.length,
    y: points.reduce((sum, point) => sum + point.y, 0) / points.length,
  }
}

function normalize(vector: { x: number; y: number }) {
  const magnitude = Math.hypot(vector.x, vector.y) || 1
  return {
    x: vector.x / magnitude,
    y: vector.y / magnitude,
  }
}

function principalComponents(points: ClusteredPoint2D[]) {
  const mean = meanOf(points)
  const centered = points.map((point) => ({
    ...point,
    x: point.x - mean.x,
    y: point.y - mean.y,
  }))
  const n = centered.length
  const covarianceXX = centered.reduce((sum, point) => sum + point.x ** 2, 0) / n
  const covarianceYY = centered.reduce((sum, point) => sum + point.y ** 2, 0) / n
  const covarianceXY = centered.reduce((sum, point) => sum + point.x * point.y, 0) / n
  const trace = covarianceXX + covarianceYY
  const term = Math.sqrt((covarianceXX - covarianceYY) ** 2 + 4 * covarianceXY ** 2)
  const eigenvalue1 = (trace + term) / 2
  const eigenvalue2 = (trace - term) / 2
  const pc1 = normalize(
    Math.abs(covarianceXY) > 1e-6
      ? { x: covarianceXY, y: eigenvalue1 - covarianceXX }
      : covarianceXX >= covarianceYY
        ? { x: 1, y: 0 }
        : { x: 0, y: 1 },
  )
  const pc2 = normalize({ x: -pc1.y, y: pc1.x })

  return {
    mean,
    centered,
    components: [
      { ...pc1, eigenvalue: eigenvalue1 },
      { ...pc2, eigenvalue: eigenvalue2 },
    ] satisfies PrincipalComponentVector[],
  }
}

function dot(left: { x: number; y: number }, right: { x: number; y: number }) {
  return left.x * right.x + left.y * right.y
}

function projectToComponents(
  centered: ClusteredPoint2D[],
  components: PrincipalComponentVector[],
  componentCount: number,
) {
  return centered.map((point) => {
    const score1 = dot(point, components[0])
    const score2 = dot(point, components[1])
    const usedComponents = componentCount >= 2 ? [score1, score2] : [score1, 0]
    const reconstructed = {
      x: usedComponents[0] * components[0].x + usedComponents[1] * components[1].x,
      y: usedComponents[0] * components[0].y + usedComponents[1] * components[1].y,
    }
    const pc1Projection = {
      x: score1 * components[0].x,
      y: score1 * components[0].y,
    }

    return {
      pc1Projection,
      reconstructed,
      score1,
      score2,
      point,
    }
  })
}

function buildTimeline(frames: PCAFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({ label: frame.label })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Dönük Bulut',
      change: 'Rotation değerini artır.',
      expectation: 'PC1 ekseni veri bulutunun eğik yönüne dönerek en büyük varyansı takip eder.',
    },
    {
      title: '1B Sıkıştırma',
      change: 'Component count değerini 1 tut.',
      expectation: 'Reconstruction error büyür ama ana yön hâlâ korunur.',
    },
    {
      title: 'İnce Çizgi',
      change: 'Dataset shape seçimini line yap.',
      expectation: 'Explained variance neredeyse tamamen PC1 üzerinde toplanır.',
    },
  ]
}

export function derivePCAExplorerResult(params: PCAExplorerParams): PCAExplorerResult {
  const rawPoints = generateRotatedGaussianDataset({
    sampleCount: params.sampleCount,
    shape: params.datasetShape,
    rotation: params.rotation,
    spreadX: params.spreadX,
    spreadY: params.spreadY,
    noise: params.noise,
  })
  const { mean, centered, components } = principalComponents(rawPoints)
  const projections = projectToComponents(centered, components, params.componentCount)
  const centeredPoints = centered
  const pc1ProjectedPoints = projections.map((item) => ({
    ...item.point,
    x: item.pc1Projection.x,
    y: item.pc1Projection.y,
  }))
  const reconstructedPoints = projections.map((item) => ({
    ...item.point,
    x: item.reconstructed.x + mean.x,
    y: item.reconstructed.y + mean.y,
  }))
  const reconstructionError = Math.sqrt(
    projections.reduce((sum, _item, index) => {
      const reconstructed = reconstructedPoints[index] as ClusteredPoint2D
      const dx = rawPoints[index]!.x - reconstructed.x
      const dy = rawPoints[index]!.y - reconstructed.y
      return sum + dx ** 2 + dy ** 2
    }, 0) / rawPoints.length,
  )
  const varianceTotal = components[0].eigenvalue + components[1].eigenvalue || 1
  const frames: PCAFrame[] = [
    { stage: 'raw', label: 'Raw data' },
    { stage: 'centered', label: 'Centered data' },
    { stage: 'axes', label: 'Principal axes' },
    { stage: 'projection', label: 'PC1 projection' },
    { stage: 'reconstruction', label: 'Reconstruction' },
  ]

  return {
    rawPoints,
    centeredPoints,
    pc1ProjectedPoints,
    reconstructedPoints,
    mean,
    components,
    explainedVariance: [
      { component: 'PC1', ratio: components[0].eigenvalue / varianceTotal },
      { component: 'PC2', ratio: components[1].eigenvalue / varianceTotal },
    ],
    reconstructionError,
    frames,
    metrics: [
      { label: 'PC1', value: `${((components[0].eigenvalue / varianceTotal) * 100).toFixed(1)}%`, tone: 'primary' },
      { label: 'PC2', value: `${((components[1].eigenvalue / varianceTotal) * 100).toFixed(1)}%`, tone: 'secondary' },
      { label: 'RMSE', value: reconstructionError.toFixed(3), tone: 'neutral' },
      { label: 'Bileşen', value: String(params.componentCount), tone: 'tertiary' },
    ],
    learning: {
      summary: `PCA, ${params.sampleCount} noktalı veri bulutunu merkezleyip en yüksek varyans yönlerine ayırdı.`,
      interpretation:
        params.componentCount === 1
          ? 'Tek bileşenli projeksiyon veri bulutunun baskın yönünü korur ama ikincil varyansı bilinçli olarak feda eder.'
          : 'İki bileşenli gösterim 2B verinin tamamını yeniden kurabildiği için reconstruction hatası neredeyse sıfıra iner.',
      warnings:
        params.datasetShape === 'two-clusters'
          ? 'PCA denetimsizdir; sınıf ayrımını değil varyansı maksimize eder. Cluster yapısı ile bileşenler her zaman aynı şeyi anlatmaz.'
          : 'PCA ölçek ve yön bilgisini varyans açısından okur; yorum yaparken geometriyi sınıf semantiğiyle karıştırmamak gerekir.',
      tryNext:
        params.componentCount === 1
          ? 'Component count değerini 2 yapıp reconstruction hatasının nasıl çöktüğünü karşılaştır.'
          : 'Rotation ve spread oranlarını değiştirip PC1 yönünün veriyle birlikte nasıl döndüğünü izle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
