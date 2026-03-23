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
import type { KNNClassifierParams, KNNClassifierResult } from './logic'

export function KNNClassifierVisualization({
  result,
  runtime,
}: VisualizationProps<KNNClassifierParams, KNNClassifierResult>) {
  const activeFrame = Math.min(runtime.frameIndex, result.nearestNeighbors.length)
  const visibleNeighbors = result.nearestNeighbors.slice(0, activeFrame)
  const showDecision = runtime.frameIndex >= result.nearestNeighbors.length
  const classA = result.data.filter((point) => point.label === 0)
  const classB = result.data.filter((point) => point.label === 1)

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {activeFrame} / {result.nearestNeighbors.length} komşu görünür
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
              {showDecision ? (result.predictedLabel === 0 ? 'Sınıf A' : 'Sınıf B') : 'Beklemede'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Güven</p>
            <p className="font-mono text-sm text-tertiary">
              {showDecision ? `${(result.confidence * 100).toFixed(1)}%` : '...'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Sınıflandırma Uzayı
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                <YAxis type="number" dataKey="y" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                <ZAxis range={[40, 90]} />
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
                  name="Görünür Komşular"
                  data={visibleNeighbors}
                  fill="#ffb869"
                  shape={(props: { cx?: number; cy?: number }) => (
                    <circle cx={props.cx ?? 0} cy={props.cy ?? 0} r={7} fill="#ffb869" stroke="#111" strokeWidth={1.5} />
                  )}
                />
                <Scatter
                  name="Sorgu"
                  data={[{ x: result.query.x, y: result.query.y }]}
                  fill={showDecision ? (result.predictedLabel === 0 ? '#d0bcff' : '#4cd7f6') : '#ffffff'}
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
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Oy Dağılımı
              </h4>
              <span className="text-xs font-mono text-outline">
                {result.nearestNeighbors.length} komşu
              </span>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.voteBreakdown}>
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
                  <Bar dataKey="weight" radius={[6, 6, 0, 0]} fill="#4cd7f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Komşu Listesi
              </h4>
              <span className="text-xs font-mono text-primary">
                {result.weightedVote ? 'Ağırlıklı oy' : 'Düz oy'}
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              {result.nearestNeighbors.map((neighbor) => {
                const visible = visibleNeighbors.some((item) => item.id === neighbor.id)
                return (
                  <div
                    key={neighbor.id}
                    className={`rounded-lg p-3 transition-colors ${
                      visible ? 'bg-primary/10' : 'bg-surface-container-low/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-on-surface">
                        #{neighbor.rank} · {neighbor.label === 0 ? 'Sınıf A' : 'Sınıf B'}
                      </p>
                      <p className="text-xs font-mono text-outline">
                        d={neighbor.distance.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      ({neighbor.x.toFixed(2)}, {neighbor.y.toFixed(2)}) · ağırlık {neighbor.weight.toFixed(2)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
