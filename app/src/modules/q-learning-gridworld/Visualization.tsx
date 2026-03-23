import { useMemo } from 'react'
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
import { actionToArrow, type QLearningGridworldParams, type QLearningGridworldResult } from './logic'

function cellClasses(type: string, current: boolean) {
  if (type === 'wall') {
    return 'bg-surface-container-highest text-outline'
  }
  if (type === 'goal') {
    return 'bg-secondary/18 text-secondary border border-secondary/30'
  }
  if (type === 'start') {
    return 'bg-primary/20 text-primary border border-primary/30'
  }
  if (type === 'cliff') {
    return 'bg-tertiary/18 text-tertiary border border-tertiary/20'
  }
  if (current) {
    return 'bg-primary/12 text-on-surface border border-primary/25 shadow-[0_0_12px_#d0bcff22]'
  }

  return 'bg-surface-container-lowest/70 text-on-surface'
}

export function QLearningGridworldVisualization({
  result,
  runtime,
}: VisualizationProps<QLearningGridworldParams, QLearningGridworldResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.policyPath.length - 1)
  const activeStep = result.policyPath[activeIndex] ?? result.policyPath.at(-1)
  const arrowMap = useMemo(
    () => new Map(result.policyArrows.map((item) => [item.key, item])),
    [result.policyArrows],
  )
  const gridWidth = useMemo(
    () => Math.max(...result.grid.map((cell) => cell.x)) + 1,
    [result.grid],
  )
  const gridHeight = useMemo(
    () => Math.max(...result.grid.map((cell) => cell.y)) + 1,
    [result.grid],
  )
  const cellSize = gridWidth >= 6 ? 60 : 68

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Politika tekrar oynatma' : 'Öğrenilmiş politika'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Tekrar Adımı</p>
            <p className="font-mono text-sm text-primary">{activeStep?.step ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Ort Ödül</p>
            <p className="font-mono text-sm text-secondary">{result.averageReward.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Başarı Oranı</p>
            <p className="font-mono text-sm text-tertiary">{(result.successRate * 100).toFixed(1)}%</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Yakınsama</p>
            <p className="font-mono text-sm text-outline">{result.convergenceEpisode}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.1fr_1fr] gap-4 min-h-0 overflow-hidden">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
              Öğrenilmiş Politika Izgarası
            </h4>
            <p className="text-xs font-mono text-outline">
              Q-değeri okları greedy eylemi gösterir
            </p>
          </div>

          <div
            className="grid gap-1.5 flex-1 min-h-0 justify-center content-start overflow-auto"
            style={{
              gridTemplateColumns: `repeat(${gridWidth}, ${cellSize}px)`,
              gridAutoRows: `${cellSize}px`,
              maxHeight: `${gridHeight * cellSize + (gridHeight - 1) * 6}px`,
            }}
          >
            {result.grid.map((cell) => {
              const key = `${cell.x},${cell.y}`
              const arrow = arrowMap.get(key)
              const current = activeStep?.x === cell.x && activeStep?.y === cell.y

              return (
                <div
                  key={key}
                  className={`rounded-md p-1.5 flex flex-col justify-between transition-colors overflow-hidden ${cellClasses(cell.type, current)}`}
                >
                  <div className="flex items-center justify-between text-xs font-mono opacity-70">
                    <span>{cell.x},{cell.y}</span>
                    <span>{cell.type}</span>
                  </div>
                  <div className="text-center">
                    <div className="text-base font-headline leading-none">
                      {cell.type === 'wall' ? '■' : actionToArrow(arrow?.bestAction ?? null)}
                    </div>
                    <div className="text-xs font-mono opacity-75 mt-1">
                      {arrow ? arrow.value.toFixed(2) : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,1fr)_minmax(0,0.9fr)] gap-4 min-h-0 overflow-hidden">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
              Episode Ödülleri
            </h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.episodeStats}>
                  <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="episode"
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
                  <Line type="monotone" dataKey="totalReward" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Politika Tekrarı
              </h4>
              <span className="text-xs font-mono text-primary">
                Kararlılık {(result.policyStability * 100).toFixed(1)}%
              </span>
            </div>
            <div className="space-y-2 overflow-auto min-h-0 pr-1">
              {result.policyPath.slice(Math.max(0, activeIndex - 5), activeIndex + 1).map((step) => (
                <div key={`${step.step}-${step.x}-${step.y}`} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-on-surface">Adım {step.step}</p>
                    <p className="text-xs font-mono text-outline">
                      ({step.x}, {step.y})
                    </p>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Eylem {actionToArrow(step.action)} · Ödül {step.reward.toFixed(2)}
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
