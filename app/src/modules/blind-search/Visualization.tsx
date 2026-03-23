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
import { parsePointKey, pointKey } from '../shared/search-grid'
import type { BlindSearchParams, BlindSearchResult } from './logic'

function cellTone(options: {
  key: string
  wall: boolean
  start: boolean
  goal: boolean
  current: boolean
  inPath: boolean
  inFrontier: boolean
  explored: boolean
}) {
  if (options.wall) {
    return 'bg-surface-container-highest text-outline'
  }

  if (options.start) {
    return 'bg-primary/25 text-primary border border-primary/30'
  }

  if (options.goal) {
    return 'bg-secondary/20 text-secondary border border-secondary/30'
  }

  if (options.current) {
    return 'bg-tertiary/20 text-tertiary border border-tertiary/30 shadow-[0_0_12px_#ffb86933]'
  }

  if (options.inPath) {
    return 'bg-secondary/12 text-secondary'
  }

  if (options.inFrontier) {
    return 'bg-primary/12 text-primary'
  }

  if (options.explored) {
    return 'bg-surface-container-low text-on-surface'
  }

  return 'bg-surface-container-lowest/70 text-outline'
}

export function BlindSearchVisualization({
  result,
  runtime,
}: VisualizationProps<BlindSearchParams, BlindSearchResult>) {
  const activeIndex = Math.min(runtime.frameIndex, Math.max(result.steps.length - 1, 0))
  const activeStep = result.steps[activeIndex]
  const expandedKeys = new Set(activeStep?.expandedKeys ?? [])
  const frontierKeys = new Set(activeStep?.frontier.map((entry) => entry.key) ?? [])
  const pathKeys = new Set(activeStep?.currentPathKeys ?? result.finalPathKeys)
  const currentKey = activeStep?.expandedKey ?? result.finalPathKeys.at(-1) ?? pointKey(result.grid.start)
  const startKey = pointKey(result.grid.start)
  const goalKey = pointKey(result.grid.goal)
  const progress = result.progress.slice(0, activeIndex + 1)

  return (
    <div className="w-full h-full flex flex-col gap-5 p-5 md:p-6">
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3 rounded-full bg-surface-container-low px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono text-outline">
            {runtime.isPlaying ? 'Frontier tekrar oynatma' : 'Frontier anlık görünümü'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="font-mono text-xs text-outline">Açılan</p>
            <p className="font-mono text-base text-primary">{activeStep?.expandedKeys.length ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-outline">Frontier</p>
            <p className="font-mono text-base text-secondary">{activeStep?.frontier.length ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-outline">Yol Maliyeti</p>
            <p className="font-mono text-base text-tertiary">{activeStep?.currentPathCost.toFixed(1) ?? '0.0'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4 min-h-0 overflow-hidden">
        <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 md:p-5 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h4 className="eyebrow">
              Arama Izgarası
            </h4>
            <div className="flex items-center gap-3 text-xs font-mono text-outline">
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/80" />Frontier</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary/80" />Yol</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-tertiary/80" />Güncel</span>
            </div>
          </div>

          <div
            className="grid gap-1.5 flex-1 min-h-0 overflow-auto content-start pr-1"
            style={{ gridTemplateColumns: `repeat(${result.grid.size}, minmax(0, 1fr))` }}
          >
            {result.grid.cells.flat().map((cell) => {
              const key = cell.key
              const classes = cellTone({
                key,
                wall: cell.isWall,
                start: key === startKey,
                goal: key === goalKey,
                current: key === currentKey,
                inPath: pathKeys.has(key) && key !== startKey && key !== goalKey,
                inFrontier: frontierKeys.has(key),
                explored: expandedKeys.has(key),
              })

              return (
                <div
                  key={key}
                  className={`rounded-md aspect-square flex flex-col items-center justify-center text-xs font-mono transition-colors ${classes}`}
                >
                  <span>{cell.isWall ? '■' : cell.weight}</span>
                  <span className="text-[11px] opacity-70">
                    {cell.x},{cell.y}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-4 min-h-0 overflow-hidden">
          <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 md:p-5 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="eyebrow">
                Frontier Görünümü
              </h4>
              <span className="text-xs font-mono text-secondary">
                Zirve {activeStep?.frontierPeak ?? 0}
              </span>
            </div>

            <div className="space-y-2 overflow-auto min-h-0 pr-1">
              {(activeStep?.frontier ?? []).map((entry) => (
                <div
                  key={entry.key}
                  className="rounded-lg bg-surface-container-low/60 px-3 py-2 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-on-surface">
                      ({entry.x}, {entry.y})
                    </p>
                    <p className="text-xs font-mono text-outline">
                      key={entry.key}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-outline">g(n)</p>
                    <p className="font-mono text-base text-primary">{entry.cost.toFixed(1)}</p>
                  </div>
                </div>
              ))}

              {(activeStep?.frontier ?? []).length === 0 ? (
                <div className="rounded-lg bg-surface-container-low/60 px-3 py-4 text-xs text-outline">
              Frontier boş. Hedef bulunduysa arama tamamlandı; bulunmadıysa durum uzayı tükendi.
                </div>
              ) : null}
            </div>
          </div>

          <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 md:p-5 flex flex-col min-h-0">
            <h4 className="eyebrow mb-3">
              Arama İlerlemesi
            </h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="step"
                    stroke={chartStroke}
                    tick={chartTick}
                    tickLine={false}
                  />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    labelFormatter={(label) => `Adım ${label}`}
                  />
                  <Line type="monotone" dataKey="expanded" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="frontier" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="pathCost" stroke="#ffb869" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 rounded-lg bg-surface-container-low/60 p-3">
              <p className="font-mono text-xs text-outline mb-1">
                Güncel Genişleme
              </p>
              <p className="text-sm text-on-surface">
                {(() => {
                  const point = parsePointKey(currentKey)
                  return `(${point.x}, ${point.y}) düğümü açıldı`
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
