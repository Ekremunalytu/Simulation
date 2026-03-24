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
import type { BiasFairnessExplorerParams, BiasFairnessExplorerResult } from './logic'

function laneColor(group: 'A' | 'B') {
  return group === 'A' ? '#d0bcff' : '#4cd7f6'
}

export function BiasFairnessExplorerVisualization({
  result,
  runtime,
}: VisualizationProps<BiasFairnessExplorerParams, BiasFairnessExplorerResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.snapshots.length - 1)
  const activeSnapshot = result.snapshots[activeIndex] ?? result.snapshots[result.selectedThresholdIndex]
  const groups = activeSnapshot.groupMetrics

  return (
    <div className="w-full h-full p-4 md:p-5 flex flex-col gap-4 overflow-auto">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-[0.28em] text-outline">
            {result.scenarioLabel}
          </p>
          <h3 className="text-xl font-semibold text-on-surface">
            Threshold {activeSnapshot.threshold.toFixed(2)}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Noktalar grup ve gerçek etiketlerine göre yerleşiyor; threshold çizgisi kaydıkça kabul edilen karar kümesi ve fairness gapleri birlikte değişiyor.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 min-w-[320px]">
          <div className="rounded-[16px] bg-surface-container-low px-4 py-3">
            <p className="text-xs font-mono text-outline">DP Gap</p>
            <p className="text-lg font-semibold text-primary mt-2">
              {(activeSnapshot.demographicParityGap * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-[16px] bg-surface-container-low px-4 py-3">
            <p className="text-xs font-mono text-outline">EO Gap</p>
            <p className="text-lg font-semibold text-secondary mt-2">
              {(activeSnapshot.equalOpportunityGap * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_1fr] gap-4 min-h-0">
        <section className="rounded-[18px] bg-surface-container-lowest/65 border border-white/[0.04] p-4 space-y-4 overflow-auto">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-outline">
              Score Lanes
            </h4>
            <p className="text-xs font-mono text-outline">
              Dolu nokta = gerçek pozitif, halka = negatif örnek
            </p>
          </div>

          {(['A', 'B'] as const).map((group) => {
            const groupCandidates = activeSnapshot.evaluatedCandidates.filter((item) => item.group === group)

            return (
              <article key={group} className="rounded-[16px] bg-surface-container-low px-4 py-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: laneColor(group) }}
                    />
                    <p className="text-sm font-semibold text-on-surface">Group {group}</p>
                  </div>
                  <p className="text-xs font-mono text-outline">
                    selection {(((groups.find((item) => item.group === group)?.selectionRate) ?? 0) * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="relative h-24 rounded-[14px] bg-black/10 border border-white/[0.04] overflow-hidden">
                  <div
                    className="absolute inset-y-0 w-px bg-tertiary/80"
                    style={{ left: `${activeSnapshot.threshold * 100}%` }}
                  />

                  {groupCandidates.map((candidate, index) => (
                    <div
                      key={candidate.id}
                      className={`absolute w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                        candidate.label === 1 ? 'border-0' : 'border-2 bg-transparent'
                      } ${candidate.predicted ? 'shadow-[0_0_14px_rgba(208,188,255,0.25)]' : ''}`}
                      style={{
                        left: `${candidate.adjustedScore * 100}%`,
                        top: `${24 + (index % 4) * 18}px`,
                        backgroundColor: candidate.label === 1 ? laneColor(group) : 'transparent',
                        borderColor: laneColor(group),
                        opacity: candidate.predicted ? 1 : 0.45,
                      }}
                    />
                  ))}

                  <div className="absolute inset-x-0 bottom-2 flex justify-between px-3 text-[10px] font-mono text-outline">
                    <span>0.0</span>
                    <span>score</span>
                    <span>1.0</span>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <section className="grid grid-rows-[minmax(0,1fr)_minmax(0,0.95fr)] gap-4 min-h-0">
          <article className="rounded-[18px] bg-surface-container-lowest/65 border border-white/[0.04] p-4 min-h-[280px]">
            <h4 className="text-xs font-mono uppercase tracking-widest text-outline mb-4">
              Threshold Sweep
            </h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={result.thresholdSeries}>
                <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="threshold" stroke={chartStroke} tick={chartTick} tickLine={false} />
                <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="accuracy" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                <Line type="monotone" dataKey="demographicParityGap" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                <Line type="monotone" dataKey="equalOpportunityGap" stroke="#ff8a7a" strokeWidth={2.2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </article>

          <article className="rounded-[18px] bg-surface-container-lowest/65 border border-white/[0.04] p-4 space-y-3 overflow-auto">
            <h4 className="text-xs font-mono uppercase tracking-widest text-outline">
              Group Metrics
            </h4>
            {groups.map((group) => (
              <div key={group.group} className="rounded-[14px] bg-surface-container-low px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-on-surface">Group {group.group}</p>
                  <p className="text-xs font-mono text-outline">{group.approvals} approvals</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="rounded-xl bg-black/15 px-3 py-2">
                    <p className="text-[10px] font-mono text-outline">Selection</p>
                    <p className="text-sm text-on-surface mt-1">{(group.selectionRate * 100).toFixed(1)}%</p>
                  </div>
                  <div className="rounded-xl bg-black/15 px-3 py-2">
                    <p className="text-[10px] font-mono text-outline">TPR</p>
                    <p className="text-sm text-on-surface mt-1">{(group.truePositiveRate * 100).toFixed(1)}%</p>
                  </div>
                  <div className="rounded-xl bg-black/15 px-3 py-2">
                    <p className="text-[10px] font-mono text-outline">FPR</p>
                    <p className="text-sm text-on-surface mt-1">{(group.falsePositiveRate * 100).toFixed(1)}%</p>
                  </div>
                  <div className="rounded-xl bg-black/15 px-3 py-2">
                    <p className="text-[10px] font-mono text-outline">Precision</p>
                    <p className="text-sm text-on-surface mt-1">{(group.precision * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </article>
        </section>
      </div>
    </div>
  )
}
