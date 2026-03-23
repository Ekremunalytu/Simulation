import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type { PolarAreaParams, PolarAreaResult } from './logic'

function project(points: PolarAreaResult['path']) {
  return points.map((point) => `${point.x},${point.y}`).join(' ')
}

export function PolarAreaVisualization({
  result,
  runtime,
}: VisualizationProps<PolarAreaParams, PolarAreaResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const chartData = result.frames.map((frame) => ({
    sectorCount: frame.sectorCount,
    area: frame.cumulativeArea,
    error: frame.error,
  }))

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            polar sektör birikimi
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Sektör</p>
            <p className="font-mono text-sm text-primary">{activeFrame.sectorCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Alan</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.cumulativeArea.toFixed(4)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Polar Eğri
          </h4>
          <div className="flex-1 min-h-[260px]">
            <svg viewBox="-4 -4 8 8" className="w-full h-full">
              <polyline fill="none" stroke="#d0bcff" strokeWidth="0.06" points={project(result.path)} />
              {activeFrame.sectors.map((sector, index) => {
                const p1 = `${sector.radius * Math.cos(sector.startTheta)},${sector.radius * Math.sin(sector.startTheta)}`
                const p2 = `${sector.radius * Math.cos(sector.endTheta)},${sector.radius * Math.sin(sector.endTheta)}`
                return (
                  <polygon
                    key={index}
                    points={`0,0 ${p1} ${p2}`}
                    fill="rgba(76,215,246,0.14)"
                    stroke="rgba(76,215,246,0.3)"
                    strokeWidth="0.03"
                  />
                )
              })}
            </svg>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Alan Yakınsaması
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis dataKey="sectorCount" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <YAxis stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(24, 24, 32, 0.92)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '12px', color: '#e5e2e1' }}
                />
                <ReferenceLine y={result.exactArea} stroke="#4cd7f6" strokeDasharray="4 2" />
                <Line dataKey="area" type="monotone" stroke="#d0bcff" strokeWidth={2.4} dot={false} />
                <Line dataKey="error" type="monotone" stroke="#ffb869" strokeWidth={1.8} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
