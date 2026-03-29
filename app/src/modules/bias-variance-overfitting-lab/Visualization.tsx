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
  BiasVarianceOverfittingLabParams,
  BiasVarianceOverfittingLabResult,
} from './logic'

function buildPath(
  samples: Array<{ x: number; y: number }>,
  mapX: (value: number) => number,
  mapY: (value: number) => number,
) {
  return samples
    .map((sample, index) => `${index === 0 ? 'M' : 'L'} ${mapX(sample.x)} ${mapY(sample.y)}`)
    .join(' ')
}

export function BiasVarianceOverfittingLabVisualization({
  result,
  runtime,
}: VisualizationProps<
  BiasVarianceOverfittingLabParams,
  BiasVarianceOverfittingLabResult
>) {
  const activeFrame = result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const trendData = result.frames.map((frame) => ({
    degree: frame.degree,
    trainMse: Number(frame.trainMse.toFixed(4)),
    validationMse: Number(frame.validationMse.toFixed(4)),
    biasProxy: Number(frame.biasProxy.toFixed(4)),
  }))
  const width = 430
  const height = 300
  const pad = 28
  const allY = [
    ...result.trainPoints.map((point) => point.y),
    ...result.validationPoints.map((point) => point.y),
    ...result.trueCurve.map((point) => point.y),
    ...activeFrame.fitCurve.map((point) => point.y),
  ]
  const minX = -2.7
  const maxX = 2.7
  const minY = Math.min(...allY) - 0.3
  const maxY = Math.max(...allY) + 0.3

  const mapX = (value: number) => pad + ((value - minX) / (maxX - minX)) * (width - pad * 2)
  const mapY = (value: number) => height - pad - ((value - minY) / (maxY - minY)) * (height - pad * 2)

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
            Derece {activeFrame.degree} için fit eğrisi ve genelleme davranışı
          </p>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Train</p>
            <p className="text-sm font-mono text-primary">{activeFrame.trainMse.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Validation</p>
            <p className="text-sm font-mono text-secondary">{activeFrame.validationMse.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Gap</p>
            <p className="text-sm font-mono text-tertiary">{activeFrame.varianceProxy.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-4 xl:grid-cols-[1.2fr_0.95fr]">
        <div className="surface-panel rounded-[22px] p-4">
          <h4 className="eyebrow mb-3">Fit Eğrisi</h4>
          <svg viewBox={`0 0 ${width} ${height}`} className="h-[300px] w-full">
            <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#343242" />
            <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#343242" />
            <path d={buildPath(result.trueCurve, mapX, mapY)} fill="none" stroke="#7d7688" strokeWidth="2" />
            <path d={buildPath(activeFrame.fitCurve, mapX, mapY)} fill="none" stroke="#4cd7f6" strokeWidth="2.6" />
            {result.trainPoints.map((point, index) => (
              <circle
                key={`train-${index}`}
                cx={mapX(point.x)}
                cy={mapY(point.y)}
                r="3.5"
                fill="#d0bcff"
              />
            ))}
            {result.validationPoints.map((point, index) => (
              <circle
                key={`val-${index}`}
                cx={mapX(point.x)}
                cy={mapY(point.y)}
                r="2.8"
                fill="#ffb869"
                opacity="0.8"
              />
            ))}
          </svg>
        </div>

        <div className="grid gap-4 xl:grid-rows-[minmax(0,0.95fr)_minmax(0,1fr)]">
          <div className="surface-panel flex min-h-0 flex-col rounded-[22px] p-4">
            <h4 className="eyebrow mb-3">Karmaşıklık Eğrisi</h4>
            <div className="min-h-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="degree" stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <ReferenceLine x={activeFrame.degree} stroke="#ffb869" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="trainMse" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="validationMse" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="biasProxy" stroke="#ffb869" strokeWidth={2.1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="surface-panel rounded-[22px] p-4">
              <p className="text-xs font-mono uppercase text-outline">Degree</p>
              <p className="mt-3 text-2xl font-semibold text-primary">{activeFrame.degree}</p>
            </div>
            <div className="surface-panel rounded-[22px] p-4">
              <p className="text-xs font-mono uppercase text-outline">Bias Proxy</p>
              <p className="mt-3 text-2xl font-semibold text-secondary">
                {activeFrame.biasProxy.toFixed(3)}
              </p>
            </div>
            <div className="surface-panel rounded-[22px] p-4">
              <p className="text-xs font-mono uppercase text-outline">Variance Proxy</p>
              <p className="mt-3 text-2xl font-semibold text-tertiary">
                {activeFrame.varianceProxy.toFixed(3)}
              </p>
            </div>
            <div className="surface-panel rounded-[22px] p-4">
              <p className="text-xs font-mono uppercase text-outline">Validation MSE</p>
              <p className="mt-3 text-2xl font-semibold text-on-surface">
                {activeFrame.validationMse.toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
