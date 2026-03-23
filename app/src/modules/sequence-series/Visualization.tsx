import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type { SequenceSeriesParams, SequenceSeriesResult } from './logic'

export function SequenceSeriesVisualization({
  result,
  runtime,
}: VisualizationProps<SequenceSeriesParams, SequenceSeriesResult>) {
  const visibleTerms = result.termsData.slice(0, Math.min(runtime.frameIndex + 1, result.termsData.length))

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Kısmi toplamlar büyüyor' : 'Seri analizi'}
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Terim Sayısı</p>
            <p className="font-mono text-sm text-primary">{visibleTerms.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Kısmi Toplam</p>
            <p className="font-mono text-sm text-secondary">
              {visibleTerms.at(-1)?.partialSum.toFixed(4) ?? '0.0000'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Kısmi Toplam Eğrisi
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleTerms}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
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
                {result.convergenceTarget !== null ? (
                  <ReferenceLine y={result.convergenceTarget} stroke="#4cd7f6" strokeDasharray="4 2" />
                ) : null}
                <Line dataKey="partialSum" type="monotone" stroke="#d0bcff" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Terim Büyüklükleri
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={visibleTerms}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
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
                <Bar dataKey="value" name="aₙ">
                  {visibleTerms.map((term) => (
                    <Cell key={term.n} fill={term.value >= 0 ? '#4cd7f6' : '#ffb869'} />
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
