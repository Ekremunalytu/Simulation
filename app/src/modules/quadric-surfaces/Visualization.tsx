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
import type { QuadricSurfacesParams, QuadricSurfacesResult } from './logic'

export function QuadricSurfacesVisualization({
  result,
  runtime,
}: VisualizationProps<QuadricSurfacesParams, QuadricSurfacesResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            kesit ailesi
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Aktif Kesit</p>
            <p className="font-mono text-sm text-primary">{activeFrame.sliceValue.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Düzlem</p>
            <p className="font-mono text-sm text-secondary">{result.planeLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-4 flex-1 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col gap-4">
          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-outline mb-2">
              Kanonik Denklem
            </p>
            <p className="text-base text-on-surface font-medium">{result.equation}</p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-outline mb-2">
              Kesit Okuması
            </p>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Aynı yüzeyin farklı dilimlerde nasıl açıldığını izlemek, 3B şekli zihinde kurmanın en hızlı yoludur.
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            {result.planeLabel} kesiti
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={activeFrame.sectionData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis
                  dataKey="u"
                  type="number"
                  label={{ value: result.horizontalAxis, position: 'insideBottom', offset: -4 }}
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                />
                <YAxis
                  label={{ value: result.verticalAxis, angle: -90, position: 'insideLeft' }}
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <ReferenceLine x={0} stroke="#444" />
                <ReferenceLine y={0} stroke="#444" />
                <Line dataKey="upper" type="monotone" stroke="#d0bcff" strokeWidth={2.3} dot={false} />
                <Line dataKey="lower" type="monotone" stroke="#4cd7f6" strokeWidth={2.1} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
