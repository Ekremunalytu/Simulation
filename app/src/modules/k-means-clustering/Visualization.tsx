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
import type { KMeansClusteringParams, KMeansClusteringResult } from './logic'

const clusterColors = ['#d0bcff', '#4cd7f6', '#ffb869', '#98d7a5', '#f97cab']

export function KMeansClusteringVisualization({
  result,
  runtime,
}: VisualizationProps<KMeansClusteringParams, KMeansClusteringResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.snapshots.length - 1)
  const activeSnapshot = result.snapshots[activeIndex] ?? result.snapshots.at(-1)
  const visibleHistory = result.snapshots.slice(0, activeIndex + 1)
  const clusterCounts = useMemo(
    () =>
      activeSnapshot?.centroids.map((centroid) => ({
        cluster: centroid.cluster,
        count: activeSnapshot.points.filter((point) => point.cluster === centroid.cluster).length,
        x: centroid.x,
        y: centroid.y,
      })) ?? [],
    [activeSnapshot],
  )

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {activeSnapshot?.iteration ?? 0}. iterasyon
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Inertia</p>
            <p className="font-mono text-sm text-primary">
              {activeSnapshot?.inertia.toFixed(2) ?? '0.00'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Merkez Kayması</p>
            <p className="font-mono text-sm text-secondary">
              {activeSnapshot?.centroidShift.toFixed(3) ?? '0.000'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Küme</p>
            <p className="font-mono text-sm text-tertiary">
              {activeSnapshot?.centroids.length ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Küme Haritası
          </h4>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="x" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                <YAxis type="number" dataKey="y" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
                <ZAxis range={[40, 80]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(24, 24, 32, 0.92)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#e5e2e1',
                  }}
                />
                {activeSnapshot?.centroids.map((centroid) => (
                  <Scatter
                    key={`cluster-${centroid.cluster}`}
                    name={`Küme ${centroid.cluster + 1}`}
                    data={activeSnapshot.points.filter((point) => point.cluster === centroid.cluster)}
                    fill={clusterColors[centroid.cluster % clusterColors.length] as string}
                  />
                ))}
                <Scatter
                  name="Centroid"
                  data={activeSnapshot?.centroids ?? []}
                  fill="#ffffff"
                  shape={(props: { cx?: number; cy?: number }) => {
                    const cx = props.cx ?? 0
                    const cy = props.cy ?? 0
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={10} fill="#0f0f0f" stroke="#ffffff" strokeWidth={2} />
                        <path d={`M ${cx - 7} ${cy} L ${cx + 7} ${cy} M ${cx} ${cy - 7} L ${cx} ${cy + 7}`} stroke="#ffffff" strokeWidth={2} />
                      </g>
                    )
                  }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
              Yakınsama Eğrisi
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visibleHistory}>
                  <CartesianGrid stroke="#343242" strokeDasharray="3 3" />
                  <XAxis dataKey="iteration" stroke="#5a5567" tick={{ fontSize: 12, fill: '#b9b4c8' }} />
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
                  <Line type="monotone" dataKey="inertia" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="centroidShift" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Merkez Özeti
              </h4>
              <span className="text-xs font-mono text-primary">
                {clusterCounts.length} aktif merkez
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              {clusterCounts.map((item) => (
                <div key={item.cluster} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-on-surface">Küme {item.cluster + 1}</p>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: clusterColors[item.cluster % clusterColors.length] }}
                    />
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {item.count} nokta · merkez ({item.x.toFixed(2)}, {item.y.toFixed(2)})
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
