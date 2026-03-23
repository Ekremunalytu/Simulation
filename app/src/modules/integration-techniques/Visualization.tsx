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
  IntegrationTechniquesParams,
  IntegrationTechniquesResult,
} from './logic'

export function IntegrationTechniquesVisualization({
  result,
  runtime,
}: VisualizationProps<IntegrationTechniquesParams, IntegrationTechniquesResult>) {
  const activeFrame =
    result.frames[Math.min(runtime.frameIndex, result.frames.length - 1)] ?? result.frames[0]
  const chartData = result.originalCurve.map((point, index) => ({
    x: point.x,
    original: point.y,
    helper: result.helperCurve[index]?.y ?? null,
  }))

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#4cd7f6]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            Teknik çözüm akışı
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs font-mono text-outline uppercase">Aktif adım</p>
          <p className="font-mono text-sm text-primary">{activeFrame.title}</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Orijinal ve Yardımcı Yapı
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis dataKey="x" type="number" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <YAxis stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'rgba(24, 24, 32, 0.92)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', fontSize: '12px', color: '#e5e2e1' }}
                />
                <Line dataKey="original" type="monotone" stroke="#d0bcff" strokeWidth={2.4} dot={false} connectNulls={false} />
                <Line dataKey="helper" type="monotone" stroke="#4cd7f6" strokeWidth={2.1} dot={false} connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-3">
              Adım Kartı
            </h4>
            <div className="rounded-2xl bg-surface-container-low p-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-outline mb-2">
                  {activeFrame.step}. adım
                </p>
                <h3 className="text-lg font-semibold text-on-surface">{activeFrame.title}</h3>
              </div>
              <code className="font-mono text-base text-primary block">{activeFrame.expression}</code>
              <p className="text-sm leading-relaxed text-on-surface-variant">{activeFrame.explanation}</p>
            </div>
          </div>
          <div className="rounded-xl border border-outline-variant/10 bg-surface-container-low p-4">
            <p className="text-xs uppercase tracking-widest text-outline mb-2">Son antitürev</p>
            <p className="font-mono text-secondary">{result.finalAntiderivative}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
