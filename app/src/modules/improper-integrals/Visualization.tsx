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
import type { ImproperIntegralsParams, ImproperIntegralsResult } from './logic'

export function ImproperIntegralsVisualization({
  result,
  runtime,
}: VisualizationProps<ImproperIntegralsParams, ImproperIntegralsResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const convergenceData = result.frames.map((frame, index) => ({
    step: index + 1,
    cutoff: frame.cutoff,
    partialValue: frame.partialValue,
    error: frame.error,
  }))

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            cutoff yakınsama analizi
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Aktif cutoff</p>
            <p className="font-mono text-sm text-primary">{activeFrame.cutoff}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Kısmi integral</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.partialValue.toFixed(4)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            İntegrand
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.curve}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #555', borderRadius: '8px', fontSize: '11px', color: '#e5e2e1' }}
                />
                <Line dataKey="y" type="monotone" stroke="#d0bcff" strokeWidth={2.4} dot={false} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Kısmi İntegral Akışı
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={convergenceData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="step" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #555', borderRadius: '8px', fontSize: '11px', color: '#e5e2e1' }}
                />
                {result.exactValue !== null ? (
                  <ReferenceLine y={result.exactValue} stroke="#4cd7f6" strokeDasharray="4 2" />
                ) : null}
                <Line dataKey="partialValue" type="monotone" stroke="#d0bcff" strokeWidth={2.4} dot={false} />
                {result.exactValue !== null ? (
                  <Line dataKey="error" type="monotone" stroke="#ffb869" strokeWidth={1.8} dot={false} />
                ) : null}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
