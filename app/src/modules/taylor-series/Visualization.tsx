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
import type { TaylorSeriesParams, TaylorSeriesResult } from './logic'

export function TaylorSeriesVisualization({
  result,
  runtime,
}: VisualizationProps<TaylorSeriesParams, TaylorSeriesResult>) {
  const activeFrame = result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Derece artıyor' : 'Taylor yaklaşımı'}
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Derece</p>
            <p className="font-mono text-sm text-primary">{activeFrame.degree}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Odak Hatası</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.errorAtFocus.toFixed(6)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Fonksiyon ve Polinom
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={activeFrame.curve}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <YAxis stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(24, 24, 32, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e5e2e1',
                  }}
                />
                <ReferenceLine x={0} stroke="#777" strokeDasharray="4 2" />
                <Line dataKey="actual" type="monotone" stroke="#4cd7f6" strokeWidth={2.5} dot={false} />
                <Line dataKey="approximation" type="monotone" stroke="#d0bcff" strokeWidth={2.3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Dereceye Göre Hata
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.errorSeries}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis dataKey="degree" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <YAxis stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(24, 24, 32, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e5e2e1',
                  }}
                />
                <Line dataKey="error" type="monotone" stroke="#ffb869" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
