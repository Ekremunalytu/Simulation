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
import type { DoubleIntegralParams, DoubleIntegralResult } from './logic'

function getCellColor(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min || 1)
  const blue = 120 + ratio * 100
  return `rgba(76, ${Math.round(140 + ratio * 70)}, ${Math.round(blue)}, 0.65)`
}

export function DoubleIntegralVisualization({
  result,
  runtime,
}: VisualizationProps<DoubleIntegralParams, DoubleIntegralResult>) {
  const visibleCount = Math.min(runtime.frameIndex + 1, result.cells.length)
  const visibleCells = result.cells.slice(0, visibleCount)
  const heights = result.cells.map((cell) => cell.height)
  const min = Math.min(...heights)
  const max = Math.max(...heights)

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Hacim hücreleri birikiyor' : 'Çift integral yaklaşımı'}
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Görünür Hücre</p>
            <p className="font-mono text-sm text-primary">{visibleCount}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Kümülatif Hacim</p>
            <p className="font-mono text-sm text-secondary">
              {visibleCells.at(-1)?.cumulative.toFixed(4) ?? '0.0000'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Hücre Isı Haritası
          </h4>
          <div className="flex-1 min-h-[260px]">
            <svg viewBox="0 0 420 320" className="w-full h-full">
              <rect width="420" height="320" fill="transparent" />
              {visibleCells.map((cell) => {
                const x = 50 + ((cell.xCenter + 2.5) / 5) * 280
                const y = 260 - ((cell.yCenter + 2.5) / 5) * 200
                const size = 18
                return (
                  <rect
                    key={cell.index}
                    x={x - size / 2}
                    y={y - size / 2}
                    width={size}
                    height={size}
                    fill={getCellColor(cell.height, min, max)}
                    stroke="rgba(255,255,255,0.08)"
                  />
                )
              })}
            </svg>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Kümülatif Toplam
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleCells}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="index" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
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
                <ReferenceLine y={result.exactValue} stroke="#4cd7f6" strokeDasharray="4 2" />
                <Line dataKey="cumulative" type="monotone" stroke="#d0bcff" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
