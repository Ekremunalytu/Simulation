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
import type { DynamicProgrammingResultBase } from './dynamic-programming'
import { actionToArrow } from './dynamic-programming'

function cellClasses(type: string) {
  if (type === 'wall') {
    return 'bg-surface-container-highest text-outline'
  }
  if (type === 'goal') {
    return 'bg-secondary/16 text-secondary border border-secondary/30'
  }
  if (type === 'start') {
    return 'bg-primary/18 text-primary border border-primary/30'
  }
  if (type === 'pit') {
    return 'bg-tertiary/16 text-tertiary border border-tertiary/25'
  }

  return 'bg-surface-container-lowest/70 text-on-surface'
}

export function DynamicProgrammingVisualization({
  result,
  title,
  frameIndex,
}: {
  result: DynamicProgrammingResultBase
  title: string
  frameIndex: number
}) {
  const activeFrame = result.frames[Math.min(frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const gridWidth = Math.max(...result.grid.map((cell) => cell.x)) + 1
  const gridHeight = Math.max(...result.grid.map((cell) => cell.y)) + 1

  if (!activeFrame) {
    return null
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {title}
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Aktif Faz</p>
            <p className="font-mono text-sm text-primary">{activeFrame.phase}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Delta</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.delta.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Stabilite</p>
            <p className="font-mono text-sm text-tertiary">{(result.stablePolicyRatio * 100).toFixed(1)}%</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.05fr_1fr] gap-4 min-h-0">
        <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
          <h4 className="eyebrow mb-3">Value Grid ve Greedy Policy</h4>
          <div
            className="grid gap-2 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${gridWidth}, minmax(0, 72px))`,
              gridAutoRows: '72px',
              maxHeight: `${gridHeight * 72 + (gridHeight - 1) * 8}px`,
            }}
          >
            {result.grid.map((cell) => {
              const policy = activeFrame.policy[cell.key]
              const value = activeFrame.values[cell.key]
              const selected = cell.key === activeFrame.selectedCellKey
              return (
                <div
                  key={cell.key}
                  className={`rounded-2xl p-2 transition-colors ${cellClasses(cell.type)} ${selected ? 'ring-1 ring-primary/30' : ''}`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono opacity-70">
                    <span>{cell.x},{cell.y}</span>
                    <span>{cell.type}</span>
                  </div>
                  <div className="mt-2 text-center">
                    <div className="text-xl leading-none">{actionToArrow(policy ?? null)}</div>
                    <div className="text-xs font-mono mt-2">{value?.toFixed(2) ?? ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,0.95fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
            <h4 className="eyebrow mb-3">Convergence</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.deltaSeries}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="step" stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="delta" stroke="#4cd7f6" strokeWidth={2.4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
            <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
              <h4 className="eyebrow mb-3">Bellman Breakdown</h4>
              <div className="space-y-2 overflow-auto min-h-0">
                {activeFrame.breakdown.map((entry) => (
                  <div key={`${entry.action}-${entry.nextKey}`} className="rounded-2xl bg-black/20 px-3 py-2">
                    <p className="text-xs font-mono text-outline">
                      {actionToArrow(entry.action)} {'->'} {entry.nextKey}
                    </p>
                    <p className="text-sm text-on-surface mt-1">
                      r = {entry.reward.toFixed(2)}, V' = {entry.nextValue.toFixed(2)}, Q = {entry.qValue.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
              <h4 className="eyebrow mb-3">Greedy Path</h4>
              <div className="space-y-2 overflow-auto min-h-0">
                {result.finalPath.map((step) => (
                  <div key={`${step.step}-${step.key}`} className="rounded-2xl bg-black/20 px-3 py-2">
                    <p className="text-xs font-mono text-outline">Adım {step.step} · {step.key}</p>
                    <p className="text-sm text-on-surface mt-1">
                      {actionToArrow(step.action)} · V = {step.value.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
