import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts'
import { runGradientDescent } from './logic'

interface Props {
  params: Record<string, any>
}

export function GradientDescentVisualization({ params }: Props) {
  const path = useMemo(() => {
    return runGradientDescent(
      params.learningRate as number,
      params.iterations as number,
      params.startX as number,
      params.startY as number,
      params.momentum as boolean,
      params.stochastic as boolean
    )
  }, [params.learningRate, params.iterations, params.startX, params.startY, params.momentum, params.stochastic])

  const lossData = path.map((p) => ({ iteration: p.iteration, loss: p.loss }))
  const trajectoryData = path.map((p) => ({ x: p.x, y: p.y }))

  const finalLoss = path[path.length - 1]?.loss ?? 0
  const converged = finalLoss < 0.01

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${converged ? 'bg-secondary shadow-[0_0_8px_#4cd7f6]' : 'bg-tertiary shadow-[0_0_8px_#ffb869]'}`} />
            <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
              {converged ? 'Converged' : 'Optimizing'}
            </span>
          </div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Final Loss</p>
            <p className="font-mono text-sm text-secondary">{finalLoss.toFixed(6)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Position</p>
            <p className="font-mono text-sm text-primary">
              ({path[path.length - 1]?.x.toFixed(3)}, {path[path.length - 1]?.y.toFixed(3)})
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        {/* Loss Curve */}
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">Loss over Iterations</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lossData}>
                <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                <XAxis
                  dataKey="iteration"
                  stroke="#494454"
                  tick={{ fontSize: 10, fill: '#958ea0' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="#494454"
                  tick={{ fontSize: 10, fill: '#958ea0' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#201f1f',
                    border: '1px solid #494454',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="loss"
                  stroke="#4cd7f6"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trajectory */}
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">Parameter Trajectory (θ₀, θ₁)</h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  name="θ₀"
                  stroke="#494454"
                  tick={{ fontSize: 10, fill: '#958ea0' }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  name="θ₁"
                  stroke="#494454"
                  tick={{ fontSize: 10, fill: '#958ea0' }}
                  tickLine={false}
                />
                <ZAxis range={[20, 20]} />
                <Tooltip
                  contentStyle={{
                    background: '#201f1f',
                    border: '1px solid #494454',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Scatter
                  data={trajectoryData}
                  fill="#d0bcff"
                  line={{ stroke: '#d0bcff', strokeWidth: 1.5 }}
                  animationDuration={800}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
