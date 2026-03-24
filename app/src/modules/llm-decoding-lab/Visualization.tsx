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
import { chartGridStroke, chartStroke, chartTick, chartTooltipStyle } from '../../components/simulation/chartTheme'
import type { LlmDecodingLabParams, LlmDecodingLabResult } from './logic'

const strategyColors: Record<string, string> = {
  greedy: '#d0bcff',
  temperature: '#4cd7f6',
  'top-k': '#f6c453',
  'top-p': '#7ce2a4',
  beam: '#ff8a7a',
}

export function LlmDecodingLabVisualization({
  result,
  runtime,
}: VisualizationProps<LlmDecodingLabParams, LlmDecodingLabResult>) {
  const activeIndex = Math.min(runtime.frameIndex, Math.max(result.comparisonSeries.length - 1, 0))

  return (
    <div className="w-full h-full p-4 md:p-5 flex flex-col gap-4 overflow-auto">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-[0.28em] text-outline">
            {result.scenarioLabel}
          </p>
          <h3 className="text-xl font-semibold text-on-surface">{result.prompt}</h3>
          <p className="text-sm text-on-surface-variant">
            Aynı adımda stratejilerin ürettiği tokeni ve filtre sonrası kalan aday havuzunu karşılaştır.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 min-w-[260px]">
          <div className="rounded-[16px] bg-surface-container-low px-4 py-3">
            <p className="text-xs font-mono text-outline">Beam Advantage</p>
            <p className="text-lg font-semibold text-primary mt-2">{result.beamAdvantage.toFixed(2)}</p>
          </div>
          <div className="rounded-[16px] bg-surface-container-low px-4 py-3">
            <p className="text-xs font-mono text-outline">Adım</p>
            <p className="text-lg font-semibold text-secondary mt-2">
              {activeIndex + 1} / {runtime.totalFrames}
            </p>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-3">
        {result.strategies.map((strategy) => {
          const step = strategy.steps[activeIndex] ?? strategy.steps.at(-1)

          return (
            <article
              key={strategy.strategyId}
              className="rounded-[18px] bg-surface-container-lowest/65 border border-white/[0.04] p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-on-surface">{strategy.name}</h4>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: strategyColors[strategy.strategyId] }}
                />
              </div>
              <div className="rounded-[14px] bg-surface-container-low px-3 py-3 min-h-[88px]">
                <p className="text-xs font-mono text-outline">Generated</p>
                <p className="text-sm text-on-surface mt-2 leading-relaxed">
                  {strategy.generatedTokens.slice(0, activeIndex + 1).join(' ')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-black/15 px-3 py-2">
                  <p className="text-[10px] font-mono text-outline">Token</p>
                  <p className="text-sm text-on-surface mt-1">{step?.selectedToken}</p>
                </div>
                <div className="rounded-xl bg-black/15 px-3 py-2">
                  <p className="text-[10px] font-mono text-outline">Pool</p>
                  <p className="text-sm text-on-surface mt-1">{step?.candidatePoolSize}</p>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4 min-h-0">
        <section className="rounded-[18px] bg-surface-container-lowest/65 border border-white/[0.04] p-4 min-h-[320px]">
          <h4 className="text-xs font-mono uppercase tracking-widest text-outline mb-4">
            Kümülatif Log-Olasılık
          </h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.comparisonSeries}>
              <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
              <XAxis dataKey="step" stroke={chartStroke} tick={chartTick} tickLine={false} />
              <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              {result.strategies.map((strategy) => (
                <Line
                  key={strategy.strategyId}
                  type="monotone"
                  dataKey={strategy.strategyId}
                  stroke={strategyColors[strategy.strategyId]}
                  strokeWidth={2.4}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </section>

        <section className="rounded-[18px] bg-surface-container-lowest/65 border border-white/[0.04] p-4 space-y-3 overflow-auto">
          <h4 className="text-xs font-mono uppercase tracking-widest text-outline">
            Aktif Adım Aday Havuzu
          </h4>
          {result.strategies.map((strategy) => {
            const step = strategy.steps[activeIndex] ?? strategy.steps.at(-1)
            if (!step) {
              return null
            }

            return (
              <article key={strategy.strategyId} className="rounded-[14px] bg-surface-container-low px-3 py-3 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-on-surface">{strategy.name}</p>
                  <p className="text-xs font-mono text-outline">
                    retained {(step.retainedProbability * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="space-y-2">
                  {step.candidates.slice(0, 5).map((candidate) => (
                    <div key={`${strategy.strategyId}-${candidate.token}`} className="space-y-1">
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span
                          className={candidate.retained ? 'text-on-surface' : 'text-outline/70'}
                        >
                          {candidate.token}
                        </span>
                        <span className="font-mono text-outline">
                          {(candidate.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-black/15 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            candidate.retained ? 'bg-secondary' : 'bg-outline/35'
                          }`}
                          style={{ width: `${Math.max(candidate.probability * 100, 4)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </div>
  )
}
