import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type { SeriesTestsLabParams, SeriesTestsLabResult } from './logic'

export function SeriesTestsLabVisualization({
  result,
  runtime,
}: VisualizationProps<SeriesTestsLabParams, SeriesTestsLabResult>) {
  const visibleFrames = result.frames.slice(0, Math.min(runtime.frameIndex + 1, result.frames.length))

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            seri test laboratuvarı
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Terim</p>
            <p className="font-mono text-sm text-primary">{visibleFrames.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Kanıt</p>
            <p className="font-mono text-sm text-secondary">
              {visibleFrames.at(-1)?.evidence.toFixed(4) ?? '0.0000'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Kısmi Toplam
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleFrames}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #555', borderRadius: '8px', fontSize: '11px', color: '#e5e2e1' }}
                />
                <Line dataKey="partialSum" type="monotone" stroke="#d0bcff" strokeWidth={2.4} dot={false} />
                <Line dataKey="evidence" type="monotone" stroke="#4cd7f6" strokeWidth={1.9} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Terim Davranışı
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visibleFrames}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #555', borderRadius: '8px', fontSize: '11px', color: '#e5e2e1' }}
                />
                <Bar dataKey="term">
                  {visibleFrames.map((frame) => (
                    <Cell key={frame.n} fill={frame.term >= 0 ? '#4cd7f6' : '#ffb869'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
