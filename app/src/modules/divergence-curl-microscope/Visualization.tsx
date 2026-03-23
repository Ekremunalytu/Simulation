import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  chartGridStroke,
  chartStroke,
  chartTick,
  chartTooltipStyle,
} from '../../components/simulation/chartTheme'
import type { VisualizationProps } from '../../types/simulation'
import type {
  DivergenceCurlMicroscopeParams,
  DivergenceCurlMicroscopeResult,
} from './logic'

export function DivergenceCurlMicroscopeVisualization({
  result,
  runtime,
}: VisualizationProps<DivergenceCurlMicroscopeParams, DivergenceCurlMicroscopeResult>) {
  const activeFrame =
    result.probeFrames[Math.min(runtime.frameIndex, result.probeFrames.length - 1)] ?? result.probeFrames[0]
  const scale = 54
  const offsetX = 220
  const offsetY = 170
  const visibleOutline = result.probeOutline
    .slice(0, Math.min(runtime.frameIndex + 2, result.probeOutline.length))
    .map((point) => `${offsetX + point.x * scale},${offsetY - point.y * scale}`)
    .join(' ')

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            flux vs circulation probe
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Adım</p>
            <p className="font-mono text-sm text-primary">{activeFrame?.step ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">div F</p>
            <p className="font-mono text-sm text-secondary">{result.estimatedDivergence.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">curl F</p>
            <p className="font-mono text-sm text-tertiary">{result.estimatedCurl.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.05fr_1fr] gap-4 min-h-0">
        <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4">
          <h4 className="eyebrow mb-3">Vector Field ve Probe</h4>
          <svg viewBox="0 0 440 340" className="w-full h-[320px]">
            {result.vectorSamples.map((sample, index) => {
              const x1 = offsetX + sample.x * scale
              const y1 = offsetY - sample.y * scale
              const magnitude = sample.magnitude || 1
              const x2 = x1 + (sample.vx / magnitude) * 18
              const y2 = y1 - (sample.vy / magnitude) * 18

              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(208,188,255,0.75)"
                  strokeWidth="2"
                />
              )
            })}

            <polyline fill="none" stroke="#4cd7f6" strokeWidth="3" points={visibleOutline} />

            {activeFrame ? (
              <>
                <circle
                  cx={offsetX + activeFrame.point.x * scale}
                  cy={offsetY - activeFrame.point.y * scale}
                  r="7"
                  fill="#ffb869"
                />
                <line
                  x1={offsetX + activeFrame.point.x * scale}
                  y1={offsetY - activeFrame.point.y * scale}
                  x2={offsetX + activeFrame.point.x * scale + activeFrame.normal.x * 24}
                  y2={offsetY - activeFrame.point.y * scale - activeFrame.normal.y * 24}
                  stroke="#4cd7f6"
                  strokeWidth="3"
                />
                <line
                  x1={offsetX + activeFrame.point.x * scale}
                  y1={offsetY - activeFrame.point.y * scale}
                  x2={offsetX + activeFrame.point.x * scale + activeFrame.tangent.x * 24}
                  y2={offsetY - activeFrame.point.y * scale - activeFrame.tangent.y * 24}
                  stroke="#d0bcff"
                  strokeWidth="3"
                />
              </>
            ) : null}
          </svg>
        </div>

        <div className="grid grid-rows-[minmax(0,0.9fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4 flex flex-col min-h-0">
            <h4 className="eyebrow mb-3">Cumulative Integrals</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.cumulativeSeries}>
                  <CartesianGrid stroke={chartGridStroke} strokeDasharray="3 3" />
                  <XAxis dataKey="step" stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <YAxis stroke={chartStroke} tick={chartTick} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="flux" stroke="#4cd7f6" strokeWidth={2.4} dot={false} />
                  <Line type="monotone" dataKey="circulation" stroke="#d0bcff" strokeWidth={2.3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4">
              <p className="text-xs font-mono text-outline uppercase">Estimated vs Exact div</p>
              <p className="text-lg font-semibold text-primary mt-3">
                {result.estimatedDivergence.toFixed(3)}
              </p>
              <p className="text-sm text-on-surface-variant mt-2">
                exact {result.exactDivergence.toFixed(3)}
              </p>
            </div>
            <div className="surface-panel rounded-[22px] border border-white/[0.04] p-4">
              <p className="text-xs font-mono text-outline uppercase">Estimated vs Exact curl</p>
              <p className="text-lg font-semibold text-secondary mt-3">
                {result.estimatedCurl.toFixed(3)}
              </p>
              <p className="text-sm text-on-surface-variant mt-2">
                exact {result.exactCurl.toFixed(3)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
