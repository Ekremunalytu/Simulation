import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  exactPolarArea,
  getPolarFunctionLabel,
  polarThetaMax,
  samplePolarCurve,
  evaluatePolarFunction,
  type PolarFunctionId,
} from '../shared/calculus'

export interface PolarAreaParams extends SimulationParamsBase {
  curveType: string
  scale: number
  sectors: number
}

export interface PolarSector {
  startTheta: number
  endTheta: number
  radius: number
  area: number
}

export interface PolarAreaFrame {
  sectorCount: number
  sectors: PolarSector[]
  cumulativeArea: number
  error: number
}

export interface PolarAreaResult extends SimulationResultBase {
  path: Array<{ theta: number; x: number; y: number; r: number }>
  frames: PolarAreaFrame[]
  exactArea: number
}

function buildTimeline(frames: PolarAreaFrame[]): SimulationTimeline {
  return {
    frames: frames.map((frame) => ({
      label: `${frame.sectorCount} sektör`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Eğri Ailesi Karşılaştır',
      change: 'Rose, cardioid ve spiral arasında geçiş yap.',
      expectation: 'Aynı alan hesabı formülü, çok farklı polar geometrileri kapsadığını gösterecek.',
    },
    {
      title: 'Sektör Sayısını Artır',
      change: 'Sectors değerini büyüt ve animasyonu tekrar oynat.',
      expectation: 'Küçük dilimler gerçek eğriyi daha iyi takip edecek ve hata azalacak.',
    },
    {
      title: 'Ölçeği Büyüt',
      change: 'Scale parametresini artır.',
      expectation: 'Alan büyümesi lineer değil, yaklaşık kare ölçeğinde artacak.',
    },
  ]
}

export function derivePolarAreaResult(params: PolarAreaParams): PolarAreaResult {
  const curveType = params.curveType as PolarFunctionId
  const thetaMax = polarThetaMax(curveType)
  const path = samplePolarCurve(curveType, params.scale, thetaMax, 180)
  const exactArea = exactPolarArea(curveType, params.scale)
  const frames: PolarAreaFrame[] = []

  for (let sectorCount = 2; sectorCount <= params.sectors; sectorCount += 1) {
    const dTheta = thetaMax / sectorCount
    const sectors: PolarSector[] = []
    let cumulativeArea = 0

    for (let index = 0; index < sectorCount; index += 1) {
      const startTheta = index * dTheta
      const endTheta = startTheta + dTheta
      const sampleTheta = (startTheta + endTheta) / 2
      const radius = Math.abs(evaluatePolarFunction(curveType, sampleTheta, params.scale))
      const area = 0.5 * radius ** 2 * dTheta
      cumulativeArea += area
      sectors.push({ startTheta, endTheta, radius, area })
    }

    frames.push({
      sectorCount,
      sectors,
      cumulativeArea,
      error: Math.abs(cumulativeArea - exactArea),
    })
  }

  return {
    path,
    frames,
    exactArea,
    metrics: [
      { label: 'Polar Eğri', value: getPolarFunctionLabel(curveType, params.scale), tone: 'primary' },
      { label: 'Tam Alan', value: exactArea.toFixed(4), tone: 'secondary' },
      {
        label: 'Son Yaklaşım',
        value: frames.at(-1)?.cumulativeArea.toFixed(4) ?? '0.0000',
        tone: 'tertiary',
      },
      {
        label: 'Son Hata',
        value: frames.at(-1)?.error.toFixed(4) ?? '0.0000',
        tone: (frames.at(-1)?.error ?? 1) < 0.2 ? 'secondary' : 'warning',
      },
    ],
    learning: {
      summary: `${getPolarFunctionLabel(curveType, params.scale)} eğrisinin kapsadığı alan sektör birikimiyle yaklaşıklandı.`,
      interpretation: 'Polar koordinatlarda alan, dikdörtgenlerle değil sektörlerle birikir. Bu yüzden temel yapı 1/2 · r² · Δθ ifadesidir.',
      warnings: 'r değeri işaret değiştirse bile alan hesabı sektörün büyüklüğünden gelir; yalnızca Kartezyen şekle bakmak yanıltabilir.',
      tryNext: 'Farklı eğri ailelerine geçip aynı sektör mantığının ne kadar farklı şekilleri yönettiğini karşılaştır.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(frames),
  }
}
