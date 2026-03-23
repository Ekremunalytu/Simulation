import {
  Bar,
  BarChart,
  CartesianGrid,
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
import type { PCAExplorerParams, PCAExplorerResult } from './logic'

export function PCAExplorerVisualization({
  result,
  runtime,
}: VisualizationProps<PCAExplorerParams, PCAExplorerResult>) {
  const activeFrame = result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const displayPoints =
    activeFrame.stage === 'raw'
      ? result.rawPoints
      : activeFrame.stage === 'reconstruction'
        ? result.reconstructedPoints
        : result.centeredPoints
  const xValues = displayPoints.map((point) => point.x)
  const yValues = displayPoints.map((point) => point.y)
  const minX = Math.min(...xValues) - 1
  const maxX = Math.max(...xValues) + 1
  const minY = Math.min(...yValues) - 1
  const maxY = Math.max(...yValues) + 1
  const width = 420
  const height = 320
  const pad = 32
  const mapX = (value: number) => pad + ((value - minX) / (maxX - minX)) * (width - pad * 2)
  const mapY = (value: number) => height - pad - ((value - minY) / (maxY - minY)) * (height - pad * 2)
  const axisScale = 90

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            PCA decomposition
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Stage</p>
            <p className="font-mono text-sm text-primary">{activeFrame.label}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">PC1</p>
            <p className="font-mono text-sm text-secondary">{(result.explainedVariance[0]!.ratio * 100).toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">RMSE</p>
            <p className="font-mono text-sm text-tertiary">{result.reconstructionError.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.05fr_1fr] gap-4 min-h-0">
        <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4">
          <h4 className="eyebrow mb-3">Scatter, Axes ve Projection</h4>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[320px]">
            <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#3c3747" />
            <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#3c3747" />

            {activeFrame.stage === 'projection'
              ? result.pc1ProjectedPoints.map((point) => (
                  <line
                    key={`proj-${point.id}`}
                    x1={mapX(result.centeredPoints.find((item) => item.id === point.id)?.x ?? point.x)}
                    y1={mapY(result.centeredPoints.find((item) => item.id === point.id)?.y ?? point.y)}
                    x2={mapX(point.x)}
                    y2={mapY(point.y)}
                    stroke="rgba(255,184,105,0.4)"
                    strokeWidth="1.5"
                  />
                ))
              : null}

            {activeFrame.stage === 'axes' || activeFrame.stage === 'projection' || activeFrame.stage === 'reconstruction' ? (
              <>
                <line
                  x1={mapX(0)}
                  y1={mapY(0)}
                  x2={mapX(result.components[0]!.x * axisScale / 32)}
                  y2={mapY(result.components[0]!.y * axisScale / 32)}
                  stroke="#4cd7f6"
                  strokeWidth="3"
                />
                <line
                  x1={mapX(0)}
                  y1={mapY(0)}
                  x2={mapX(result.components[1]!.x * axisScale / 32)}
                  y2={mapY(result.components[1]!.y * axisScale / 32)}
                  stroke="#d0bcff"
                  strokeWidth="3"
                />
              </>
            ) : null}

            {displayPoints.map((point) => (
              <circle
                key={point.id}
                cx={mapX(point.x)}
                cy={mapY(point.y)}
                r="4.5"
                fill={point.clusterId === 0 ? '#d0bcff' : '#4cd7f6'}
                opacity={0.9}
              />
            ))}
          </svg>
        </div>

        <div className="grid grid-rows-[minmax(0,0.8fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
            <h4 className="eyebrow mb-3">Explained Variance</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.explainedVariance}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="component" stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="ratio" fill="#4cd7f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
            <h4 className="eyebrow mb-3">Variance Trail</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { step: 1, explained: result.explainedVariance[0]!.ratio, reconstruction: result.reconstructionError },
                    { step: 2, explained: 1, reconstruction: 0 },
                  ]}
                >
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="step" stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="explained" stroke="#d0bcff" strokeWidth={2.4} dot={false} />
                  <Line type="monotone" dataKey="reconstruction" stroke="#ffb869" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
