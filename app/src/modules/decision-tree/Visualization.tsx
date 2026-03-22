import { useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts'
import { generateClassificationData, buildTree, countNodes, treeDepth, type TreeNode } from './logic'

interface Props {
  params: Record<string, any>
}

function TreeDiagram({ node, x, y, width }: { node: TreeNode; x: number; y: number; width: number }) {
  const isLeaf = !node.left && !node.right
  const nodeWidth = 88
  const nodeHeight = 40
  const verticalGap = 64

  const childY = y + verticalGap

  return (
    <g>
      {/* Connections to children — curved paths */}
      {node.left && (
        <>
          <path
            d={`M ${x} ${y + nodeHeight / 2} C ${x} ${y + verticalGap * 0.6}, ${x - width / 4} ${y + verticalGap * 0.4}, ${x - width / 4} ${childY - nodeHeight / 2}`}
            stroke="#555"
            strokeWidth={1.5}
            fill="none"
            opacity={0.6}
          />
          <TreeDiagram node={node.left} x={x - width / 4} y={childY} width={width / 2} />
        </>
      )}
      {node.right && (
        <>
          <path
            d={`M ${x} ${y + nodeHeight / 2} C ${x} ${y + verticalGap * 0.6}, ${x + width / 4} ${y + verticalGap * 0.4}, ${x + width / 4} ${childY - nodeHeight / 2}`}
            stroke="#555"
            strokeWidth={1.5}
            fill="none"
            opacity={0.6}
          />
          <TreeDiagram node={node.right} x={x + width / 4} y={childY} width={width / 2} />
        </>
      )}

      {/* Node box */}
      {isLeaf ? (
        <>
          <rect
            x={x - nodeWidth / 2}
            y={y - nodeHeight / 2}
            width={nodeWidth}
            height={nodeHeight}
            rx={8}
            fill={node.label === 'Class A' ? '#a078ff' : '#4cd7f6'}
            opacity={0.2}
          />
          <rect
            x={x - nodeWidth / 2}
            y={y - nodeHeight / 2}
            width={nodeWidth}
            height={nodeHeight}
            rx={8}
            fill="none"
            stroke={node.label === 'Class A' ? '#a078ff' : '#4cd7f6'}
            strokeWidth={1.5}
            opacity={0.6}
          />
        </>
      ) : (
        <rect
          x={x - nodeWidth / 2}
          y={y - nodeHeight / 2}
          width={nodeWidth}
          height={nodeHeight}
          rx={8}
          fill="#1e1e1e"
          stroke="#444"
          strokeWidth={1}
        />
      )}

      {/* Label */}
      <text
        x={x}
        y={y - 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={isLeaf ? (node.label === 'Class A' ? '#d0bcff' : '#4cd7f6') : '#dbd8d7'}
        fontSize={9}
        fontFamily="JetBrains Mono"
        fontWeight={isLeaf ? 600 : 400}
      >
        {isLeaf
          ? node.label
          : `${node.feature} ≤ ${node.threshold?.toFixed(1)}`}
      </text>
      <text
        x={x}
        y={y + 12}
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

export function DecisionTreeVisualization({ params }: Props) {
  const data = useMemo(
    () => generateClassificationData(params.numPoints as number, params.separation as number),
    [params.numPoints, params.separation]
  )

  const tree = useMemo(
    () => buildTree(data, params.maxDepth as number, params.minSamples as number, params.criterion as string),
    [data, params.maxDepth, params.minSamples, params.criterion]
  )

  const nodes = countNodes(tree)
  const depth = treeDepth(tree)

  const class0 = data.filter((p) => p.label === 0).map((p) => ({ x: p.x, y: p.y }))
  const class1 = data.filter((p) => p.label === 1).map((p) => ({ x: p.x, y: p.y }))

  const svgHeight = Math.max(200, (depth + 1) * 74 + 40)

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
              {nodes} Nodes · Depth {depth}
            </span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-container/80" />
            <span className="text-[10px] font-mono text-outline">Class A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary/80" />
            <span className="text-[10px] font-mono text-outline">Class B</span>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        {/* Data scatter */}
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">Classification Data</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <defs>
                  <filter id="glowA" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <filter id="glowB" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis dataKey="y" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
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
                <Scatter data={class0} fill="#c4a8ff" name="Class A" opacity={0.85} />
                <Scatter data={class1} fill="#4cd7f6" name="Class B" opacity={0.85} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tree structure */}
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col overflow-hidden">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">Tree Structure</h4>
          <div className="flex-1 overflow-auto">
            <svg width="100%" height={svgHeight} viewBox={`0 0 500 ${svgHeight}`}>
              <TreeDiagram node={tree} x={250} y={30} width={480} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
