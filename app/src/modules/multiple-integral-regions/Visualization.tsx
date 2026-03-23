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
import type {
  MultipleIntegralRegionsParams,
  MultipleIntegralRegionsResult,
} from './logic'

export function MultipleIntegralRegionsVisualization({
  result,
  runtime,
}: VisualizationProps<MultipleIntegralRegionsParams, MultipleIntegralRegionsResult>) {
  const visibleCount = Math.min(runtime.frameIndex + 1, result.cells.length)
  const visibleCells = result.cells.slice(0, visibleCount)
  const side = Math.sqrt(result.cells.length)
  const cellSize = 240 / side

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            bölge maskesi birikimi
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Görünür Hücre</p>
            <p className="font-mono text-sm text-primary">{visibleCount}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Kümülatif Alan</p>
            <p className="font-mono text-sm text-secondary">
              {visibleCells.at(-1)?.cumulative.toFixed(4) ?? '0.0000'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Bölge Izgarası
          </h4>
          <svg viewBox="0 0 320 300" className="w-full h-[300px]">
            <rect width="320" height="300" fill="transparent" />
            {visibleCells.map((cell, index) => {
              const row = Math.floor(index / side)
              const col = index % side
              return (
                <rect
                  key={cell.index}
                  x={30 + col * cellSize}
                  y={30 + row * cellSize}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  fill={cell.included ? 'rgba(76,215,246,0.55)' : 'rgba(208,188,255,0.12)'}
                  stroke="rgba(255,255,255,0.08)"
                />
              )
            })}
          </svg>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Alan Yakınsaması
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleCells}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="index" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #555', borderRadius: '8px', fontSize: '11px', color: '#e5e2e1' }}
                />
                <ReferenceLine y={result.exactArea} stroke="#4cd7f6" strokeDasharray="4 2" />
                <Line dataKey="cumulative" type="monotone" stroke="#d0bcff" strokeWidth={2.3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
