import {
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
import type {
  LogisticRegressionParams,
  LogisticRegressionResult,
} from './logic'

function probabilityFill(probability: number) {
  const alpha = 0.12 + Math.abs(probability - 0.5) * 0.72
  return probability >= 0.5
    ? `rgba(76, 215, 246, ${alpha.toFixed(3)})`
    : `rgba(208, 188, 255, ${alpha.toFixed(3)})`
}

export function LogisticRegressionVisualization({
  result,
  runtime,
}: VisualizationProps<LogisticRegressionParams, LogisticRegressionResult>) {
  const activeFrame = result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const xValues = result.data.map((point) => point.x)
  const yValues = result.data.map((point) => point.y)
  const minX = Math.min(...xValues) - 1
  const maxX = Math.max(...xValues) + 1
  const minY = Math.min(...yValues) - 1
  const maxY = Math.max(...yValues) + 1
  const width = 420
  const height = 320
  const pad = 32

  const mapX = (value: number) => pad + ((value - minX) / (maxX - minX)) * (width - pad * 2)
  const mapY = (value: number) => height - pad - ((value - minY) / (maxY - minY)) * (height - pad * 2)
  const cellWidth = activeFrame.probabilityGrid.length > 0
    ? (width - pad * 2) * (activeFrame.probabilityGrid[0].width / (maxX - minX))
    : 0
  const cellHeight = activeFrame.probabilityGrid.length > 0
    ? (height - pad * 2) * (activeFrame.probabilityGrid[0].height / (maxY - minY))
    : 0

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            Logistic decision boundary
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Epoch</p>
            <p className="font-mono text-sm text-primary">{activeFrame.epoch}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Loss</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.loss.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Accuracy</p>
            <p className="font-mono text-sm text-tertiary">{(activeFrame.accuracy * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4 min-h-0">
        <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4">
          <h4 className="eyebrow mb-3">Probability Surface ve Veri</h4>
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[320px]">
            {activeFrame.probabilityGrid.map((cell, index) => (
              <rect
                key={index}
                x={mapX(cell.x) - cellWidth / 2}
                y={mapY(cell.y) - cellHeight / 2}
                width={cellWidth + 1}
                height={cellHeight + 1}
                fill={probabilityFill(cell.probability)}
              />
            ))}

            <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#3c3747" />
            <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#3c3747" />

            {activeFrame.boundary ? (
              <line
                x1={mapX(activeFrame.boundary.x1)}
                y1={mapY(activeFrame.boundary.y1)}
                x2={mapX(activeFrame.boundary.x2)}
                y2={mapY(activeFrame.boundary.y2)}
                stroke="#ffb869"
                strokeWidth="3"
              />
            ) : null}

            {result.data.map((point) => (
              <circle
                key={point.id}
                cx={mapX(point.x)}
                cy={mapY(point.y)}
                r="5"
                fill={point.label === 1 ? '#4cd7f6' : '#d0bcff'}
                stroke="rgba(7,7,8,0.65)"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>

        <div className="grid grid-rows-[minmax(0,0.95fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
            <h4 className="eyebrow mb-3">Training Curves</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.history}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="loss" stroke="#d0bcff" strokeWidth={2.4} dot={false} />
                  <Line type="monotone" dataKey="accuracy" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              ['TP', activeFrame.confusion.truePositive, 'text-secondary'],
              ['TN', activeFrame.confusion.trueNegative, 'text-primary'],
              ['FP', activeFrame.confusion.falsePositive, 'text-tertiary'],
              ['FN', activeFrame.confusion.falseNegative, 'text-outline'],
            ].map(([label, value, tone]) => (
              <div key={label} className="surface-panel rounded-[22px] border border-white/[0.04] p-4">
                <p className="text-xs font-mono text-outline uppercase">{label}</p>
                <p className={`text-2xl font-semibold mt-3 ${tone}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
