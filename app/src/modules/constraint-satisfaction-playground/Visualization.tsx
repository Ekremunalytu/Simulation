import { useMemo } from 'react'
import type { VisualizationProps } from '../../types/simulation'
import type {
  ConstraintSatisfactionParams,
  ConstraintSatisfactionResult,
} from './logic'

const graphLayouts: Record<string, Record<string, { x: number; y: number }>> = {
  Triangle: {
    A: { x: 110, y: 50 },
    B: { x: 55, y: 155 },
    C: { x: 165, y: 155 },
  },
  'Australia Map': {
    WA: { x: 42, y: 78 },
    NT: { x: 128, y: 52 },
    SA: { x: 125, y: 145 },
    Q: { x: 214, y: 78 },
    NSW: { x: 223, y: 156 },
    V: { x: 192, y: 224 },
    T: { x: 222, y: 292 },
  },
  'Dense Six Node': {
    A: { x: 120, y: 34 },
    B: { x: 50, y: 96 },
    C: { x: 190, y: 96 },
    D: { x: 52, y: 200 },
    E: { x: 190, y: 200 },
    F: { x: 120, y: 262 },
  },
}

function paletteColor(color: string) {
  if (color === 'Amber') {
    return '#f6c65b'
  }
  if (color === 'Cyan') {
    return '#4cd7f6'
  }
  if (color === 'Lavender') {
    return '#d0bcff'
  }
  return '#ff8e7a'
}

function stepTone(type: string) {
  if (type === 'solved') {
    return 'text-secondary border-secondary/20 bg-secondary/10'
  }
  if (type === 'failure' || type === 'conflict') {
    return 'text-tertiary border-tertiary/20 bg-tertiary/10'
  }
  if (type === 'prune') {
    return 'text-primary border-primary/20 bg-primary/10'
  }

  return 'text-on-surface-variant border-white/5 bg-surface-container-low/60'
}

export function ConstraintSatisfactionVisualization({
  result,
  runtime,
}: VisualizationProps<ConstraintSatisfactionParams, ConstraintSatisfactionResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.domainsByStep.length - 1)
  const snapshot = result.domainsByStep[activeIndex] ?? result.domainsByStep.at(-1)
  const assignments = snapshot?.assignments ?? {}
  const layout = graphLayouts[result.presetLabel] ?? {}
  const visibleTrace = result.decisionTrace.slice(Math.max(0, activeIndex - 5), activeIndex + 1)
  const activeConflict = result.conflicts.find((conflict) => conflict.step === snapshot?.step)
  const conflictingPairs = new Set(
    activeConflict?.conflictingWith.map((item) => `${activeConflict.variable}-${item}`) ?? [],
  )

  const domainGrid = useMemo(
    () =>
      result.variables.map((variable) => ({
        variable,
        values: snapshot?.domains[variable] ?? [],
      })),
    [result.variables, snapshot],
  )

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {result.presetLabel} · CSP Solver
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Durum</p>
            <p className="font-mono text-sm text-secondary">{result.solved ? 'Solved' : 'Active'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Adım</p>
            <p className="font-mono text-sm text-primary">{activeIndex + 1}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Backtracks</p>
            <p className="font-mono text-sm text-tertiary">{result.backtrackCount}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Pruned</p>
            <p className="font-mono text-sm text-outline">{result.prunedValueCount}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1fr_1.02fr] gap-4 min-h-0 overflow-hidden">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
              Constraint Graph
            </h4>
            <span className="text-xs font-mono text-outline">
              Aktif: {snapshot?.activeVariable ?? '-'}
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <svg width="100%" height="100%" viewBox="0 0 270 330">
              {result.constraintEdges.map(([left, right]) => {
                const from = layout[left]
                const to = layout[right]
                if (!from || !to) {
                  return null
                }

                const conflict =
                  conflictingPairs.has(`${left}-${right}`) || conflictingPairs.has(`${right}-${left}`)

                return (
                  <line
                    key={`${left}-${right}`}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={conflict ? '#ff8e7a' : '#4f4a5f'}
                    strokeWidth={conflict ? 3 : 2}
                    opacity={0.9}
                  />
                )
              })}

              {result.variables.map((variable) => {
                const point = layout[variable]
                if (!point) {
                  return null
                }

                const assigned = assignments[variable]
                const active = snapshot?.activeVariable === variable

                return (
                  <g key={variable}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={28}
                      fill={assigned ? paletteColor(assigned) : '#18181c'}
                      stroke={active ? '#d0bcff' : '#302d39'}
                      strokeWidth={active ? 3 : 2}
                    />
                    <text
                      x={point.x}
                      y={point.y - 4}
                      textAnchor="middle"
                      fill="#dbd8d7"
                      fontFamily="JetBrains Mono"
                      fontSize="12"
                    >
                      {variable}
                    </text>
                    <text
                      x={point.x}
                      y={point.y + 14}
                      textAnchor="middle"
                      fill="#dbd8d7"
                      fontFamily="JetBrains Mono"
                      fontSize="10"
                    >
                      {assigned ?? '?'}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,0.75fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Domain Matrix
              </h4>
              <span className="text-xs font-mono text-secondary">
                {result.colorPalette.length} color
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-auto min-h-0 pr-1">
              {domainGrid.map((entry) => (
                <div key={entry.variable} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-on-surface">{entry.variable}</p>
                    <span className="text-[11px] font-mono text-outline">
                      {entry.values.length} seçenek
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.colorPalette.map((color) => {
                      const active = entry.values.includes(color)
                      return (
                        <span
                          key={`${entry.variable}-${color}`}
                          className={`rounded-full px-3 py-1 text-[11px] font-mono ${
                            active
                              ? 'bg-surface-container text-on-surface'
                              : 'bg-black/20 text-outline line-through'
                          }`}
                        >
                          {color}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Solver Timeline
              </h4>
              <span className="text-xs font-mono text-primary">{snapshot?.type}</span>
            </div>
            <div className="space-y-2 overflow-auto min-h-0 pr-1">
              {visibleTrace.map((entry) => (
                <div
                  key={`${entry.step}-${entry.type}`}
                  className={`rounded-lg border p-3 ${stepTone(entry.type)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold">{entry.message}</p>
                    <p className="text-[11px] font-mono uppercase">{entry.type}</p>
                  </div>
                  {entry.variable ? (
                    <p className="text-[11px] mt-1 opacity-80">
                      {entry.variable}
                      {entry.color ? ` = ${entry.color}` : ''}
                    </p>
                  ) : null}
                </div>
              ))}
              {activeConflict ? (
                <div className="rounded-lg border border-tertiary/20 bg-tertiary/10 p-3">
                  <p className="text-xs font-semibold text-tertiary">Conflict Feed</p>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    {activeConflict.reason}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
