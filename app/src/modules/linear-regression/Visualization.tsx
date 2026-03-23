import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
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
  LinearRegressionDerivedResult,
  LinearRegressionParams,
} from './logic'

export function LinearRegressionVisualization({
  result,
  runtime,
}: VisualizationProps<LinearRegressionParams, LinearRegressionDerivedResult>) {
  const visibleFrame = Math.min(runtime.frameIndex, result.playbackFrames.length - 1)
  const activeFrame = result.playbackFrames[visibleFrame] ?? {
    visibleCount: result.data.length,
    data: result.data,
    regression: result.regression,
  }

  const composedData = activeFrame.data.map((point) => ({
    x: point.x,
    actual: point.y,
    predicted: activeFrame.regression.slope * point.x + activeFrame.regression.intercept,
  }))

  return (
    <div className="w-full h-full flex flex-col gap-5 p-5 md:p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
            <span className="text-xs font-mono text-outline">
              {runtime.isPlaying ? 'Yeniden Oynatılıyor' : runtime.runMode === 'timeline' ? 'Adım Analizi' : 'Çalıştırılmış Uyum'}
            </span>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="font-mono text-xs text-outline">R²</p>
            <p className="font-mono text-base text-secondary">{activeFrame.regression.rSquared.toFixed(4)}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-outline">Denklem</p>
            <p className="font-mono text-base text-primary">
              y = {activeFrame.regression.slope.toFixed(2)}x + {activeFrame.regression.intercept.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 md:p-5 flex flex-col">
          <h4 className="eyebrow mb-3">
            Veri ve Regresyon Doğrusu
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={composedData}>
                <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  stroke={chartStroke}
                  tick={chartTick}
                  tickLine={false}
                />
                <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Scatter dataKey="actual" fill="#e0d0ff" r={4} name="Veri" opacity={0.85} />
                <Line dataKey="predicted" stroke="#4cd7f6" strokeWidth={2.5} dot={false} name="Uyum" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 md:p-5 flex flex-col">
          <h4 className="eyebrow mb-3">
            Residual Değerleri
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeFrame.regression.residuals}>
                <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  stroke={chartStroke}
                  tick={chartTick}
                  tickLine={false}
                />
                <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                <ReferenceLine y={0} stroke="#777" strokeDasharray="4 2" />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="residual" name="Residual" opacity={0.85}>
                  {activeFrame.regression.residuals.map((entry, index) => (
                    <Cell key={index} fill={entry.residual >= 0 ? '#b090ff' : '#4cd7f6'} />
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
