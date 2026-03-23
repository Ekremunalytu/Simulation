import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type { GradientDescentParams, GradientDescentResult } from './logic'

export function GradientDescentVisualization({
  result,
  runtime,
}: VisualizationProps<GradientDescentParams, GradientDescentResult>) {
  const visibleFrame = Math.min(runtime.frameIndex, result.path.length - 1)
  const visiblePath = result.path.slice(0, visibleFrame + 1)
  const currentPoint = visiblePath[visiblePath.length - 1]

  const lossData = visiblePath.map((point) => ({
    iteration: point.iteration,
    loss: point.loss,
  }))
  const trajectoryData = visiblePath.map((point, index) => ({
    x: point.x,
    y: point.y,
    step: index,
  }))

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                result.converged
                  ? 'bg-secondary shadow-[0_0_8px_#4cd7f6]'
                  : 'bg-tertiary shadow-[0_0_8px_#ffb869]'
              }`}
            />
            <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
              {runtime.isPlaying ? 'Yeniden Oynatılıyor' : runtime.runMode === 'timeline' ? 'Adım Analizi' : 'Anlık Görünüm'}
            </span>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Görünür Kayıp</p>
            <p className="font-mono text-sm text-secondary">{currentPoint.loss.toFixed(6)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Konum</p>
            <p className="font-mono text-sm text-primary">
              ({currentPoint.x.toFixed(3)}, {currentPoint.y.toFixed(3)})
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            İterasyonlara Göre Kayıp
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={lossData}>
                <defs>
                  <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4cd7f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#4cd7f6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis
                  dataKey="iteration"
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Area type="monotone" dataKey="loss" fill="url(#lossGradient)" stroke="none" />
                <Line type="monotone" dataKey="loss" stroke="#4cd7f6" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
              Parametre Yörüngesi
            </h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-tertiary" />
                <span className="text-[9px] font-mono text-outline">Başlangıç</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-[9px] font-mono text-outline">Güncel</span>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  name="θ₀"
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                  label={{
                    value: 'θ₀',
                    position: 'insideBottomRight',
                    offset: -4,
                    fontSize: 11,
                    fill: '#7a7388',
                  }}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  name="θ₁"
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                  label={{
                    value: 'θ₁',
                    position: 'insideTopLeft',
                    offset: -4,
                    fontSize: 11,
                    fill: '#7a7388',
                  }}
                />
                <ZAxis range={[24, 24]} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                  formatter={(value) => (typeof value === 'number' ? value.toFixed(4) : value)}
                />
                <Scatter
                  data={trajectoryData}
                  fill="#e0d0ff"
                  line={{ stroke: '#d0bcff', strokeWidth: 1.5 }}
                  shape={(props: { cx?: number; cy?: number; payload?: { step: number } }) => {
                    const { cx = 0, cy = 0, payload } = props
                    const isFirst = payload?.step === 0
                    const isLast = payload?.step === trajectoryData.length - 1

                    if (isFirst) {
                      return <circle cx={cx} cy={cy} r={6} fill="#ffb869" stroke="#ffb869" strokeWidth={2} opacity={0.9} />
                    }

                    if (isLast) {
                      return <circle cx={cx} cy={cy} r={6} fill="#4cd7f6" stroke="#4cd7f6" strokeWidth={2} opacity={0.9} />
                    }

                    return <circle cx={cx} cy={cy} r={3} fill="#d0bcff" opacity={0.6} />
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
