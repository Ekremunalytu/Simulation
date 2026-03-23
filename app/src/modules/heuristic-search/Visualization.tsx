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
import { pointKey } from '../shared/search-grid'
import type { HeuristicSearchParams, HeuristicSearchResult } from './logic'

function toneCell(options: {
  isWall: boolean
  isStart: boolean
  isGoal: boolean
  inPath: boolean
  isCurrent: boolean
  inFrontier: boolean
  explored: boolean
}) {
  if (options.isWall) {
    return 'bg-surface-container-highest text-outline'
  }
  if (options.isStart) {
    return 'bg-primary/25 text-primary border border-primary/30'
  }
  if (options.isGoal) {
    return 'bg-secondary/20 text-secondary border border-secondary/30'
  }
  if (options.isCurrent) {
    return 'bg-tertiary/20 text-tertiary border border-tertiary/30 shadow-[0_0_12px_#ffb86933]'
  }
  if (options.inPath) {
    return 'bg-secondary/10 text-secondary'
  }
  if (options.inFrontier) {
    return 'bg-primary/10 text-primary'
  }
  if (options.explored) {
    return 'bg-surface-container-low text-on-surface'
  }

  return 'bg-surface-container-lowest/70 text-outline'
}

export function HeuristicSearchVisualization({
  result,
  runtime,
}: VisualizationProps<HeuristicSearchParams, HeuristicSearchResult>) {
  const activeIndex = Math.min(runtime.frameIndex, Math.max(result.steps.length - 1, 0))
  const activeStep = result.steps[activeIndex]
  const currentKey = activeStep?.expandedKey ?? result.finalPathKeys.at(-1) ?? pointKey(result.grid.start)
  const frontierMap = new Map(
    (activeStep?.frontier ?? []).map((entry) => [entry.key, entry]),
  )
  const expanded = new Set(activeStep?.expandedKeys ?? [])
  const path = new Set(activeStep?.currentPathKeys ?? result.finalPathKeys)
  const startKey = pointKey(result.grid.start)
  const goalKey = pointKey(result.grid.goal)
  const progress = result.progress.slice(0, activeIndex + 1)

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Sezgisel tekrar oynatma' : 'Puanlanmış frontier'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Açılan</p>
            <p className="font-mono text-sm text-primary">{activeStep?.expandedKeys.length ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Tahmin</p>
            <p className="font-mono text-sm text-tertiary">{activeStep?.currentEstimate.toFixed(2) ?? '0.00'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Güncel Maliyet</p>
            <p className="font-mono text-sm text-secondary">{activeStep?.currentPathCost.toFixed(1) ?? '0.0'}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
              Puanlanmış Izgara
            </h4>
            <p className="text-[10px] font-mono text-outline">
              Frontier hücreleri g / h / f gösterir
            </p>
          </div>

          <div
            className="grid gap-1.5 flex-1 min-h-0"
            style={{ gridTemplateColumns: `repeat(${result.grid.size}, minmax(0, 1fr))` }}
          >
            {result.grid.cells.flat().map((cell) => {
              const key = cell.key
              const frontierEntry = frontierMap.get(key)
              const className = toneCell({
                isWall: cell.isWall,
                isStart: key === startKey,
                isGoal: key === goalKey,
                inPath: path.has(key) && key !== startKey && key !== goalKey,
                isCurrent: key === currentKey,
                inFrontier: frontierMap.has(key),
                explored: expanded.has(key),
              })

              return (
                <div
                  key={key}
                  className={`rounded-md aspect-square p-1 flex flex-col justify-between transition-colors ${className}`}
                >
                  <div className="flex items-center justify-between text-[8px] font-mono opacity-70">
                    <span>{cell.x},{cell.y}</span>
                    <span>w{cell.weight}</span>
                  </div>
                  {frontierEntry ? (
                    <div className="text-[9px] font-mono leading-tight">
                      <div>g {frontierEntry.g.toFixed(1)}</div>
                      <div>h {frontierEntry.h.toFixed(1)}</div>
                      <div>f {frontierEntry.f.toFixed(1)}</div>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono opacity-70">
                      {cell.isWall ? '■' : expanded.has(key) ? 'görüldü' : '·'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-rows-[0.95fr_1.05fr] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
                Frontier Sıralaması
              </h4>
              <span className="text-[10px] font-mono text-primary">
                h(start) {result.heuristicEstimate.toFixed(2)}
              </span>
            </div>

            <div className="space-y-2 overflow-auto">
              {(activeStep?.frontier ?? []).map((entry) => (
                <div
                  key={entry.key}
                  className="rounded-lg bg-surface-container-low/60 px-3 py-2 grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center"
                >
                  <div>
                    <p className="text-xs font-semibold text-on-surface">
                      ({entry.x}, {entry.y})
                    </p>
                    <p className="text-[10px] font-mono text-outline">{entry.key}</p>
                  </div>
                  <p className="text-[11px] font-mono text-primary">g {entry.g.toFixed(1)}</p>
                  <p className="text-[11px] font-mono text-secondary">h {entry.h.toFixed(1)}</p>
                  <p className="text-[11px] font-mono text-tertiary">f {entry.f.toFixed(1)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
              Arama Verimliliği
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
                  />
                  <Line type="monotone" dataKey="expanded" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="pathCost" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="estimate" stroke="#ffb869" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 rounded-lg bg-surface-container-low/60 p-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-outline mb-1">
                Güncel Politika
              </p>
              <p className="text-sm text-on-surface">
                {result.finalPathKeys.length > 0
                  ? `Tahmini yol uzunluğu ${result.finalPathKeys.length - 1}, nihai maliyet ${result.finalCost.toFixed(1)}`
                  : 'Mevcut haritada yol bulunamadı'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
