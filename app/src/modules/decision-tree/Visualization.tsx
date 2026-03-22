import { useMemo } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts'
import { generateClassificationData, buildTree, countNodes, treeDepth, type TreeNode } from './logic'

interface Props {
  params: Record<string, any>
}

function TreeDiagram({ node, x, y, width }: { node: TreeNode; x: number; y: number; width: number }) {
  const isLeaf = !node.left && !node.right
  const nodeWidth = 80
  const nodeHeight = 36
  const verticalGap = 60

  return (
    <g>
      {/* Connections to children */}
      {node.left && (
        <>
          <line
            x1={x}
            y1={y + nodeHeight / 2}
            x2={x - width / 4}
            y2={y + verticalGap}
            stroke="#494454"
            strokeWidth={1}
          />
          <TreeDiagram node={node.left} x={x - width / 4} y={y + verticalGap} width={width / 2} />
        </>
      )}
      {node.right && (
        <>
          <line
            x1={x}
            y1={y + nodeHeight / 2}
            x2={x + width / 4}
            y2={y + verticalGap}
            stroke="#494454"
            strokeWidth={1}
          />
          <TreeDiagram node={node.right} x={x + width / 4} y={y + verticalGap} width={width / 2} />
        </>
      )}

      {/* Node box */}
      <rect
        x={x - nodeWidth / 2}
        y={y - nodeHeight / 2}
        width={nodeWidth}
        height={nodeHeight}
        rx={6}
        fill={isLeaf ? (node.label === 'Class A' ? '#a078ff' : '#4cd7f6') : '#2a2a2a'}
        opacity={isLeaf ? 0.8 : 1}
        stroke="#494454"
        strokeWidth={0.5}
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#e5e2e1"
        fontSize={8}
        fontFamily="JetBrains Mono"
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
        fill="#958ea0"
        fontSize={6}
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

  const svgHeight = Math.max(200, (depth + 1) * 70 + 40)

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
            <div className="w-3 h-3 rounded bg-primary-container/80" />
            <span className="text-[10px] font-mono text-outline">Class A</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-secondary/80" />
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
                <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#494454" tick={{ fontSize: 10, fill: '#958ea0' }} tickLine={false} />
                <YAxis dataKey="y" type="number" stroke="#494454" tick={{ fontSize: 10, fill: '#958ea0' }} tickLine={false} />
                <ZAxis range={[30, 30]} />
                <Tooltip
                  contentStyle={{
                    background: '#201f1f',
                    border: '1px solid #494454',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Scatter data={class0} fill="#a078ff" name="Class A" />
                <Scatter data={class1} fill="#4cd7f6" name="Class B" />
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
