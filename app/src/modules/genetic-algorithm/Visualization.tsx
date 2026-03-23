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
import type { GeneticAlgorithmParams, GeneticAlgorithmResult } from './logic'

export function GeneticAlgorithmVisualization({
  result,
  runtime,
}: VisualizationProps<GeneticAlgorithmParams, GeneticAlgorithmResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.generationsData.length - 1)
  const activeGeneration = result.generationsData[activeIndex] ?? result.generationsData.at(-1)
  const visibleGenerations = result.generationsData.slice(0, activeIndex + 1)
  const routePoints = (activeGeneration?.bestRoute ?? []).map(
    (cityIndex) => result.cities[cityIndex],
  )
  const closedRoute = routePoints.length > 0 ? [...routePoints, routePoints[0]] : []

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            {runtime.isPlaying ? 'Evrim tekrar oynatma' : 'Popülasyon anlık görünümü'}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Nesil</p>
            <p className="font-mono text-sm text-primary">{activeGeneration?.generation ?? 0}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">En İyi Mesafe</p>
            <p className="font-mono text-sm text-secondary">{activeGeneration?.bestDistance.toFixed(1) ?? '0.0'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Çeşitlilik</p>
            <p className="font-mono text-sm text-tertiary">
              {activeGeneration ? `${(activeGeneration.diversity * 100).toFixed(1)}%` : '0.0%'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-4 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
              En İyi Rota Haritası
            </h4>
            <p className="text-[10px] font-mono text-outline">
              {result.convergenceGeneration}. nesilde yakınsadı
            </p>
          </div>

          <div className="flex-1">
            <svg viewBox="0 0 320 320" className="w-full h-full">
              <defs>
                <linearGradient id="gaRoute" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d0bcff" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#4cd7f6" stopOpacity={0.95} />
                </linearGradient>
              </defs>

              {closedRoute.length > 1 ? (
                <polyline
                  points={closedRoute.map((city) => `${city?.x ?? 0},${city?.y ?? 0}`).join(' ')}
                  fill="none"
                  stroke="url(#gaRoute)"
                  strokeWidth="4"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              ) : null}

              {result.cities.map((city, index) => (
                <g key={city.id}>
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={index === activeGeneration?.bestRoute[0] ? 9 : 7}
                    fill={index === activeGeneration?.bestRoute[0] ? '#ffb869' : '#1e1e1e'}
                    stroke={index === activeGeneration?.bestRoute[0] ? '#ffb869' : '#4cd7f6'}
                    strokeWidth="2"
                  />
                  <text
                    x={city.x}
                    y={city.y + 3}
                    textAnchor="middle"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fill={index === activeGeneration?.bestRoute[0] ? '#111' : '#dbd8d7'}
                  >
                    {city.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="grid grid-rows-[1fr_0.85fr] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
              Evrim Eğrileri
            </h4>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={visibleGenerations}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="generation"
                    stroke="#555"
                    tick={{ fontSize: 10, fill: '#b0a8bc' }}
                    tickLine={false}
                  />
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
                  <Line type="monotone" dataKey="bestDistance" stroke="#4cd7f6" strokeWidth={2.2} dot={false} />
                  <Line type="monotone" dataKey="averageDistance" stroke="#d0bcff" strokeWidth={2.2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest">
                Çeşitlilik Notları
              </h4>
              <span className="text-[10px] font-mono text-primary">
                Fitness {(1 / (activeGeneration?.averageDistance ?? 1)).toFixed(5)}
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              {visibleGenerations.slice(-8).map((snapshot) => (
                <div key={snapshot.generation} className="rounded-lg bg-surface-container-low/60 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-on-surface">Nesil {snapshot.generation}</p>
                    <p className="text-[10px] font-mono text-outline">
                      div {(snapshot.diversity * 100).toFixed(1)}%
                    </p>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">
                    En iyi {snapshot.bestDistance.toFixed(1)} · Ort {snapshot.averageDistance.toFixed(1)}
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
