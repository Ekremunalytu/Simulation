import type { VisualizationProps } from '../../types/simulation'
import type { VectorFieldsParams, VectorFieldsResult } from './logic'

export function VectorFieldsVisualization({
  result,
  runtime,
}: VisualizationProps<VectorFieldsParams, VectorFieldsResult>) {
  const scale = 48
  const offsetX = 220
  const offsetY = 180
  const activeFrame =
    result.currentVectorFrames[
      Math.min(runtime.frameIndex, result.currentVectorFrames.length - 1)
    ] ?? result.currentVectorFrames[0]
  const visibleStreamline = result.streamline.slice(
    0,
    Math.min(runtime.frameIndex + 2, result.streamline.length),
  )

  const streamlinePoints = visibleStreamline
    .map((point) => `${offsetX + point.x * scale},${offsetY - point.y * scale}`)
    .join(' ')

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-outline">
            yerel vektör alanı
          </span>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Aktif Nokta</p>
            <p className="font-mono text-sm text-primary">
              ({activeFrame.point.x.toFixed(2)}, {activeFrame.point.y.toFixed(2)})
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-outline uppercase">Vektör</p>
            <p className="font-mono text-sm text-secondary">
              ({activeFrame.vector.x.toFixed(2)}, {activeFrame.vector.y.toFixed(2)})
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container-lowest/50 rounded-lg p-4">
          <h4 className="text-[10px] font-mono text-outline uppercase tracking-widest mb-2">
            Alan Oku Deseni
          </h4>
          <svg viewBox="0 0 440 360" className="w-full h-[320px]">
            <rect width="440" height="360" fill="transparent" />
            {result.samples.map((sample, index) => {
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
                  stroke="rgba(208,188,255,0.8)"
                  strokeWidth="2"
                />
              )
            })}
            <polyline
              fill="none"
              stroke="#4cd7f6"
              strokeWidth="3"
              points={streamlinePoints}
            />
            <circle
              cx={offsetX + activeFrame.point.x * scale}
              cy={offsetY - activeFrame.point.y * scale}
              r="7"
              fill="#ffb869"
            />
          </svg>
        </div>

        <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col gap-4">
          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="text-[10px] uppercase tracking-widest text-outline mb-2">Akış Çizgisi</p>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Seçilen nokta alan içinde kısa Euler adımlarıyla ilerletiliyor. Playback ile her adımda akış çizgisinin nasıl örüldüğünü takip edebilirsin.
            </p>
          </div>
          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="text-[10px] uppercase tracking-widest text-outline mb-2">Sezgisel Okuma</p>
            <p className="text-sm leading-relaxed text-on-surface">
              Divergence alanın kaynak/sink karakterini, curl ise dönme eğilimini özetler. Okların yönü ile bu nicelikleri birlikte okumak gerekir.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
