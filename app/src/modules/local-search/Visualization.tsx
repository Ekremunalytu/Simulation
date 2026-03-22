import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type { LocalSearchParams, LocalSearchResult } from './logic'

function scoreToColor(score: number, minScore: number, maxScore: number) {
  const normalized = (score - minScore) / Math.max(maxScore - minScore, 1e-6)

  if (normalized > 0.75) {
    return '#4cd7f6'
  }
  if (normalized > 0.5) {
    return '#a078ff'
  }
  if (normalized > 0.25) {
    return '#5b4e6c'
  }

  return '#161616'
}

export function LocalSearchVisualization({
  result,
  runtime,
}: VisualizationProps<LocalSearchParams, LocalSearchResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.steps.length - 1)
  const visibleSteps = result.steps.slice(0, activeIndex + 1)
  const current = visibleSteps[visibleSteps.length - 1] ?? result.finalStep
  const minScore = result.surface.reduce(
    (min, point) => (point.score < min ? point.score : min),
    Number.POSITIVE_INFINITY,
  )
  const maxScore = result.surface.reduce(
    (max, point) => (point.score > max ? point.score : max),
    Number.NEGATIVE_INFINITY,
  )
  const svgSize = 360

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#ffb869]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Landscape replay' : 'Optimization trace'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Current Score</p>
            <p className="font-mono text-sm text-primary">{current.score.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Temperature</p>
            <p className="font-mono text-sm text-tertiary">{current.temperature.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Restarts</p>
            <p className="font-mono text-sm text-secondary">{current.restartCount}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
              Objective Surface
            </h4>
            <p className="text-[10px] font-mono text-outline">
              Orange points = accepted worse moves
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="mx-auto">
              {result.surface.map((point) => {
                const x = ((point.x + 4) / 8) * svgSize
                const y = svgSize - ((point.y + 4) / 8) * svgSize
                return (
                  <rect
                    key={`${point.x}-${point.y}`}
                    x={x - 7}
                    y={y - 7}
                    width={14}
                    height={14}
                    fill={scoreToColor(point.score, minScore, maxScore)}
                    opacity={0.55}
                  />
                )
              })}

              <polyline
                points={visibleSteps
                  .map((step) => {
                    const x = ((step.x + 4) / 8) * svgSize
                    const y = svgSize - ((step.y + 4) / 8) * svgSize
                    return `${x},${y}`
                  })
                  .join(' ')}
                fill="none"
                stroke="#d0bcff"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity="0.85"
              />

              {visibleSteps.map((step, index) => {
                const x = ((step.x + 4) / 8) * svgSize
                const y = svgSize - ((step.y + 4) / 8) * svgSize
                const isCurrent = index === visibleSteps.length - 1
                const isBest = step.step === result.bestStep.step
                const fill = step.acceptedWorse ? '#ffb869' : isBest ? '#4cd7f6' : '#d0bcff'

                return (
                  <circle
                    key={step.step}
                    cx={x}
                    cy={y}
                    r={isCurrent ? 6 : 4}
                    fill={fill}
                    opacity={isCurrent ? 1 : 0.85}
                  />
                )
              })}
            </svg>
          </div>
        </div>

        <div className="grid grid-rows-[1fr_0.9fr] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
              Score Curve
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visibleSteps}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="step"
                    stroke="#555"
                    tick={{ fontSize: 10, fill: '#b0a8bc' }}
                    tickLine={false}
                  />
                  <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a1a',
                      border: '1px solid #555',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#e5e2e1',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="temperature" stroke="#ffb869" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
                Step Notes
              </h4>
              <span className="text-[10px] font-mono text-secondary">
                Best {result.bestStep.score.toFixed(2)}
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              {visibleSteps.slice(-8).map((step) => (
                <div key={step.step} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-on-surface">Step {step.step}</p>
                    <p className="text-[10px] font-mono text-outline">
                      ({step.x.toFixed(2)}, {step.y.toFixed(2)})
                    </p>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Score {step.score.toFixed(2)}
                    {step.acceptedWorse ? ' · accepted worse move' : ''}
                    {step.restartCount > 0 ? ` · restart #${step.restartCount}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
