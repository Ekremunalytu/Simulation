import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { VisualizationProps } from '../../types/simulation'
import type {
  BackpropSnapshot,
  BackpropagationNetworkParams,
  BackpropagationNetworkResult,
} from './logic'

function gridCellColor(probability: number) {
  if (probability >= 0.8) {
    return '#4cd7f6'
  }

  if (probability >= 0.6) {
    return '#4cd7f688'
  }

  if (probability >= 0.4) {
    return '#272727'
  }

  if (probability >= 0.2) {
    return '#d0bcff88'
  }

  return '#d0bcff'
}

function toSvgPoint(x: number, y: number) {
  return {
    x: 18 + ((x + 5) / 10) * 284,
    y: 302 - ((y + 5) / 10) * 284,
  }
}

function HiddenUnitCard({
  snapshot,
}: {
  snapshot: BackpropSnapshot
}) {
  return (
    <div className="space-y-2 overflow-auto">
      {snapshot.hiddenSummary.map((unit) => (
        <div key={unit.unit} className="rounded-lg bg-surface-container-low/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-on-surface">Gizli Birim {unit.unit}</p>
            <p className="text-xs font-mono text-outline">
              out {unit.outputWeight.toFixed(2)}
            </p>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            A aktivasyon {unit.classAActivation.toFixed(2)} · B aktivasyon {unit.classBActivation.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  )
}

export function BackpropagationNetworkVisualization({
  result,
  runtime,
}: VisualizationProps<BackpropagationNetworkParams, BackpropagationNetworkResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.snapshots.length - 1)
  const activeSnapshot = result.snapshots[activeIndex] ?? result.snapshots.at(-1)
  const visibleHistory = result.snapshots.slice(0, activeIndex + 1)

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            Epoch {activeSnapshot?.epoch ?? 0} · gizli katman {activeSnapshot?.hiddenSummary.length ?? 0} birim
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Doğruluk</p>
            <p className="font-mono text-sm text-primary">
              {activeSnapshot ? `${(activeSnapshot.accuracy * 100).toFixed(1)}%` : '0.0%'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Kayıp</p>
            <p className="font-mono text-sm text-secondary">
              {activeSnapshot?.loss.toFixed(3) ?? '0.000'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Yüzey</p>
            <p className="font-mono text-sm text-tertiary">P(y=1 | x)</p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Karar Yüzeyi
          </h4>
          <div className="flex-1">
            <svg viewBox="0 0 320 320" className="w-full h-full">
              <rect x="0" y="0" width="320" height="320" rx="16" fill="#0f0f0f" />
              {activeSnapshot?.surfaceGrid.map((cell, index) => {
                const point = toSvgPoint(cell.x, cell.y)
                return (
                  <rect
                    key={index}
                    x={point.x - 8}
                    y={point.y - 8}
                    width={16}
                    height={16}
                    fill={gridCellColor(cell.probability)}
                    opacity="0.32"
                  />
                )
              })}
              {result.data.map((point) => {
                const svgPoint = toSvgPoint(point.x, point.y)
                const predictedProbability =
                  activeSnapshot?.surfaceGrid.reduce((closest, cell) => {
                    const currentDistance = (cell.x - point.x) ** 2 + (cell.y - point.y) ** 2
                    const closestDistance = (closest.x - point.x) ** 2 + (closest.y - point.y) ** 2
                    return currentDistance < closestDistance ? cell : closest
                  })?.probability ?? 0.5
                const predictedLabel = predictedProbability >= 0.5 ? 1 : 0
                const misclassified = predictedLabel !== point.label

                return (
                  <g key={point.id}>
                    <circle
                      cx={svgPoint.x}
                      cy={svgPoint.y}
                      r={misclassified ? 6 : 5}
                      fill={point.label === 0 ? '#d0bcff' : '#4cd7f6'}
                      stroke={misclassified ? '#ffb869' : '#0f0f0f'}
                      strokeWidth={misclassified ? 2 : 1}
                    />
                  </g>
                )
              })}
              <rect x="18" y="18" width="284" height="284" fill="none" stroke="#ffffff22" strokeWidth="1.2" rx="8" />
            </svg>
          </div>
        </div>

        <div className="grid grid-rows-[0.82fr_1.18fr] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
              Kayıp ve Doğruluk
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
                  <Line type="monotone" dataKey="loss" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="accuracy" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Gizli Katman Aktivasyonları
              </h4>
              <span className="text-xs font-mono text-primary">
                {activeSnapshot?.hiddenSummary.length ?? 0} unit
              </span>
            </div>
            {activeSnapshot ? <HiddenUnitCard snapshot={activeSnapshot} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
