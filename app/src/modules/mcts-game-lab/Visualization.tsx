import type { VisualizationProps } from '../../types/simulation'
import type { MctsGameLabParams, MctsGameLabResult } from './logic'

function boardCellClass(selected: boolean) {
  return `rounded-md h-16 flex items-center justify-center text-xl font-headline ${
    selected
      ? 'bg-primary/15 text-primary border border-primary/30'
      : 'bg-surface-container-low text-on-surface'
  }`
}

export function MctsGameLabVisualization({
  params,
  result,
  runtime,
}: VisualizationProps<MctsGameLabParams, MctsGameLabResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.searchTrace.length - 1)
  const visibleTrace = result.searchTrace.slice(0, activeIndex + 1)
  const visibleNodes = result.treeNodes.filter((node) => node.depth <= 2).slice(0, 12)

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {params.algorithm.toUpperCase()} · {result.presetLabel}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Player</p>
            <p className="font-mono text-sm text-primary">{result.activePlayer}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Move</p>
            <p className="font-mono text-sm text-secondary">
              {result.selectedMove === null ? '-' : result.selectedMove}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Confidence</p>
            <p className="font-mono text-sm text-tertiary">
              {(result.selectedMoveConfidence * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Expanded</p>
            <p className="font-mono text-sm text-outline">{result.expandedNodeCount}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[0.86fr_1.14fr] gap-4 min-h-0 overflow-hidden">
        <div className="grid grid-rows-[minmax(0,0.72fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Board State
              </h4>
              <span className="text-xs font-mono text-primary">
                Principal variation {result.principalVariation.join(' → ') || '-'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
              {result.board.map((cell, index) => (
                <div key={index} className={boardCellClass(index === result.selectedMove)}>
                  {cell || ''}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Candidate Moves
              </h4>
              <span className="text-xs font-mono text-secondary">
                {result.candidateMoves.length} seçenek
              </span>
            </div>
            <div className="space-y-2 overflow-auto min-h-0 pr-1">
              {result.candidateMoves.map((candidate) => (
                <div key={candidate.move} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-on-surface">Move {candidate.move}</p>
                    <p className="text-[11px] font-mono text-outline">
                      {params.algorithm === 'mcts'
                        ? `${candidate.visits} visits`
                        : `score ${candidate.score.toFixed(1)}`}
                    </p>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    Win rate {(candidate.winRate * 100).toFixed(1)}% · {candidate.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,0.82fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Partial Tree
              </h4>
              <span className="text-xs font-mono text-outline">
                depth ≤ 2 snapshot
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 overflow-auto min-h-0 pr-1">
              {visibleNodes.map((node) => (
                <div key={node.id} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-on-surface">
                      {node.move === null ? 'root' : `move ${node.move}`}
                    </p>
                    <p className="text-[11px] font-mono text-outline">d{node.depth}</p>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    visits {node.visits} · win {(node.winRate * 100).toFixed(1)}% · score {node.score.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Rollout Timeline
              </h4>
              <span className="text-xs font-mono text-primary">
                {visibleTrace.at(-1)?.focusMove ?? '-'}
              </span>
            </div>
            <div className="space-y-2 overflow-auto min-h-0 pr-1">
              {visibleTrace.map((entry) => (
                <div key={entry.step} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-on-surface">{entry.message}</p>
                    <p className="text-[11px] font-mono text-outline">#{entry.step}</p>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-1">
                    visits {entry.visits} · value {entry.value.toFixed(2)}
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
