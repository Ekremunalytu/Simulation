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
  ModelEvaluationThresholdLabParams,
  ModelEvaluationThresholdLabResult,
} from './logic'

function scoreColor(label: 0 | 1) {
  return label === 1 ? '#4cd7f6' : '#d0bcff'
}

export function ModelEvaluationThresholdLabVisualization({
  result,
  runtime,
}: VisualizationProps<
  ModelEvaluationThresholdLabParams,
  ModelEvaluationThresholdLabResult
>) {
  const activeFrame = result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const width = 420
  const height = 180
  const pad = 22

  const mapX = (score: number) => pad + score * (width - pad * 2)
  const rows = result.scores.reduce(
    (accumulator, point, index) => {
      const bucket = point.label === 1 ? 0 : 1
      accumulator[bucket].push({ ...point, rowIndex: accumulator[bucket].length, globalIndex: index })
      return accumulator
    },
    [[], []] as Array<Array<{ id: string; label: 0 | 1; score: number; rowIndex: number; globalIndex: number }>>,
  )

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
            Threshold {activeFrame.threshold.toFixed(2)} ile aktif karar yüzeyi
          </p>
        </div>

        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Precision</p>
            <p className="text-sm font-mono text-primary">{(activeFrame.precision * 100).toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">Recall</p>
            <p className="text-sm font-mono text-secondary">{(activeFrame.recall * 100).toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono uppercase text-outline">F1</p>
            <p className="text-sm font-mono text-tertiary">{(activeFrame.f1 * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="grid flex-1 gap-4 xl:grid-cols-[1.15fr_0.95fr]">
        <div className="grid gap-4 xl:grid-rows-[minmax(0,0.9fr)_minmax(0,1fr)]">
          <div className="surface-panel rounded-[22px] p-4">
            <h4 className="eyebrow mb-3">Score Dağılımı</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[180px] w-full">
              <line x1={pad} y1={40} x2={width - pad} y2={40} stroke="#343242" />
              <line x1={pad} y1={130} x2={width - pad} y2={130} stroke="#343242" />
              <line
                x1={mapX(activeFrame.threshold)}
                y1={20}
                x2={mapX(activeFrame.threshold)}
                y2={height - 20}
                stroke="#ffb869"
                strokeDasharray="5 5"
                strokeWidth="2"
              />
              {rows.flat().map((point) => {
                const yBase = point.label === 1 ? 40 : 130
                const y = yBase - 18 + (point.rowIndex % 7) * 6
                return (
                  <circle
                    key={point.id}
                    cx={mapX(point.score)}
                    cy={y}
                    r="4"
                    fill={scoreColor(point.label)}
                    opacity={point.score >= activeFrame.threshold ? 1 : 0.45}
                  />
                )
              })}
              <text x={pad} y={18} fill="#8d86a0" fontSize="11">Pozitif sınıf skorları</text>
              <text x={pad} y={108} fill="#8d86a0" fontSize="11">Negatif sınıf skorları</text>
            </svg>
          </div>

          <div className="surface-panel flex min-h-0 flex-col rounded-[22px] p-4">
            <h4 className="eyebrow mb-3">Threshold Eğrileri</h4>
            <div className="min-h-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.thresholdCurves}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="threshold" stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} domain={[0, 1]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <ReferenceLine x={activeFrame.threshold} stroke="#ffb869" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="precision" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="recall" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="f1" stroke="#ffb869" strokeWidth={2.1} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-rows-[minmax(0,0.95fr)_minmax(0,1fr)]">
          <div className="surface-panel flex min-h-0 flex-col rounded-[22px] p-4">
            <h4 className="eyebrow mb-3">ROC Gezinimi</h4>
            <div className="min-h-0 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.rocCurve}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="fpr" stroke={chartStroke} tick={chartTick} tickLine={false} domain={[0, 1]} />
                  <YAxis dataKey="tpr" stroke={chartStroke} tick={chartTick} tickLine={false} domain={[0, 1]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="tpr" stroke="#4cd7f6" strokeWidth={2.4} dot={{ r: 3 }} />
                  <ReferenceLine x={activeFrame.fpr} stroke="#d0bcff" strokeDasharray="4 4" />
                  <ReferenceLine y={activeFrame.tpr} stroke="#ffb869" strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              ['TP', activeFrame.truePositive, 'text-secondary'],
              ['TN', activeFrame.trueNegative, 'text-primary'],
              ['FP', activeFrame.falsePositive, 'text-tertiary'],
              ['FN', activeFrame.falseNegative, 'text-outline'],
            ].map(([label, value, tone]) => (
              <div key={label} className="surface-panel rounded-[22px] p-4">
                <p className="text-xs font-mono uppercase text-outline">{label}</p>
                <p className={`mt-3 text-2xl font-semibold ${tone}`}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
