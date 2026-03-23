import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type {
  MultivariableLimitPathsParams,
  MultivariableLimitPathsResult,
} from './logic'

function getColor(value: number | null): string {
  if (value === null) {
    return 'rgba(39,39,39,0.75)'
  }
  const normalized = Math.max(0, Math.min(1, (value + 2) / 4))
  return `rgba(208,188,255,${(0.18 + normalized * 0.6).toFixed(3)})`
}

export function MultivariableLimitPathsVisualization({
  result,
  runtime,
}: VisualizationProps<MultivariableLimitPathsParams, MultivariableLimitPathsResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const firstPath = result.frames.map((frame) => frame.firstPoint)
  const secondPath = result.frames.map((frame) => frame.secondPoint)

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            çift yol testi
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Birinci Yol</p>
            <p className="font-mono text-sm text-primary">
              {activeFrame.firstValue === null ? 'tanımsız' : activeFrame.firstValue.toFixed(3)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">İkinci Yol</p>
            <p className="font-mono text-sm text-secondary">
              {activeFrame.secondValue === null ? 'tanımsız' : activeFrame.secondValue.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Hedef Nokta ve Yaklaşım Yolları
          </h4>
          <div className="flex-1 min-h-[260px]">
            <svg viewBox="0 0 420 320" className="w-full h-full">
              {result.projectionSamples.map((sample) => (
                <circle
                  key={`${sample.x}-${sample.y}`}
                  cx={40 + ((sample.x + 1.6) / 3.2) * 320}
                  cy={280 - ((sample.y + 1.6) / 3.2) * 240}
                  r="12"
                  fill={getColor(sample.value)}
                  stroke="rgba(76,215,246,0.12)"
                />
              ))}
              <polyline
                points={firstPath
                  .map(
                    (point) =>
                      `${40 + ((point.x + 1.6) / 3.2) * 320},${280 - ((point.y + 1.6) / 3.2) * 240}`,
                  )
                  .join(' ')}
                fill="none"
                stroke="#d0bcff"
                strokeWidth="2.4"
              />
              <polyline
                points={secondPath
                  .map(
                    (point) =>
                      `${40 + ((point.x + 1.6) / 3.2) * 320},${280 - ((point.y + 1.6) / 3.2) * 240}`,
                  )
                  .join(' ')}
                fill="none"
                stroke="#4cd7f6"
                strokeWidth="2.4"
              />
              <circle
                cx={40 + ((activeFrame.firstPoint.x + 1.6) / 3.2) * 320}
                cy={280 - ((activeFrame.firstPoint.y + 1.6) / 3.2) * 240}
                r="7"
                fill="#ffb869"
              />
              <circle
                cx={40 + ((activeFrame.secondPoint.x + 1.6) / 3.2) * 320}
                cy={280 - ((activeFrame.secondPoint.y + 1.6) / 3.2) * 240}
                r="7"
                fill="#4cd7f6"
              />
            </svg>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Yol Bazlı Limit Değerleri
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis
                  dataKey="step"
                  type="number"
                  allowDuplicatedCategory={false}
                  stroke="#5a5567"
                  tick={{ fontSize: 12, fill: '#b9b4c8' }}
                  tickLine={false}
                />
                <YAxis stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(24, 24, 32, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e5e2e1',
                  }}
                />
                <Line data={result.firstSeries} dataKey="value" type="monotone" stroke="#d0bcff" strokeWidth={2.4} dot={false} />
                <Line data={result.secondSeries} dataKey="value" type="monotone" stroke="#4cd7f6" strokeWidth={2.4} dot={false} />
                <Scatter data={[{ step: activeFrame.step, value: activeFrame.firstValue }]} fill="#ffb869" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-outline mb-1">
                Yol A
              </p>
              <p className="text-sm text-on-surface">{result.firstPathLabel}</p>
            </div>
            <div className="rounded-xl bg-surface-container-low p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-outline mb-1">
                Yol B
              </p>
              <p className="text-sm text-on-surface">{result.secondPathLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
