import { useMemo } from 'react'
import type { VisualizationProps } from '../../types/simulation'
import type {
  GameTreeNode,
  MinimaxAlphaBetaParams,
  MinimaxAlphaBetaResult,
} from './logic'

interface LayoutPoint {
  x: number
  y: number
}

function createTreeLayout(root: GameTreeNode) {
  const positions = new Map<string, LayoutPoint>()
  let leafCursor = 0
  const horizontalGap = 86
  const verticalGap = 74
  const paddingX = 52
  const paddingTop = 26

  const assign = (node: GameTreeNode): number => {
    const y = paddingTop + node.depth * verticalGap

    if (node.children.length === 0) {
      const x = paddingX + leafCursor * horizontalGap
      leafCursor += 1
      positions.set(node.id, { x, y })
      return x
    }

    const childXs = node.children.map(assign)
    const x = childXs.reduce((sum, value) => sum + value, 0) / childXs.length
    positions.set(node.id, { x, y })
    return x
  }

  assign(root)

  return {
    positions,
    width: Math.max(500, paddingX * 2 + leafCursor * horizontalGap),
    height: Math.max(240, paddingTop + 7 * verticalGap),
  }
}

function renderBoardCell(highlighted: boolean) {
  return `rounded-md h-16 flex items-center justify-center text-xl font-headline ${
    highlighted
      ? 'bg-primary/15 text-primary border border-primary/30'
      : 'bg-surface-container-low text-on-surface'
  }`
}

function TreeDiagram({
  node,
  visibleIds,
  positions,
}: {
  node: GameTreeNode
  visibleIds: Set<string>
  positions: Map<string, LayoutPoint>
}) {
  if (!visibleIds.has(node.id)) {
    return null
  }

  const point = positions.get(node.id)
  if (!point) {
    return null
  }

  return (
    <g>
      {node.children.map((child) => {
        const childPoint = positions.get(child.id)

        if (!childPoint || !visibleIds.has(child.id)) {
          return null
        }

        return (
          <path
            key={`${node.id}-${child.id}`}
            d={`M ${point.x} ${point.y + 16} C ${point.x} ${point.y + 36}, ${childPoint.x} ${childPoint.y - 36}, ${childPoint.x} ${childPoint.y - 16}`}
            stroke={child.pruned ? '#6f677c' : '#555'}
            strokeDasharray={child.pruned ? '4 4' : undefined}
            strokeWidth={1.4}
            fill="none"
            opacity={0.7}
          />
        )
      })}

      {node.children.map((child) => (
        <TreeDiagram key={child.id} node={child} visibleIds={visibleIds} positions={positions} />
      ))}

      <rect
        x={point.x - 32}
        y={point.y - 16}
        width={64}
        height={32}
        rx={8}
        fill={node.pruned ? '#1a1a1a' : node.player === 'X' ? '#1e1e1e' : '#161616'}
        stroke={node.pruned ? '#7a7388' : node.player === 'X' ? '#a078ff' : '#4cd7f6'}
        strokeWidth={1.4}
        strokeDasharray={node.pruned ? '4 3' : undefined}
        opacity={node.pruned ? 0.55 : 0.9}
      />
      <text
        x={point.x}
        y={point.y - 2}
        textAnchor="middle"
        fontSize="10"
        fontFamily="JetBrains Mono"
        fill="#dbd8d7"
      >
        {node.move === undefined ? 'root' : `m${node.move}`}
      </text>
      <text
        x={point.x}
        y={point.y + 10}
        textAnchor="middle"
        fontSize="9"
        fontFamily="JetBrains Mono"
        fill={node.pruned ? '#7a7388' : node.utility >= 0 ? '#4cd7f6' : '#ffb869'}
      >
        {node.utility.toFixed(1)}
      </text>
    </g>
  )
}

export function MinimaxAlphaBetaVisualization({
  result,
  runtime,
}: VisualizationProps<MinimaxAlphaBetaParams, MinimaxAlphaBetaResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.playbackOrder.length - 1)
  const visibleIds = useMemo(
    () => new Set(result.playbackOrder.slice(0, activeIndex + 1)),
    [activeIndex, result.playbackOrder],
  )
  const layout = useMemo(() => createTreeLayout(result.tree), [result.tree])

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Game tree replay' : 'Adversarial analysis'}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Move</p>
            <p className="font-mono text-sm text-primary">
              {result.chosenMove === null ? '-' : result.chosenMove}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Utility</p>
            <p className="font-mono text-sm text-secondary">{result.utilityScore.toFixed(1)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Evaluated</p>
            <p className="font-mono text-sm text-tertiary">{result.evaluatedNodes}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Pruned</p>
            <p className="font-mono text-sm text-outline">{result.prunedNodes}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[0.9fr_1.2fr] gap-4 min-h-0">
        <div className="grid grid-rows-[0.9fr_1fr] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
                Board State
              </h4>
              <span className="text-[10px] font-mono text-primary">X to move</span>
            </div>
            <div className="grid grid-cols-3 gap-2 flex-1">
              {result.board.map((cell, index) => (
                <div
                  key={index}
                  className={renderBoardCell(index === result.chosenMove)}
                >
                  {cell || ''}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
                Search Notes
              </h4>
              <span className="text-[10px] font-mono text-secondary">
                Step {activeIndex + 1}/{result.playbackOrder.length}
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              <div className="rounded-lg bg-surface-container-low/60 p-3">
                <p className="text-xs font-semibold text-on-surface">Recommended move</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Root utility {result.utilityScore.toFixed(1)} ile cell {result.chosenMove ?? '-'} one cikiyor.
                </p>
              </div>
              <div className="rounded-lg bg-surface-container-low/60 p-3">
                <p className="text-xs font-semibold text-on-surface">Pruned branches</p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Dashed node lar, Alpha-Beta siniri asildigi icin artik degerlendirilmesine gerek olmayan olasiliklari temsil eder.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col overflow-hidden min-h-0">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Search Tree
          </h4>
          <div className="flex-1 min-h-0">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${layout.width} ${layout.height}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <TreeDiagram node={result.tree} visibleIds={visibleIds} positions={layout.positions} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
