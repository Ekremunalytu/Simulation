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
  PartialDerivativesParams,
  PartialDerivativesResult,
} from './logic'

function getColor(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min || 1)
  const alpha = 0.2 + ratio * 0.55
  return `rgba(208,188,255,${alpha.toFixed(3)})`
}

export function PartialDerivativesVisualization({
  params,
  result,
  runtime,
}: VisualizationProps<PartialDerivativesParams, PartialDerivativesResult>) {
  const values = result.contourSamples.map((sample) => sample.z)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            h küçülerek kısmi türev yaklaşımı
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Aktif h</p>
            <p className="font-mono text-sm text-primary">{activeFrame.h.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Yaklaşık Gradient</p>
            <p className="font-mono text-sm text-secondary">
              ({activeFrame.approxDfdx.toFixed(2)}, {activeFrame.approxDfdy.toFixed(2)})
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Kontur ve Örnek Noktalar
          </h4>
          <div className="flex-1 min-h-[260px]">
            <svg viewBox="0 0 420 320" className="w-full h-full">
              <rect width="420" height="320" fill="transparent" />
              {result.contourSamples.map((sample) => {
                const x = 40 + ((sample.x + 2.5) / 5) * 320
                const y = 280 - ((sample.y + 2.5) / 5) * 240
                return (
                  <circle
                    key={`${sample.x}-${sample.y}`}
                    cx={x}
                    cy={y}
                    r="15"
                    fill={getColor(sample.z, min, max)}
                    stroke="rgba(76,215,246,0.18)"
                  />
                )
              })}
              <line
                x1={40 + ((params.pointX + 2.5) / 5) * 320}
                y1={280 - ((params.pointY + 2.5) / 5) * 240}
                x2={40 + ((activeFrame.xOffsetPoint.x + 2.5) / 5) * 320}
                y2={280 - ((activeFrame.xOffsetPoint.y + 2.5) / 5) * 240}
                stroke="#ffb869"
                strokeWidth="3"
              />
              <line
                x1={40 + ((params.pointX + 2.5) / 5) * 320}
                y1={280 - ((params.pointY + 2.5) / 5) * 240}
                x2={40 + ((activeFrame.yOffsetPoint.x + 2.5) / 5) * 320}
                y2={280 - ((activeFrame.yOffsetPoint.y + 2.5) / 5) * 240}
                stroke="#4cd7f6"
                strokeWidth="3"
              />
              <circle
                cx={40 + ((params.pointX + 2.5) / 5) * 320}
                cy={280 - ((params.pointY + 2.5) / 5) * 240}
                r="8"
                fill="#d0bcff"
              />
              <circle
                cx={40 + ((activeFrame.xOffsetPoint.x + 2.5) / 5) * 320}
                cy={280 - ((activeFrame.xOffsetPoint.y + 2.5) / 5) * 240}
                r="7"
                fill="#ffb869"
              />
              <circle
                cx={40 + ((activeFrame.yOffsetPoint.x + 2.5) / 5) * 320}
                cy={280 - ((activeFrame.yOffsetPoint.y + 2.5) / 5) * 240}
                r="7"
                fill="#4cd7f6"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
              x Doğrultusunda Secant → Tangent
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={result.xSlice}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                  <XAxis dataKey="axisValue" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
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
                  <ReferenceLine x={params.pointX} stroke="#777" strokeDasharray="4 2" />
                  <Line dataKey="actual" type="monotone" stroke="#d0bcff" strokeWidth={2.5} dot={false} />
                  <Line dataKey="tangent" type="monotone" stroke="#4cd7f6" strokeWidth={2} dot={false} />
                  <Line data={activeFrame.xSecantLine} dataKey="tangent" type="monotone" stroke="#ffb869" strokeWidth={1.8} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
              y Doğrultusunda Secant → Tangent
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={result.ySlice}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                  <XAxis dataKey="axisValue" type="number" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
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
                  <ReferenceLine x={params.pointY} stroke="#777" strokeDasharray="4 2" />
                  <Line dataKey="actual" type="monotone" stroke="#d0bcff" strokeWidth={2.5} dot={false} />
                  <Line dataKey="tangent" type="monotone" stroke="#4cd7f6" strokeWidth={2} dot={false} />
                  <Line data={activeFrame.ySecantLine} dataKey="tangent" type="monotone" stroke="#ffb869" strokeWidth={1.8} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
