import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type {
  BayesianNetworkInferenceParams,
  BayesianNetworkInferenceResult,
} from './logic'

const positions: Record<string, { x: number; y: number }> = {
  'study-habit': { x: 55, y: 48 },
  attendance: { x: 150, y: 48 },
  'exam-difficulty': { x: 245, y: 48 },
  'high-grade': { x: 150, y: 142 },
  'pass-course': { x: 100, y: 245 },
  'gets-recommendation': { x: 205, y: 245 },
}

function nodeFill(active: boolean, target: boolean, evidence: boolean) {
  if (target) {
    return active ? '#4cd7f6' : '#1d2830'
  }
  if (evidence) {
    return active ? '#d0bcff' : '#211d2b'
  }
  return '#17171b'
}

export function BayesianNetworkInferenceVisualization({
  result,
}: VisualizationProps<BayesianNetworkInferenceParams, BayesianNetworkInferenceResult>) {
  const chartData = result.priorTable.map((row) => ({
    state: row.state,
    prior: Number((row.probability * 100).toFixed(2)),
    posterior:
      Number(
        ((result.posteriorTable.find((item) => item.state === row.state)?.probability ?? 0) * 100).toFixed(2),
      ),
  }))

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {result.targetLabel} · Bayesian network
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Target</p>
            <p className="font-mono text-sm text-primary">{result.targetLabel}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Evidence</p>
            <p className="font-mono text-sm text-secondary">{Object.keys(result.evidence).length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Best Signal</p>
            <p className="font-mono text-sm text-tertiary">
              {result.mostInformativeEvidence ?? '-'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Delta</p>
            <p className="font-mono text-sm text-outline">
              {(result.targetProbabilityDelta * 100).toFixed(1)} pts
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[0.92fr_1.08fr] gap-4 min-h-0 overflow-hidden">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
              Network Graph
            </h4>
            <span className="text-xs font-mono text-outline">
              Active evidence glow
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-auto">
            <svg width="100%" height="100%" viewBox="0 0 300 300">
              {result.edges.map(([from, to]) => (
                <line
                  key={`${from}-${to}`}
                  x1={positions[from].x}
                  y1={positions[from].y}
                  x2={positions[to].x}
                  y2={positions[to].y}
                  stroke="#4b4658"
                  strokeWidth={2}
                />
              ))}

              {result.nodes.map((node) => {
                const point = positions[node.id]
                const evidence = Object.prototype.hasOwnProperty.call(result.evidence, node.id)
                const target = node.id === result.targetLabel.toLowerCase().replaceAll(' ', '-')
                return (
                  <g key={node.id}>
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={30}
                      fill={nodeFill(true, target, evidence)}
                      stroke={evidence ? '#d0bcff' : target ? '#4cd7f6' : '#302d39'}
                      strokeWidth={evidence || target ? 3 : 2}
                    />
                    <text
                      x={point.x}
                      y={point.y - 4}
                      textAnchor="middle"
                      fill="#dbd8d7"
                      fontFamily="JetBrains Mono"
                      fontSize="10"
                    >
                      {node.label}
                    </text>
                    <text
                      x={point.x}
                      y={point.y + 12}
                      textAnchor="middle"
                      fill="#b7b3c2"
                      fontFamily="JetBrains Mono"
                      fontSize="9"
                    >
                      {evidence ? result.evidence[node.id as keyof typeof result.evidence] : node.type}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,0.9fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
              Prior vs Posterior
            </h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="state"
                    stroke="#5a5567"
                    tick={{ fontSize: 12, fill: '#b9b4c8' }}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#5a5567"
                    tick={{ fontSize: 12, fill: '#b9b4c8' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(24, 24, 32, 0.92)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e5e2e1',
                    }}
                  />
                  <Bar dataKey="prior" fill="#a078ff" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="posterior" fill="#4cd7f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] gap-4 min-h-0">
            <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                  Influence Paths
                </h4>
                <span className="text-xs font-mono text-primary">
                  {result.influencePaths.length} signal
                </span>
              </div>
              <div className="space-y-2 overflow-auto min-h-0 pr-1">
                {result.influencePaths.map((path) => (
                  <div key={path.source} className="rounded-lg bg-surface-container-low/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-on-surface">{path.source}</p>
                      <p className="text-[11px] font-mono text-secondary">
                        {(path.delta * 100).toFixed(1)} pts
                      </p>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      {path.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                  CPT Notes
                </h4>
                <span className="text-xs font-mono text-tertiary">
                  {Object.keys(result.evidence).length > 0 ? 'Evidence active' : 'Prior only'}
                </span>
              </div>
              <div className="space-y-2 overflow-auto min-h-0 pr-1">
                {result.cpts.map((entry) => (
                  <div key={entry.nodeId} className="rounded-lg bg-surface-container-low/60 p-3">
                    <p className="text-xs font-semibold text-on-surface">{entry.nodeId}</p>
                    <p className="text-[11px] text-on-surface-variant mt-1">{entry.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
