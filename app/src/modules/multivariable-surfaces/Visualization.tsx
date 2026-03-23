import {
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type {
  MultivariableSurfacesParams,
  MultivariableSurfacesResult,
} from './logic'

function getColor(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min || 1)
  const alpha = 0.15 + ratio * 0.65
  return `rgba(208,188,255,${alpha.toFixed(3)})`
}

export function MultivariableSurfacesVisualization({
  params,
  result,
  runtime,
}: VisualizationProps<MultivariableSurfacesParams, MultivariableSurfacesResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const min = Math.min(...result.contourSamples.map((sample) => sample.z))
  const max = Math.max(...result.contourSamples.map((sample) => sample.z))

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            contour ve kesit birlikte
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Aktif Seviye</p>
            <p className="font-mono text-sm text-primary">{activeFrame.levelValue.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Contour Noktası</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.levelPoints.length}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Contour Haritası
          </h4>
          <div className="flex-1 min-h-[260px]">
            <svg viewBox="0 0 420 320" className="w-full h-full">
              {result.contourSamples.map((sample) => {
                const x = 40 + ((sample.x + 2.4) / 4.8) * 320
                const y = 280 - ((sample.y + 2.4) / 4.8) * 240
                return (
                  <circle
                    key={`${sample.x}-${sample.y}`}
                    cx={x}
                    cy={y}
                    r="13"
                    fill={getColor(sample.z, min, max)}
                    stroke="rgba(76,215,246,0.15)"
                  />
                )
              })}
              {result.fixedAxisLabel === 'x' ? (
                <line
                  x1={40 + ((params.sliceValue + 2.4) / 4.8) * 320}
                  y1={40}
                  x2={40 + ((params.sliceValue + 2.4) / 4.8) * 320}
                  y2={280}
                  stroke="#4cd7f6"
                  strokeDasharray="5 3"
                  strokeWidth="2"
                />
              ) : (
                <line
                  x1={40}
                  y1={280 - ((params.sliceValue + 2.4) / 4.8) * 240}
                  x2={360}
                  y2={280 - ((params.sliceValue + 2.4) / 4.8) * 240}
                  stroke="#4cd7f6"
                  strokeDasharray="5 3"
                  strokeWidth="2"
                />
              )}
              {activeFrame.levelPoints.map((point, index) => (
                <circle
                  key={`${point.x}-${point.y}-${index}`}
                  cx={40 + ((point.x + 2.4) / 4.8) * 320}
                  cy={280 - ((point.y + 2.4) / 4.8) * 240}
                  r="4"
                  fill="#ffb869"
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            {result.fixedAxisLabel} = {params.sliceValue.toFixed(2)} Kesiti
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.sliceData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis
                  dataKey="axisValue"
                  type="number"
                  label={{ value: result.sliceAxisLabel, position: 'insideBottom', offset: -4 }}
                  stroke="#555"
                  tick={{ fontSize: 10, fill: '#b0a8bc' }}
                  tickLine={false}
                />
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
                <ReferenceLine y={activeFrame.levelValue} stroke="#ffb869" strokeDasharray="4 2" />
                <Line dataKey="surface" type="monotone" stroke="#d0bcff" strokeWidth={2.4} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
