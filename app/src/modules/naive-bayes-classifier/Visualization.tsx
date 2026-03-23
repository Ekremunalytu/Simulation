import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type {
  GaussianClassStats,
  NaiveBayesClassifierParams,
  NaiveBayesClassifierResult,
} from './logic'

function visibleValue(frameIndex: number, stepIndex: number, value: number) {
  return frameIndex >= stepIndex ? value : 0
}

function contributionData(frameIndex: number, classStats: GaussianClassStats[]) {
  return classStats.map((stat) => ({
    label: stat.label === 0 ? 'Sınıf A' : 'Sınıf B',
    prior: visibleValue(frameIndex, 0, stat.prior),
    likelihoodX: visibleValue(frameIndex, 1, stat.likelihoodX),
    likelihoodY: visibleValue(frameIndex, 2, stat.likelihoodY),
    posterior: visibleValue(frameIndex, 3, stat.posterior),
  }))
}

export function NaiveBayesClassifierVisualization({
  result,
  runtime,
}: VisualizationProps<NaiveBayesClassifierParams, NaiveBayesClassifierResult>) {
  const classA = result.data.filter((point) => point.label === 0)
  const classB = result.data.filter((point) => point.label === 1)
  const activeFrame = Math.min(runtime.frameIndex, 3)
  const chartData = contributionData(activeFrame, result.classStats)

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {result.distributionLabel} · adım {activeFrame + 1} / 4
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Sorgu</p>
            <p className="font-mono text-sm text-primary">
              ({result.query.x.toFixed(1)}, {result.query.y.toFixed(1)})
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Tahmin</p>
            <p className="font-mono text-sm text-secondary">
              {activeFrame >= 3 ? (result.predictedLabel === 0 ? 'Sınıf A' : 'Sınıf B') : 'Beklemede'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Posterior</p>
            <p className="font-mono text-sm text-tertiary">
              {activeFrame >= 3 ? `${(result.confidence * 100).toFixed(1)}%` : '...'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Sınıf Dağılımı ve Sorgu
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                <YAxis type="number" dataKey="y" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                <ZAxis range={[42, 80]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(24, 24, 32, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e5e2e1',
                  }}
                />
                <Scatter name="Sınıf A" data={classA} fill="#d0bcff" />
                <Scatter name="Sınıf B" data={classB} fill="#4cd7f6" />
                <Scatter
                  name="Sorgu"
                  data={[result.query]}
                  fill="#ffffff"
                  shape={(props: { cx?: number; cy?: number }) => {
                    const cx = props.cx ?? 0
                    const cy = props.cy ?? 0
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={8} fill="#0f0f0f" stroke="#ffffff" strokeWidth={1.5} />
                        <path d={`M ${cx - 8} ${cy} L ${cx + 8} ${cy} M ${cx} ${cy - 8} L ${cx} ${cy + 8}`} stroke="#ffffff" strokeWidth={1.5} />
                      </g>
                    )
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-rows-[0.8fr_1.2fr] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
              Adım Adım Katkılar
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                  <YAxis stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(24, 24, 32, 0.92)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e5e2e1',
                    }}
                  />
                  <Bar dataKey="prior" stackId="a" fill="#ffb869" />
                  <Bar dataKey="likelihoodX" stackId="a" fill="#d0bcff" />
                  <Bar dataKey="likelihoodY" stackId="a" fill="#4cd7f6" />
                  <Bar dataKey="posterior" stackId="a" fill="#98d7a5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Sınıf İstatistikleri
              </h4>
              <span className="text-xs font-mono text-primary">
                {activeFrame >= 3 ? 'Posterior açık' : 'Ara katkılar'}
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              {result.classStats.map((stat) => (
                <div key={stat.label} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-on-surface">
                      {stat.label === 0 ? 'Sınıf A' : 'Sınıf B'}
                    </p>
                    <p className="text-xs font-mono text-outline">
                      prior {stat.prior.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    μ=({stat.meanX.toFixed(2)}, {stat.meanY.toFixed(2)}) · σ²=({stat.varianceX.toFixed(2)}, {stat.varianceY.toFixed(2)})
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Lx {activeFrame >= 1 ? stat.likelihoodX.toFixed(4) : '...'} · Ly {activeFrame >= 2 ? stat.likelihoodY.toFixed(4) : '...'} · Post {activeFrame >= 3 ? stat.posterior.toFixed(3) : '...'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
