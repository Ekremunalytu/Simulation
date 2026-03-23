import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationResultBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  exactPolarIntegral,
  getPolarIntegrandLabel,
  getPolarRegionLabel,
  polarRegionBounds,
  polarSectorArea,
  evaluatePolarIntegrand,
  type PolarIntegrandId,
  type PolarRegionId,
} from '../shared/calculus'

export interface ChangeOfVariablesParams extends SimulationParamsBase {
  regionType: string
  integrandType: string
  subdivisions: number
}

export interface ChangeOfVariablesCell {
  step: number
  x: number
  y: number
  rMid: number
  thetaMid: number
  jacobian: number
  contribution: number
  cumulative: number
}

export interface ChangeOfVariablesResult extends SimulationResultBase {
  cells: ChangeOfVariablesCell[]
  exactValue: number
  approxValue: number
}

function buildTimeline(cells: ChangeOfVariablesCell[]): SimulationTimeline {
  return {
    frames: cells.map((cell) => ({
      label: `${cell.step}. sektör`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Grid Yoğunluğu',
      change: 'Subdivisions değerini yükselt.',
      expectation: 'Jacobian ağırlıklı toplam gerçek değere daha kararlı biçimde yaklaşır.',
    },
    {
      title: 'Bölge Tipi',
      change: 'Disk ile halka arasında geçiş yap.',
      expectation: 'Aynı integrand için yalnızca sınırlar değişse bile katkıların dağılımı belirgin biçimde farklılaşır.',
    },
    {
      title: 'Integrand',
      change: 'Unit ile radial-square integrandlarını karşılaştır.',
      expectation: 'Jacobian çarpanı sabit kalırken integrand seçimi dış halkalara daha fazla ağırlık verebilir.',
    },
  ]
}

export function deriveChangeOfVariablesResult(
  params: ChangeOfVariablesParams,
): ChangeOfVariablesResult {
  const regionType = params.regionType as PolarRegionId
  const integrandType = params.integrandType as PolarIntegrandId
  const bounds = polarRegionBounds(regionType)
  const dr = (bounds.rMax - bounds.rMin) / params.subdivisions
  const dTheta = (bounds.thetaMax - bounds.thetaMin) / params.subdivisions
  let cumulative = 0
  let step = 0
  const cells: ChangeOfVariablesCell[] = []

  for (let rIndex = 0; rIndex < params.subdivisions; rIndex += 1) {
    for (let thetaIndex = 0; thetaIndex < params.subdivisions; thetaIndex += 1) {
      const rMid = bounds.rMin + (rIndex + 0.5) * dr
      const thetaMid = bounds.thetaMin + (thetaIndex + 0.5) * dTheta
      const contribution =
        evaluatePolarIntegrand(integrandType, rMid) * polarSectorArea(rMid, dr, dTheta)
      cumulative += contribution
      step += 1
      cells.push({
        step,
        rMid,
        thetaMid,
        x: rMid * Math.cos(thetaMid),
        y: rMid * Math.sin(thetaMid),
        jacobian: rMid,
        contribution,
        cumulative,
      })
    }
  }

  const exactValue = exactPolarIntegral(regionType, integrandType)

  return {
    cells,
    exactValue,
    approxValue: cumulative,
    metrics: [
      { label: 'Bölge', value: getPolarRegionLabel(regionType), tone: 'primary' },
      { label: 'Integrand', value: getPolarIntegrandLabel(integrandType), tone: 'secondary' },
      { label: 'Yaklaşık', value: cumulative.toFixed(3), tone: 'tertiary' },
      { label: 'Tam Değer', value: exactValue.toFixed(3), tone: 'neutral' },
    ],
    learning: {
      summary: `${getPolarRegionLabel(regionType)} bölgesi için Kartezyen integral, polar hücreler ve Jacobian çarpanı üzerinden yeniden toplandı.`,
      interpretation:
        'Değişken dönüşümünde geometri değişirken alan elemanı da değişir. Polar koordinatlarda bu ekstra ölçek çarpanı r ile görünür olur.',
      warnings:
        'Sadece r ve θ sınırlarını dönüştürmek yetmez; alan elemanının Jacobian ile birlikte güncellenmesi gerekir.',
      tryNext:
        'Aynı bölgeyi başka integrand ile tekrar çalıştırıp Jacobian sabit kalırken ağırlığın nasıl yeniden dağıldığını izle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(cells),
  }
}
