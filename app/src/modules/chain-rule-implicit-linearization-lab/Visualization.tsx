import {
  CartesianGrid,
  Line,
  LineChart,
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
  ChainRuleImplicitLinearizationLabParams,
  ChainRuleImplicitLinearizationLabResult,
} from './logic'

export function ChainRuleImplicitLinearizationLabVisualization({
  result,
  runtime,
}: VisualizationProps<
  ChainRuleImplicitLinearizationLabParams,
  ChainRuleImplicitLinearizationLabResult
>) {
  const activeFrame = result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const chartData = result.approximationSamples.map((sample) => ({
    input: Number(sample.input.toFixed(3)),
    exact: Number(sample.exact.toFixed(4)),
    approximation: Number(sample.approximation.toFixed(4)),
  }))

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
          <p className="text-sm text-on-surface-variant">{result.derivativeBreakdown}</p>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Input</p>
            <p className="text-sm font-mono text-primary">{activeFrame.input.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Approx</p>
            <p className="text-sm font-mono text-secondary">{activeFrame.approximation.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Error</p>
            <p className="text-sm font-mono text-tertiary">{activeFrame.error.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-4 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="surface-panel flex min-h-0 flex-col rounded-[22px] p-4">
          <h4 className="eyebrow mb-3">Exact vs Local Approximation</h4>
          <div className="min-h-0 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="input" stroke={chartStroke} tick={chartTick} tickLine={false} />
                <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <ReferenceLine x={Number(activeFrame.input.toFixed(3))} stroke="#ffb869" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="exact" stroke="#4cd7f6" strokeWidth={2.4} dot={false} />
                <Line type="monotone" dataKey="approximation" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-rows-[minmax(0,0.95fr)_minmax(0,1fr)]">
          <div className="surface-panel rounded-[22px] p-4">
            <h4 className="eyebrow mb-3">Anchor Noktası</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Anchor Input</p>
                <p className="mt-2 text-lg font-semibold text-on-surface">
                  {result.anchorInput.toFixed(3)}
                </p>
              </div>
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Anchor Output</p>
                <p className="mt-2 text-lg font-semibold text-on-surface">
                  {result.anchorOutput.toFixed(3)}
                </p>
              </div>
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Yerel Eğim</p>
                <p className="mt-2 text-lg font-semibold text-secondary">
                  {result.localSlope.toFixed(3)}
                </p>
              </div>
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Aktif Δ</p>
                <p className="mt-2 text-lg font-semibold text-tertiary">
                  {activeFrame.offset >= 0 ? '+' : ''}
                  {activeFrame.offset.toFixed(3)}
                </p>
              </div>
            </div>
          </div>

          <div className="surface-panel rounded-[22px] p-4">
            <h4 className="eyebrow mb-3">Aktif Karşılaştırma</h4>
            <div className="space-y-3">
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Exact</p>
                <p className="mt-2 text-xl font-semibold text-on-surface">
                  {activeFrame.exact.toFixed(4)}
                </p>
              </div>
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Local Approximation</p>
                <p className="mt-2 text-xl font-semibold text-primary">
                  {activeFrame.approximation.toFixed(4)}
                </p>
              </div>
              <div className="rounded-[18px] bg-surface-container-low px-4 py-4">
                <p className="text-xs font-mono uppercase text-outline">Absolute Error</p>
                <p className="mt-2 text-xl font-semibold text-tertiary">
                  {activeFrame.error.toFixed(4)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
