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
import type { LimitExplorerParams, LimitExplorerResult } from './logic'

export function LimitExplorerVisualization({
  params,
  result,
  runtime,
}: VisualizationProps<LimitExplorerParams, LimitExplorerResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const visibleLeft = activeFrame.visibleProbes.filter((probe) => probe.side === 'left')
  const visibleRight = activeFrame.visibleProbes.filter((probe) => probe.side === 'right')
  const currentLeft = activeFrame.currentLeftProbe ? [activeFrame.currentLeftProbe] : []
  const currentRight = activeFrame.currentRightProbe ? [activeFrame.currentRightProbe] : []

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            {params.direction === 'both' ? 'İki taraflı yaklaşım animasyonu' : `${params.direction} taraftan adımlama`}
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Aktif Mesafe</p>
            <p className="font-mono text-sm text-primary">|x-a| = {activeFrame.offset.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">İki Taraflı Limit</p>
            <p className="font-mono text-sm text-secondary">{result.twoSidedDisplay}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Yaklaşım Grafiği
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.curve}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} domain={[-25, 25]} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <ReferenceLine x={params.approachPoint} stroke="#ffb869" strokeDasharray="4 2" />
                {result.limitValue !== null ? (
                  <ReferenceLine y={result.limitValue} stroke="#4cd7f6" strokeDasharray="4 2" />
                ) : null}
                <Line type="monotone" dataKey="y" stroke="#d0bcff" dot={false} strokeWidth={2.5} connectNulls={false} />
                <Scatter data={visibleLeft} fill="#8274a8" />
                <Scatter data={visibleRight} fill="#5b9aac" />
                <Scatter data={currentLeft} fill="#d0bcff" />
                <Scatter data={currentRight} fill="#4cd7f6" />
                {result.holePoint ? (
                  <ReferenceDot
                    x={result.holePoint.x}
                    y={result.holePoint.y}
                    r={6}
                    fill="#0a0a0a"
                    stroke="#d0bcff"
                    strokeWidth={2}
                  />
                ) : null}
                {result.definedPoint ? (
                  <ReferenceDot
                    x={result.definedPoint.x}
                    y={result.definedPoint.y}
                    r={6}
                    fill="#ffb869"
                    stroke="#ffb869"
                    strokeWidth={2}
                  />
                ) : null}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col gap-4">
          <div>
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-3">
              Adım Özeti
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-[10px] uppercase tracking-widest text-outline mb-2">Aktif sol örnek</p>
                <p className="font-mono text-base text-primary">
                  {activeFrame.currentLeftProbe
                    ? `(${activeFrame.currentLeftProbe.x.toFixed(3)}, ${activeFrame.currentLeftProbe.y.toFixed(3)})`
                    : 'Kapalı'}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-[10px] uppercase tracking-widest text-outline mb-2">Aktif sağ örnek</p>
                <p className="font-mono text-base text-secondary">
                  {activeFrame.currentRightProbe
                    ? `(${activeFrame.currentRightProbe.x.toFixed(3)}, ${activeFrame.currentRightProbe.y.toFixed(3)})`
                    : 'Kapalı'}
                </p>
              </div>
              <div className="rounded-xl bg-surface-container-low p-4">
                <p className="text-[10px] uppercase tracking-widest text-outline mb-2">Karar</p>
                <p className="text-sm leading-relaxed text-on-surface">
                  {result.classification === 'removable'
                    ? 'Açık deliğe rağmen iki taraf aynı yüksekliğe sıkışıyor.'
                    : result.classification === 'jump'
                      ? 'İki taraf farklı bantlarda kaldığı için ortak limit oluşmuyor.'
                      : 'Yaklaşım sonlu bir sayıya değil işaretli sonsuza gidiyor.'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
            <p className="text-[10px] uppercase tracking-widest text-outline mb-2">Final okuması</p>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              Soldan: {result.leftDisplay} · Sağdan: {result.rightDisplay} · İki taraflı sonuç: {result.twoSidedDisplay}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
