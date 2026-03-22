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
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Frontier replay' : 'Frontier snapshot'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Expanded</p>
            <p className="font-mono text-sm text-primary">{activeStep?.expandedKeys.length ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Frontier</p>
            <p className="font-mono text-sm text-secondary">{activeStep?.frontier.length ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Path Cost</p>
            <p className="font-mono text-sm text-tertiary">{activeStep?.currentPathCost.toFixed(1) ?? '0.0'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
              Search Grid
            </h4>
            <div className="flex items-center gap-3 text-[9px] font-mono text-outline">
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/80" />Frontier</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-secondary/80" />Path</span>
              <span className="inline-flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-tertiary/80" />Current</span>
            </div>
          </div>

          <div
            className="grid gap-1.5 flex-1 min-h-0"
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
                  className={`rounded-md aspect-square flex flex-col items-center justify-center text-[10px] font-mono transition-colors ${classes}`}
                >
                  <span>{cell.isWall ? '■' : cell.weight}</span>
                  <span className="text-[8px] opacity-70">
                    {cell.x},{cell.y}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-rows-[0.95fr_1.05fr] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
                Frontier View
              </h4>
              <span className="text-[10px] font-mono text-secondary">
                Peak {activeStep?.frontierPeak ?? 0}
              </span>
            </div>

            <div className="space-y-2 overflow-auto">
              {(activeStep?.frontier ?? []).map((entry) => (
                <div
                  key={entry.key}
                  className="rounded-lg bg-surface-container-low/60 px-3 py-2 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-semibold text-on-surface">
                      ({entry.x}, {entry.y})
                    </p>
                    <p className="text-[10px] font-mono text-outline">
                      key={entry.key}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono text-outline uppercase">g(n)</p>
                    <p className="font-mono text-sm text-primary">{entry.cost.toFixed(1)}</p>
                  </div>
                </div>
              ))}

              {(activeStep?.frontier ?? []).length === 0 ? (
                <div className="rounded-lg bg-surface-container-low/60 px-3 py-4 text-xs text-outline">
                  Frontier bos. Goal bulunduysa arama tamamlandi; bulunmadiysa state space tukendi.
                </div>
              ) : null}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
              Search Progress
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress}>
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
                    labelFormatter={(label) => `Step ${label}`}
                  />
                  <Line type="monotone" dataKey="expanded" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="frontier" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="pathCost" stroke="#ffb869" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 rounded-lg bg-surface-container-low/60 p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-outline mb-1">
                Current Expansion
              </p>
              <p className="text-sm text-on-surface">
                {(() => {
                  const point = parsePointKey(currentKey)
                  return `Node (${point.x}, ${point.y}) expanded`
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
