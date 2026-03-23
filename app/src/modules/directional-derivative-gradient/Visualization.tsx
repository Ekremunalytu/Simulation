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
  DirectionalDerivativeGradientParams,
  DirectionalDerivativeGradientResult,
} from './logic'

function getColor(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min || 1)
  const alpha = 0.18 + ratio * 0.6
  return `rgba(208,188,255,${alpha.toFixed(3)})`
}

export function DirectionalDerivativeGradientVisualization({
  params,
  result,
  runtime,
}: VisualizationProps<
  DirectionalDerivativeGradientParams,
  DirectionalDerivativeGradientResult
>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const min = Math.min(...result.contourSamples.map((sample) => sample.z))
  const max = Math.max(...result.contourSamples.map((sample) => sample.z))
  const pointSvgX = 40 + ((params.pointX + 2.4) / 4.8) * 320
  const pointSvgY = 280 - ((params.pointY + 2.4) / 4.8) * 240
  const gradientScale = 24
  const directionScale = 36

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            gradyan projeksiyonu
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Analitik D_u f</p>
            <p className="font-mono text-sm text-primary">{result.exactDirectional.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Yaklaşık D_u f</p>
            <p className="font-mono text-sm text-secondary">
              {activeFrame.approxDirectional.toFixed(3)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Contour, Gradyan ve Yön
          </h4>
          <div className="flex-1 min-h-[260px]">
            <svg viewBox="0 0 420 320" className="w-full h-full">
              {result.contourSamples.map((sample) => (
                <circle
                  key={`${sample.x}-${sample.y}`}
                  cx={40 + ((sample.x + 2.4) / 4.8) * 320}
                  cy={280 - ((sample.y + 2.4) / 4.8) * 240}
                  r="13"
                  fill={getColor(sample.z, min, max)}
                  stroke="rgba(76,215,246,0.14)"
                />
              ))}
              <line
                x1={pointSvgX}
                y1={pointSvgY}
                x2={pointSvgX + result.gradient.x * gradientScale}
                y2={pointSvgY - result.gradient.y * gradientScale}
                stroke="#4cd7f6"
                strokeWidth="3"
              />
              <line
                x1={pointSvgX}
                y1={pointSvgY}
                x2={pointSvgX + result.unitDirection.x * directionScale}
                y2={pointSvgY - result.unitDirection.y * directionScale}
                stroke="#ffb869"
                strokeWidth="3"
              />
              <circle cx={pointSvgX} cy={pointSvgY} r="7" fill="#d0bcff" />
              <circle
                cx={40 + ((activeFrame.endpoint.x + 2.4) / 4.8) * 320}
                cy={280 - ((activeFrame.endpoint.y + 2.4) / 4.8) * 240}
                r="6"
                fill="#ffb869"
              />
            </svg>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Sonlu Fark Yakınsaması
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.convergenceData}>
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
                <ReferenceLine y={result.exactDirectional} stroke="#ffb869" strokeDasharray="4 2" />
                <Line dataKey="approx" type="monotone" stroke="#4cd7f6" strokeWidth={2.4} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
