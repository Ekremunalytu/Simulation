import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type {
  ExtremaSecondDerivativeTestParams,
  ExtremaSecondDerivativeTestResult,
} from './logic'

function getColor(value: number, min: number, max: number): string {
  const ratio = (value - min) / (max - min || 1)
  const alpha = 0.16 + ratio * 0.62
  return `rgba(208,188,255,${alpha.toFixed(3)})`
}

export function ExtremaSecondDerivativeTestVisualization({
  params,
  result,
  runtime,
}: VisualizationProps<
  ExtremaSecondDerivativeTestParams,
  ExtremaSecondDerivativeTestResult
>) {
  const min = Math.min(...result.contourSamples.map((sample) => sample.z))
  const max = Math.max(...result.contourSamples.map((sample) => sample.z))
  const stage =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            kritik nokta sınıflandırması
          </span>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-mono text-outline uppercase">Karar</p>
          <p className="font-mono text-sm text-secondary">{result.classification}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[0.92fr_1.08fr] gap-4 flex-1 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Contour ve İncelenen Nokta
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
                  stroke="rgba(76,215,246,0.15)"
                />
              ))}
              <circle
                cx={40 + ((params.pointX + 2.4) / 4.8) * 320}
                cy={280 - ((params.pointY + 2.4) / 4.8) * 240}
                r="8"
                fill="#ffb869"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 min-h-0">
          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-outline mb-2">
              Aktif Aşama
            </p>
            <p className="text-sm text-on-surface">{stage.detail}</p>
          </div>
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
              x doğrultusu: gerçek vs lokal model
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
                  <Line dataKey="actual" type="monotone" stroke="#d0bcff" strokeWidth={2.4} dot={false} />
                  <Line dataKey="quadratic" type="monotone" stroke="#4cd7f6" strokeWidth={2.1} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
