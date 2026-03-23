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
import type { LineIntegralsParams, LineIntegralsResult } from './logic'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function LineIntegralsVisualization({
  result,
  runtime,
}: VisualizationProps<LineIntegralsParams, LineIntegralsResult>) {
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
  const vectorLength = Math.max(Math.min(xMax - xMin, yMax - yMin) * 0.18, 0.22)
  const tangentMagnitude = Math.hypot(activeFrame.tangent.x, activeFrame.tangent.y) || 1
  const tangentUnit = {
    x: activeFrame.tangent.x / tangentMagnitude,
    y: activeFrame.tangent.y / tangentMagnitude,
  }
  const fieldMagnitude = Math.hypot(activeFrame.field.x, activeFrame.field.y) || 1
  const fieldUnit = {
    x: activeFrame.field.x / fieldMagnitude,
    y: activeFrame.field.y / fieldMagnitude,
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
  const fieldData = [
    activeFrame.point,
    {
      x: clamp(activeFrame.point.x + fieldUnit.x * vectorLength, xDomain[0], xDomain[1]),
      y: clamp(activeFrame.point.y + fieldUnit.y * vectorLength, yDomain[0], yDomain[1]),
    },
  ]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            eğri boyunca katkı
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Aktif Katkı</p>
            <p className="font-mono text-sm text-primary">{activeFrame.contribution.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Kümülatif</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.cumulative.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Eğri, Tangent ve Alan
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.path}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={xDomain}
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  domain={yDomain}
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Line data={result.path} dataKey="y" type="linear" stroke="#d0bcff" strokeWidth={2.3} dot={false} isAnimationActive={false} />
                <Line data={tangentData} dataKey="y" type="linear" stroke="#4cd7f6" strokeWidth={2.1} dot={false} isAnimationActive={false} />
                <Line data={fieldData} dataKey="y" type="linear" stroke="#ffb869" strokeWidth={2.1} dot={false} isAnimationActive={false} />
                <Scatter data={[activeFrame.point]} fill="#ffb869" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Kümülatif İntegral
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.cumulativeData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="step" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Line dataKey="cumulative" type="monotone" stroke="#4cd7f6" strokeWidth={2.4} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
