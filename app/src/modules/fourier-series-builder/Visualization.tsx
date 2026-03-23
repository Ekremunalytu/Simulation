import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
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
  FourierSeriesBuilderParams,
  FourierSeriesBuilderResult,
} from './logic'

export function FourierSeriesBuilderVisualization({
  result,
  runtime,
}: VisualizationProps<FourierSeriesBuilderParams, FourierSeriesBuilderResult>) {
  const activeFrame = result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            Fourier partial sums
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Harmonic</p>
            <p className="font-mono text-sm text-primary">{activeFrame.harmonic}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">RMSE</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.rmse.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Overshoot</p>
            <p className="font-mono text-sm text-tertiary">{activeFrame.overshoot.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-4 min-h-0">
        <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
          <h4 className="eyebrow mb-3">Target Wave ve Partial Sum</h4>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={activeFrame.curve}>
                <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke={chartStroke} tick={chartTick} tickLine={false} />
                <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="target" stroke="#4cd7f6" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="approximation" stroke="#d0bcff" strokeWidth={2.3} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,0.9fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
            <h4 className="eyebrow mb-3">Spectrum</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeFrame.spectrum}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="harmonic" stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="coefficient" fill="#ffb869" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
            <h4 className="eyebrow mb-3">Error Trend</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.errorSeries}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="harmonic" stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="rmse" stroke="#4cd7f6" strokeWidth={2.4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
