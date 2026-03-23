import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type { DerivativeLabParams, DerivativeLabResult } from './logic'

export function DerivativeLabVisualization({
  params,
  result,
  runtime,
}: VisualizationProps<DerivativeLabParams, DerivativeLabResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const pointData = [
    { x: params.point, y: result.pointValue },
    { x: params.point + activeFrame.h, y: result.pointValue + activeFrame.secantSlope * activeFrame.h },
  ]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'h küçülüyor' : 'Secant → tangent'}
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">h</p>
            <p className="font-mono text-sm text-primary">{activeFrame.h.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Secant Eğimi</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.secantSlope.toFixed(4)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Secant ve Tangent
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.curve}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
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
                <Line dataKey="y" type="monotone" stroke="#d0bcff" strokeWidth={2.5} dot={false} />
                <Line data={activeFrame.secantLine} dataKey="y" type="linear" stroke="#ffb869" strokeWidth={2} dot={false} />
                <Line data={activeFrame.tangentLine} dataKey="y" type="linear" stroke="#4cd7f6" strokeWidth={2} dot={false} />
                <Scatter data={pointData} fill="#ffffff" />
                <ReferenceDot x={params.point} y={result.pointValue} r={5} fill="#4cd7f6" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Eğimin Yakınsaması
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.convergenceData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="step" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
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
                <ReferenceLine y={result.tangentSlope} stroke="#4cd7f6" strokeDasharray="4 2" />
                <Line dataKey="secantSlope" type="monotone" stroke="#d0bcff" strokeWidth={2.5} dot={false} />
                <Line dataKey="error" type="monotone" stroke="#ffb869" strokeWidth={1.8} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
