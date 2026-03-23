import type { VisualizationProps } from '../../types/simulation'
import type { ChangeOfVariablesParams, ChangeOfVariablesResult } from './logic'

function contributionOpacity(value: number, max: number): string {
  const ratio = value / (max || 1)
  return (0.16 + ratio * 0.68).toFixed(3)
}

export function ChangeOfVariablesVisualization({
  result,
  runtime,
}: VisualizationProps<ChangeOfVariablesParams, ChangeOfVariablesResult>) {
  const visibleCells = result.cells.slice(
    0,
    Math.min(runtime.frameIndex + 1, result.cells.length),
  )
  const maxContribution = Math.max(...result.cells.map((cell) => cell.contribution))
  const activeCell = visibleCells.at(-1) ?? result.cells[0]

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            jacobian ile alan elemanı
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Aktif Jacobian</p>
            <p className="font-mono text-sm text-primary">{activeCell.jacobian.toFixed(3)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Kümülatif</p>
            <p className="font-mono text-sm text-secondary">{activeCell.cumulative.toFixed(3)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Kartezyen Düzlemde Hücre Merkezleri
          </h4>
          <div className="flex-1 min-h-[260px]">
            <svg viewBox="0 0 420 320" className="w-full h-full">
              {visibleCells.map((cell) => (
                <circle
                  key={cell.step}
                  cx={210 + cell.x * 68}
                  cy={160 - cell.y * 68}
                  r="9"
                  fill={`rgba(208,188,255,${contributionOpacity(cell.contribution, maxContribution)})`}
                  stroke="#4cd7f6"
                  strokeOpacity="0.18"
                />
              ))}
            </svg>
          </div>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col">
          <h4 className="text-xs font-mono text-outline uppercase tracking-widest mb-2">
            Polar Düzlemde Aynı Hücreler
          </h4>
          <div className="flex-1 min-h-[260px]">
            <svg viewBox="0 0 420 320" className="w-full h-full">
              {visibleCells.map((cell) => (
                <rect
                  key={cell.step}
                  x={40 + (cell.thetaMid / (2 * Math.PI)) * 320 - 9}
                  y={280 - (cell.rMid / 2) * 220 - 9}
                  width="18"
                  height="18"
                  fill={`rgba(76,215,246,${contributionOpacity(cell.contribution, maxContribution)})`}
                  stroke="#d0bcff"
                  strokeOpacity="0.18"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
