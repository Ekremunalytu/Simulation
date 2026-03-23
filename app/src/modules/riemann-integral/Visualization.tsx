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
import type { RiemannIntegralParams, RiemannIntegralResult } from './logic'

function drawRectangles(
  width: number,
  height: number,
  result: RiemannIntegralResult,
  activeFrameIndex: number,
) {
  const frame = result.frames[activeFrameIndex] ?? result.frames[0]
  const xMin = result.interval.start
  const xMax = result.interval.end
  const maxY = Math.max(...result.curve.map((point) => point.y ?? 0), ...frame.rectangles.map((item) => item.height))
  const padding = 28
  const plotWidth = width - padding * 2
  const plotHeight = height - padding * 2

  const projectX = (x: number) => padding + ((x - xMin) / (xMax - xMin || 1)) * plotWidth
  const projectY = (y: number) => padding + plotHeight - (y / (maxY || 1)) * plotHeight

  const path = result.curve
    .filter((point) => point.y !== null)
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${projectX(point.x)} ${projectY(point.y ?? 0)}`)
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <rect x="0" y="0" width={width} height={height} fill="transparent" />
      <line x1={padding} y1={padding + plotHeight} x2={padding + plotWidth} y2={padding + plotHeight} stroke="#444" />
      <line x1={padding} y1={padding} x2={padding} y2={padding + plotHeight} stroke="#444" />
      {frame.rectangles.map((rectangle) => {
        const x = projectX(rectangle.xLeft)
        const rectWidth = projectX(rectangle.xRight) - projectX(rectangle.xLeft)
        const y = projectY(rectangle.height)
        const baseline = projectY(0)

        return (
          <rect
            key={`${rectangle.xLeft}-${rectangle.xRight}`}
            x={x}
            y={Math.min(y, baseline)}
            width={rectWidth}
            height={Math.abs(baseline - y)}
            fill="rgba(76,215,246,0.22)"
            stroke="rgba(76,215,246,0.5)"
          />
        )
      })}
      <path d={path} fill="none" stroke="#d0bcff" strokeWidth="2.5" />
    </svg>
  )
}

export function RiemannIntegralVisualization({
  result,
  runtime,
}: VisualizationProps<RiemannIntegralParams, RiemannIntegralResult>) {
  const activeFrameIndex = Math.min(runtime.frameIndex, result.frames.length - 1)
  const activeFrame = result.frames[activeFrameIndex] ?? result.frames[0]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Dikdörtgenler sıklaşıyor' : 'Riemann yaklaşımı'}
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Yaklaşım</p>
            <p className="font-mono text-sm text-primary">{activeFrame.approximation.toFixed(4)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Hata</p>
            <p className="font-mono text-sm text-secondary">{activeFrame.error.toFixed(4)}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Eğri ve Dikdörtgenler
          </h4>
          <div className="flex-1 min-h-[260px]">{drawRectangles(600, 360, result, activeFrameIndex)}</div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Yakınsama Eğrisi
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={result.convergenceData}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="subdivisions" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} tickLine={false} />
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
                <ReferenceLine y={result.exactArea} stroke="#4cd7f6" strokeDasharray="4 2" />
                <Line dataKey="approximation" type="monotone" stroke="#d0bcff" strokeWidth={2.5} dot={false} />
                <Line dataKey="error" type="monotone" stroke="#ffb869" strokeWidth={1.8} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
