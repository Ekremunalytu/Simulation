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
  SVMMarginExplorerParams,
  SVMMarginExplorerResult,
} from './logic'
import { boundarySeries } from './boundary-series'

export function SVMMarginExplorerVisualization({
  params,
  result,
  runtime,
}: VisualizationProps<SVMMarginExplorerParams, SVMMarginExplorerResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.snapshots.length - 1)
  const activeSnapshot = result.snapshots[activeIndex] ?? result.snapshots.at(-1)
  const visibleHistory = result.snapshots.slice(0, activeIndex + 1)
  const supportVectors = activeSnapshot?.points.filter((point) => point.isSupportVector) ?? []
  const misclassified = activeSnapshot?.points.filter((point) => point.isMisclassified) ?? []
  const classA = activeSnapshot?.points.filter((point) => point.label === 0) ?? []
  const classB = activeSnapshot?.points.filter((point) => point.label === 1) ?? []
  const decisionLine = useMemo(
    () => (activeSnapshot ? boundarySeries(activeSnapshot, 0) : []),
    [activeSnapshot],
  )
  const upperMargin = useMemo(
    () => (activeSnapshot ? boundarySeries(activeSnapshot, 1) : []),
    [activeSnapshot],
  )
  const lowerMargin = useMemo(
    () => (activeSnapshot ? boundarySeries(activeSnapshot, -1) : []),
    [activeSnapshot],
  )

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {params.kernelMode === 'rbf-preview' ? 'RBF preview açık' : 'Linear SVM'} · epoch {activeSnapshot?.epoch ?? 0}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Doğruluk</p>
            <p className="font-mono text-sm text-primary">
              {activeSnapshot ? `${(activeSnapshot.accuracy * 100).toFixed(1)}%` : '0.0%'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Marjin</p>
            <p className="font-mono text-sm text-secondary">
              {activeSnapshot?.marginWidth.toFixed(2) ?? '0.00'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">SV</p>
            <p className="font-mono text-sm text-tertiary">
              {activeSnapshot?.supportVectorCount ?? 0}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">
              {params.kernelMode === 'rbf-preview' ? 'RBF' : 'Hinge'}
            </p>
            <p className="font-mono text-sm text-outline">
              {params.kernelMode === 'rbf-preview'
                ? `${(result.previewAccuracy * 100).toFixed(1)}%`
                : activeSnapshot?.hingeLoss.toFixed(2) ?? '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Maksimum Marjin Geometrisi
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                <YAxis type="number" dataKey="y" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                <ZAxis range={[42, 84]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(24, 24, 32, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e5e2e1',
                  }}
                />
                <Scatter name="Sınıf A" data={classA} fill="#d0bcff" />
                <Scatter name="Sınıf B" data={classB} fill="#4cd7f6" />
                <Scatter name="Karar Sınırı" data={decisionLine} line={{ stroke: '#ffffff', strokeWidth: 2.2 }} fill="#ffffff" />
                <Scatter name="Üst Marjin" data={upperMargin} line={{ stroke: '#ffffff66', strokeWidth: 1.4 }} fill="#ffffff66" />
                <Scatter name="Alt Marjin" data={lowerMargin} line={{ stroke: '#ffffff66', strokeWidth: 1.4 }} fill="#ffffff66" />
                <Scatter
                  name="Support Vector"
                  data={supportVectors}
                  fill="#ffb869"
                  shape={(props: { cx?: number; cy?: number }) => (
                    <circle cx={props.cx ?? 0} cy={props.cy ?? 0} r={7} fill="none" stroke="#ffb869" strokeWidth={2} />
                  )}
                />
                <Scatter
                  name="Hatalı"
                  data={misclassified}
                  fill="#f97cab"
                  shape={(props: { cx?: number; cy?: number }) => (
                    <rect x={(props.cx ?? 0) - 4} y={(props.cy ?? 0) - 4} width={8} height={8} fill="#f97cab" stroke="#111" strokeWidth={1.3} />
                  )}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,0.82fr)_minmax(0,1.18fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
              Eğitim Eğrileri
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visibleHistory}>
                  <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                  <XAxis dataKey="epoch" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                  <YAxis stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(24, 24, 32, 0.92)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e5e2e1',
                    }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="hingeLoss" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Support Vector Özeti
              </h4>
              <span className="text-xs font-mono text-primary">
                C={params.cValue.toFixed(2)}
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              {supportVectors.slice(0, 10).map((point) => (
                <div key={point.id} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-on-surface">
                      {point.label === 0 ? 'Sınıf A' : 'Sınıf B'} · {point.id}
                    </p>
                    <p className="text-xs font-mono text-outline">
                      margin {point.marginScore.toFixed(2)}
                    </p>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    ({point.x.toFixed(2)}, {point.y.toFixed(2)}) · score {point.score.toFixed(2)}
                  </p>
                </div>
              ))}
              {params.kernelMode === 'rbf-preview' ? (
                <div className="rounded-lg bg-secondary/10 p-3">
                  <p className="text-xs text-on-surface">
                    RBF preview lineer sınırı değiştirmiyor; yalnızca doğrusal olmayan ayrım sezgisini accuracy karşılaştırmasıyla görünür kılıyor.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
