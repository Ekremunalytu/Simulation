import type {
  GuidedExperiment,
  SimulationParamsBase,
  SimulationTimeline,
} from '../../types/simulation'
import {
  runValueIteration,
  type DynamicProgrammingResultBase,
  type GridMapLayout,
} from '../shared/dynamic-programming'

export interface ValueIterationParams extends SimulationParamsBase {
  mapLayout: GridMapLayout
  gamma: number
  stepReward: number
  wallPenalty: number
  goalReward: number
  sweeps: number
}

export interface ValueIterationResult extends DynamicProgrammingResultBase {}

function buildTimeline(frameCount: number): SimulationTimeline {
  return {
    frames: Array.from({ length: frameCount }, (_, index) => ({
      label: `${index + 1}. sweep`,
    })),
  }
}

function buildExperiments(): GuidedExperiment[] {
  return [
    {
      title: 'Discount Sıkıştır',
      change: 'Gamma değerini düşür.',
      expectation: 'Uzak ödüller önem kaybeder; başlangıç hücresinin value değeri belirgin şekilde küçülür.',
    },
    {
      title: 'Cliff Walk',
      change: 'Haritayı cliff-walk seç.',
      expectation: 'Greedy path, yüksek ödüle giderken pit riskini dengelemek zorunda kalır.',
    },
    {
      title: 'Sweep Sayısı',
      change: 'Sweep sayısını artır.',
      expectation: 'Delta küçülür ve value yüzeyi Bellman optimumuna daha çok yaklaşır.',
    },
  ]
}

export function deriveValueIterationResult(
  params: ValueIterationParams,
): ValueIterationResult {
  const computed = runValueIteration(params)
  const finalDelta = computed.deltaSeries.at(-1)?.delta ?? 0

  return {
    ...computed,
    metrics: [
      { label: 'Start Value', value: computed.startValue.toFixed(2), tone: 'primary' },
      { label: 'Final Delta', value: finalDelta.toFixed(3), tone: 'secondary' },
      { label: 'Greedy Path', value: String(computed.finalPath.length), tone: 'tertiary' },
      { label: 'Convergence', value: String(computed.convergenceStep), tone: 'neutral' },
    ],
    learning: {
      summary: `Value iteration, ${params.sweeps} sweep boyunca Bellman optimality güncellemesini tekrar ederek value yüzeyi oluşturdu.`,
      interpretation:
        params.gamma > 0.9
          ? 'Yüksek gamma, uzak ödülleri güçlü biçimde taşıdığı için başlangıç hücreleri bile hedefin etkisini erken hissetmeye başlar.'
          : 'Daha düşük gamma, yakın ödülleri öne çıkarır; value alanı daha lokal davranır ve uzak hedefin etkisi çabuk sönümlenir.',
      warnings:
        finalDelta > 0.05
          ? 'Sweep sayısı hâlâ düşük olabilir; greedy policy görünür şekilde oluşsa bile value fonksiyonu tam oturmamış olabilir.'
          : 'Delta küçülmüş durumda; bu, ardışık Bellman güncellemelerinin artık büyük değişim üretmediğini gösterir.',
      tryNext:
        params.mapLayout === 'easy-goal'
          ? 'Aynı parametrelerle cliff-walk haritasına geçip riskli terminal durumların value yüzeyini nasıl büktüğünü karşılaştır.'
          : 'Step reward değerini daha negatif yap ve greedy pathin daha kısa rota aramaya nasıl zorlandığını izle.',
    },
    experiments: buildExperiments(),
    timeline: buildTimeline(computed.frames.length),
  }
}
