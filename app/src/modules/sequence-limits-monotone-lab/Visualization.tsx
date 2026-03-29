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
import {
  chartGridStroke,
  chartStroke,
  chartTick,
  chartTooltipStyle,
} from '../../components/simulation/chartTheme'
import type { VisualizationProps } from '../../types/simulation'
import type {
  SequenceLimitsMonotoneLabParams,
  SequenceLimitsMonotoneLabResult,
} from './logic'

export function SequenceLimitsMonotoneLabVisualization({
  result,
  runtime,
}: VisualizationProps<SequenceLimitsMonotoneLabParams, SequenceLimitsMonotoneLabResult>) {
  const visibleFrames = result.frames.slice(0, Math.min(runtime.frameIndex + 1, result.frames.length))
  const activeFrame = visibleFrames.at(-1) ?? result.frames[0]

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_10px_#4cd7f6]" />
            <span className="text-xs font-mono uppercase tracking-widest text-outline">
              {result.scenarioLabel}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            {result.monotoneLabel} · {result.boundedLabel}
          </p>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Terim</p>
            <p className="text-sm font-mono text-primary">{activeFrame?.n ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Değer</p>
            <p className="text-sm font-mono text-secondary">{activeFrame?.value.toFixed(4)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Gap</p>
            <p className="text-sm font-mono text-tertiary">{(activeFrame?.gap ?? 0).toFixed(4)}</p>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-4 xl:grid-cols-[1.2fr_0.9fr]">
        <div className="surface-panel flex min-h-0 flex-col rounded-[22px] p-4">
          <h4 className="eyebrow mb-3">Dizi Akışı</h4>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={visibleFrames}>
                <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="n" stroke={chartStroke} tick={chartTick} tickLine={false} />
                <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <ReferenceLine y={Number(result.targetLimit.toFixed(3))} stroke="#ffb869" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="upper" stroke="#7d7688" strokeWidth={1.4} dot={false} connectNulls />
                <Line type="monotone" dataKey="lower" stroke="#7d7688" strokeWidth={1.4} dot={false} connectNulls />
                <Line type="monotone" dataKey="value" stroke="#4cd7f6" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-rows-[minmax(0,0.9fr)_minmax(0,1fr)]">
          <div className="surface-panel rounded-[22px] p-4">
            <h4 className="eyebrow mb-3">Yakınsama Özeti</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Hedef Limit</p>
                <p className="mt-2 text-lg font-semibold text-on-surface">
                  {result.targetLimit.toFixed(3)}
                </p>
              </div>
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Monotonluk</p>
                <p className="mt-2 text-lg font-semibold text-secondary">{result.monotoneLabel}</p>
              </div>
              <div className="col-span-2 rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Sınırlılık</p>
                <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                  {result.boundedLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-panel rounded-[22px] p-4">
            <h4 className="eyebrow mb-3">Aktif Terim</h4>
            <div className="space-y-3">
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">aₙ</p>
                <p className="mt-2 text-xl font-semibold text-primary">
                  {activeFrame?.value.toFixed(4)}
                </p>
              </div>
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Üst - Alt Gap</p>
                <p className="mt-2 text-xl font-semibold text-tertiary">
                  {(activeFrame?.gap ?? 0).toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
