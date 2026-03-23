import { useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type {
  PerceptronEpochSnapshot,
  PerceptronTrainerParams,
  PerceptronTrainerResult,
} from './logic'

function boundaryPoints(snapshot: PerceptronEpochSnapshot) {
  if (Math.abs(snapshot.w2) < 0.0001) {
    return [
      { x: -6, y: 0 },
      { x: 6, y: 0 },
    ]
  }

  return [-6, 6].map((x) => ({
    x,
    y: (-snapshot.bias - snapshot.w1 * x) / snapshot.w2,
  }))
}

export function PerceptronTrainerVisualization({
  result,
  runtime,
}: VisualizationProps<PerceptronTrainerParams, PerceptronTrainerResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.snapshots.length - 1)
  const activeSnapshot = result.snapshots[activeIndex] ?? result.snapshots.at(-1)
  const visibleHistory = result.snapshots.slice(0, activeIndex + 1)
  const misclassified = activeSnapshot?.predictions.filter((point) => !point.correct) ?? []
  const classA = result.data.filter((point) => point.label === 0)
  const classB = result.data.filter((point) => point.label === 1)
  const lineData = useMemo(
    () => (activeSnapshot ? boundaryPoints(activeSnapshot) : []),
    [activeSnapshot],
  )

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            Epoch {activeSnapshot?.epoch ?? 0}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Doğruluk</p>
            <p className="font-mono text-sm text-primary">
              {activeSnapshot ? `${(activeSnapshot.accuracy * 100).toFixed(1)}%` : '0.0%'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Hata</p>
            <p className="font-mono text-sm text-secondary">
              {activeSnapshot?.mistakes ?? 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Bias</p>
            <p className="font-mono text-sm text-tertiary">
              {activeSnapshot?.bias.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Karar Sınırı
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} />
                <YAxis type="number" dataKey="y" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} />
                <ZAxis range={[40, 85]} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a1a',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#e5e2e1',
                  }}
                />
                <Scatter name="Sınıf A" data={classA} fill="#d0bcff" />
                <Scatter name="Sınıf B" data={classB} fill="#4cd7f6" />
                <Scatter
                  name="Hatalı"
                  data={misclassified}
                  fill="#ffb869"
                  shape={(props: { cx?: number; cy?: number }) => (
                    <rect x={(props.cx ?? 0) - 5} y={(props.cy ?? 0) - 5} width={10} height={10} fill="#ffb869" stroke="#111" strokeWidth={1.5} />
                  )}
                />
                <Scatter
                  name="Boundary"
                  data={lineData}
                  line={{ stroke: '#ffffff', strokeWidth: 2 }}
                  fill="#ffffff"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-rows-[0.85fr_1.15fr] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
              Eğitim Eğrisi
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visibleHistory}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} />
                  <YAxis stroke="#555" tick={{ fontSize: 10, fill: '#b0a8bc' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a1a',
                      border: '1px solid #555',
                      borderRadius: '8px',
                      fontSize: '11px',
                      color: '#e5e2e1',
                    }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="mistakes" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
                Ağırlıklar
              </h4>
              <span className="text-[10px] font-mono text-primary">
                w=({activeSnapshot?.w1.toFixed(2) ?? '0.00'}, {activeSnapshot?.w2.toFixed(2) ?? '0.00'})
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              {visibleHistory.slice(-8).map((snapshot) => (
                <div key={snapshot.epoch} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-on-surface">Epoch {snapshot.epoch}</p>
                    <p className="text-[10px] font-mono text-outline">
                      err {snapshot.mistakes}
                    </p>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    acc {(snapshot.accuracy * 100).toFixed(1)}% · bias {snapshot.bias.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
