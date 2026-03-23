import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type { ParametricCurvesParams, ParametricCurvesResult } from './logic'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function ParametricCurvesVisualization({
  result,
  runtime,
}: VisualizationProps<ParametricCurvesParams, ParametricCurvesResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const xValues = result.path.map((point) => point.x)
  const yValues = result.path.map((point) => point.y)
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)
  const xPadding = Math.max((xMax - xMin) * 0.12, 0.2)
  const yPadding = Math.max((yMax - yMin) * 0.12, 0.2)
  const xDomain: [number, number] = [xMin - xPadding, xMax + xPadding]
  const yDomain: [number, number] = [yMin - yPadding, yMax + yPadding]
  const vectorLength = Math.max(Math.min(xMax - xMin, yMax - yMin) * 0.18, 0.24)
  const tangentMagnitude = Math.hypot(activeFrame.tangent.x, activeFrame.tangent.y) || 1
  const tangentUnit = {
    x: activeFrame.tangent.x / tangentMagnitude,
    y: activeFrame.tangent.y / tangentMagnitude,
  }
  const tangentData = [
    {
      x: clamp(activeFrame.point.x - tangentUnit.x * vectorLength, xDomain[0], xDomain[1]),
      y: clamp(activeFrame.point.y - tangentUnit.y * vectorLength, yDomain[0], yDomain[1]),
    },
    {
      x: clamp(activeFrame.point.x + tangentUnit.x * vectorLength, xDomain[0], xDomain[1]),
      y: clamp(activeFrame.point.y + tangentUnit.y * vectorLength, yDomain[0], yDomain[1]),
    },
  ]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            parametrik hareket
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">t</p>
            <p className="font-mono text-sm text-primary">{activeFrame.t.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Hız</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.speed.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">İvme</p>
            <p className="font-mono text-sm text-tertiary">{activeFrame.acceleration.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Eğri ve Tangent
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.path}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={xDomain}
                  stroke="#5a5567"
                  tick={{ fontSize: 12, fill: '#b9b4c8' }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  domain={yDomain}
                  stroke="#5a5567"
                  tick={{ fontSize: 12, fill: '#b9b4c8' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: 'rgba(24, 24, 32, 0.92)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '12px', color: '#e5e2e1' }}
                />
                <Line data={result.path} dataKey="y" type="linear" stroke="#d0bcff" strokeWidth={2.3} dot={false} isAnimationActive={false} />
                <Line data={tangentData} dataKey="y" type="linear" stroke="#4cd7f6" strokeWidth={2.1} dot={false} isAnimationActive={false} />
                <Scatter data={[activeFrame.point]} fill="#ffb869" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Hız ve İvme Profili
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.speedData}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis dataKey="t" type="number" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <YAxis stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(24, 24, 32, 0.92)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '12px', color: '#e5e2e1' }}
                />
                <Line dataKey="speed" type="monotone" stroke="#4cd7f6" strokeWidth={2.4} dot={false} />
                <Line dataKey="acceleration" type="monotone" stroke="#ffb869" strokeWidth={2.1} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
