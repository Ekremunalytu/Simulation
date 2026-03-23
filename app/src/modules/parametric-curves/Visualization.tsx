import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type { ParametricCurvesParams, ParametricCurvesResult } from './logic'

export function ParametricCurvesVisualization({
  result,
  runtime,
}: VisualizationProps<ParametricCurvesParams, ParametricCurvesResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const tangentData = [
    {
      x: activeFrame.point.x - activeFrame.tangent.x * 0.2,
      y: activeFrame.point.y - activeFrame.tangent.y * 0.2,
    },
    {
      x: activeFrame.point.x + activeFrame.tangent.x * 0.2,
      y: activeFrame.point.y + activeFrame.tangent.y * 0.2,
    },
  ]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            parametrik hareket
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">t</p>
            <p className="font-mono text-sm text-primary">{activeFrame.t.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Hız</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.speed.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Eğri ve Tangent
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.path}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis dataKey="y" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #555', borderRadius: '8px', fontSize: '11px', color: '#e5e2e1' }}
                />
                <Line dataKey="y" type="monotone" stroke="#d0bcff" strokeWidth={2.3} dot={false} />
                <Line data={tangentData} dataKey="y" type="linear" stroke="#4cd7f6" strokeWidth={2.1} dot={false} />
                <Scatter data={[activeFrame.point]} fill="#ffb869" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Hız Profili
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.speedData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="t" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #555', borderRadius: '8px', fontSize: '11px', color: '#e5e2e1' }}
                />
                <Line dataKey="speed" type="monotone" stroke="#4cd7f6" strokeWidth={2.4} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
