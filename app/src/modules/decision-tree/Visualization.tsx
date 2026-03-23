import { useMemo } from 'react'
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type {
  DecisionTreeDerivedResult,
  DecisionTreeParams,
  TreeNode,
} from './logic'

interface LayoutPoint {
  x: number
  y: number
}

interface TreeLayout {
  positions: Map<string, LayoutPoint>
  width: number
  height: number
}

const HORIZONTAL_GAP = 108
const VERTICAL_GAP = 82
const PADDING_X = 72
const PADDING_TOP = 32
const PADDING_BOTTOM = 48

function createTreeLayout(root: TreeNode): TreeLayout {
  const positions = new Map<string, LayoutPoint>()
  let leafCursor = 0

  const assignPositions = (node: TreeNode): number => {
    const y = PADDING_TOP + node.depth * VERTICAL_GAP

    if (!node.left && !node.right) {
      const x = PADDING_X + leafCursor * HORIZONTAL_GAP
      leafCursor += 1
      positions.set(node.id, { x, y })
      return x
    }

    const childXs: number[] = []

    if (node.left) {
      childXs.push(assignPositions(node.left))
    }

    if (node.right) {
      childXs.push(assignPositions(node.right))
    }

    const x = childXs.reduce((sum, childX) => sum + childX, 0) / childXs.length
    positions.set(node.id, { x, y })
    return x
  }

  assignPositions(root)

  const leafCount = Math.max(leafCursor, 1)

  return {
    positions,
    width: Math.max(500, PADDING_X * 2 + (leafCount - 1) * HORIZONTAL_GAP),
    height: Math.max(220, PADDING_TOP + root.depth * 0 + PADDING_BOTTOM),
  }
}

function getTreeHeight(depth: number) {
  return Math.max(220, PADDING_TOP + depth * VERTICAL_GAP + PADDING_BOTTOM)
}

function TreeDiagram({
  node,
  visibleNodeIds,
  positions,
}: {
  node: TreeNode
  visibleNodeIds: Set<string>
  positions: Map<string, LayoutPoint>
}) {
  if (!visibleNodeIds.has(node.id)) {
    return null
  }

  const point = positions.get(node.id)
  if (!point) {
    return null
  }

  const isLeaf = !node.left && !node.right
  const nodeWidth = isLeaf ? 92 : 88
  const nodeHeight = 40

  const renderEdge = (child: TreeNode | undefined) => {
    if (!child || !visibleNodeIds.has(child.id)) {
      return null
    }

    const childPoint = positions.get(child.id)
    if (!childPoint) {
      return null
    }

    return (
      <>
        <path
          d={`M ${point.x} ${point.y + nodeHeight / 2} C ${point.x} ${point.y + 34}, ${childPoint.x} ${childPoint.y - 34}, ${childPoint.x} ${childPoint.y - nodeHeight / 2}`}
          stroke="#555"
          strokeWidth={1.5}
          fill="none"
          opacity={0.6}
        />
        <TreeDiagram node={child} visibleNodeIds={visibleNodeIds} positions={positions} />
      </>
    )
  }

  return (
    <g>
      {renderEdge(node.left)}
      {renderEdge(node.right)}

      {isLeaf ? (
        <>
          <rect
            x={point.x - nodeWidth / 2}
            y={point.y - nodeHeight / 2}
            width={nodeWidth}
            height={nodeHeight}
            rx={8}
          fill={node.label === 'Sınıf A' ? '#a078ff' : '#4cd7f6'}
            opacity={0.2}
          />
          <rect
            x={point.x - nodeWidth / 2}
            y={point.y - nodeHeight / 2}
            width={nodeWidth}
            height={nodeHeight}
            rx={8}
            fill="none"
            stroke={node.label === 'Sınıf A' ? '#a078ff' : '#4cd7f6'}
            strokeWidth={1.5}
            opacity={0.6}
          />
        </>
      ) : (
        <rect
          x={point.x - nodeWidth / 2}
          y={point.y - nodeHeight / 2}
          width={nodeWidth}
          height={nodeHeight}
          rx={8}
          fill="#1e1e1e"
          stroke="#444"
          strokeWidth={1}
        />
      )}

      <text
        x={point.x}
        y={point.y - 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isLeaf ? (node.label === 'Sınıf A' ? '#d0bcff' : '#4cd7f6') : '#dbd8d7'}
        fontSize={9}
        fontFamily="JetBrains Mono"
        fontWeight={isLeaf ? 600 : 400}
      >
        {isLeaf ? node.label : `${node.feature} ≤ ${node.threshold?.toFixed(1)}`}
      </text>
      <text
        x={point.x}
        y={point.y + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#7a7388"
        fontSize={7}
        fontFamily="JetBrains Mono"
      >
        n={node.samples}
      </text>
    </g>
  )
}

export function DecisionTreeVisualization({
  result,
  runtime,
}: VisualizationProps<DecisionTreeParams, DecisionTreeDerivedResult>) {
  const visibleNodeIds = useMemo(
    () => new Set(result.buildOrder.slice(0, runtime.frameIndex + 1)),
    [result.buildOrder, runtime.frameIndex],
  )
  const classA = useMemo(
    () => result.data.filter((point) => point.label === 0).map((point) => ({ x: point.x, y: point.y })),
    [result.data],
  )
  const classB = useMemo(
    () => result.data.filter((point) => point.label === 1).map((point) => ({ x: point.x, y: point.y })),
    [result.data],
  )
  const visibleNodes = Math.min(runtime.frameIndex + 1, result.buildOrder.length)
  const layout = useMemo(() => createTreeLayout(result.tree), [result.tree])
  const svgHeight = useMemo(() => getTreeHeight(result.depth), [result.depth])

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
              {visibleNodes} / {result.nodeCount} düğüm gösterildi
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-container/80" />
            <span className="text-[10px] font-mono text-outline">Sınıf A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary/80" />
            <span className="text-[10px] font-mono text-outline">Sınıf B</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Sınıflandırma Verisi
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Scatter data={classA} fill="#c4a8ff" name="Sınıf A" opacity={0.85} />
                <Scatter data={classB} fill="#4cd7f6" name="Sınıf B" opacity={0.85} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col overflow-hidden min-h-0">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Ağaç Yapısı
          </h4>
          <div className="flex-1 min-h-0">
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${layout.width} ${svgHeight}`}
              preserveAspectRatio="xMidYMid meet"
            >
              <TreeDiagram node={result.tree} visibleNodeIds={visibleNodeIds} positions={layout.positions} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
