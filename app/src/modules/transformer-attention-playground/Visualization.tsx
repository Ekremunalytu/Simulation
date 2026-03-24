import type { CSSProperties } from 'react'
import type { VisualizationProps } from '../../types/simulation'
import type {
  ProjectionVector,
  TransformerAttentionPlaygroundParams,
  TransformerAttentionPlaygroundResult,
} from './logic'

function heatCell(weight: number, active: boolean): CSSProperties {
  const alpha = 0.08 + weight * 0.78

  return {
    backgroundColor: active ? `rgba(208, 188, 255, ${alpha})` : `rgba(76, 215, 246, ${alpha * 0.82})`,
    boxShadow: active ? 'inset 0 0 0 1px rgba(208, 188, 255, 0.35)' : undefined,
  }
}

function renderVector(label: string, vector: ProjectionVector) {
  return (
    <article className="rounded-[14px] bg-surface-container-low/70 border border-white/[0.04] p-3 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-mono uppercase tracking-widest text-outline">{label}</p>
        <span className="text-xs font-medium text-on-surface">{vector.token}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {vector.values.map((value, index) => (
          <div key={`${label}-${vector.token}-${index}`} className="rounded-xl bg-black/15 px-2 py-2">
            <p className="text-[10px] font-mono text-outline">d{index + 1}</p>
            <p className="text-sm font-mono text-on-surface mt-1">{value.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </article>
  )
}

export function TransformerAttentionPlaygroundVisualization({
  result,
  runtime,
}: VisualizationProps<
  TransformerAttentionPlaygroundParams,
  TransformerAttentionPlaygroundResult
>) {
  const activeIndex = Math.min(runtime.frameIndex, result.snapshots.length - 1)
  const activeSnapshot = result.snapshots[activeIndex] ?? result.snapshots.at(-1)
  const activeQuery = result.queryVectors[activeIndex]
  const activeKey = result.keyVectors[activeIndex]
  const activeValue = result.valueVectors[activeIndex]

  if (!activeSnapshot || !activeQuery || !activeKey || !activeValue) {
    return null
  }

  return (
    <div className="w-full h-full p-4 md:p-5 flex flex-col gap-4 overflow-auto">
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-mono uppercase tracking-[0.28em] text-outline">
            {result.scenarioLabel}
          </p>
          <h3 className="text-xl font-semibold text-on-surface">
            Aktif Query: {activeSnapshot.queryToken}
          </h3>
          <p className="text-sm text-on-surface-variant max-w-3xl leading-relaxed">
            {result.scenarioDescription}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 min-w-[320px]">
          <div className="rounded-[16px] bg-surface-container-low px-4 py-3">
            <p className="text-xs font-mono text-outline">Query Entropy</p>
            <p className="text-lg font-semibold text-secondary mt-2">{activeSnapshot.entropy.toFixed(2)}</p>
          </div>
          <div className="rounded-[16px] bg-surface-container-low px-4 py-3">
            <p className="text-xs font-mono text-outline">Top Weight</p>
            <p className="text-lg font-semibold text-primary mt-2">
              {((activeSnapshot.topContributors[0]?.weight ?? 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-[16px] bg-surface-container-low px-4 py-3">
            <p className="text-xs font-mono text-outline">Context d1</p>
            <p className="text-lg font-semibold text-tertiary mt-2">
              {(activeSnapshot.contextVector[0] ?? 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-4 min-h-0">
        <section className="rounded-[18px] bg-surface-container-lowest/65 border border-white/[0.04] p-4 space-y-3 overflow-auto">
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-xs font-mono uppercase tracking-widest text-outline">
              Attention Map
            </h4>
            <p className="text-xs font-mono text-outline">
              Satırlar query, sütunlar key tokenleridir
            </p>
          </div>

          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `minmax(130px, 160px) repeat(${result.tokens.length}, minmax(54px, 1fr))`,
            }}
          >
            <div />
            {result.tokens.map((token, index) => (
              <div
                key={`col-${token}-${index}`}
                className="text-[11px] font-mono text-outline text-center truncate"
              >
                {token}
              </div>
            ))}

            {result.snapshots.map((snapshot, rowIndex) => (
              <div key={`row-${snapshot.queryToken}-${rowIndex}`} className="contents">
                <div
                  className={`rounded-[14px] px-3 py-2 text-sm ${
                    rowIndex === activeIndex
                      ? 'bg-primary/12 text-primary'
                      : 'bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  {snapshot.queryToken}
                </div>
                {snapshot.attentionWeights.map((weight, columnIndex) => (
                  <div
                    key={`cell-${rowIndex}-${columnIndex}`}
                    style={heatCell(weight, rowIndex === activeIndex)}
                    className="rounded-[12px] h-12 flex items-center justify-center text-xs font-mono text-on-surface"
                  >
                    {(weight * 100).toFixed(0)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-rows-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-4 min-h-0">
          <article className="rounded-[18px] bg-surface-container-lowest/65 border border-white/[0.04] p-4 space-y-3 overflow-auto">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-xs font-mono uppercase tracking-widest text-outline">
                Active Query Breakdown
              </h4>
              <p className="text-xs font-mono text-primary">
                {runtime.frameIndex + 1} / {runtime.totalFrames}
              </p>
            </div>

            <div className="space-y-3">
              {activeSnapshot.topContributors.map((item) => (
                <div key={`${item.token}-${item.index}`} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-on-surface">
                      {item.index + 1}. {item.token}
                    </p>
                    <p className="text-xs font-mono text-secondary">
                      {(item.weight * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-low overflow-hidden">
                    <div
                      className="h-full rounded-full bg-secondary"
                      style={{ width: `${Math.max(item.weight * 100, 3)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-[14px] bg-surface-container-low px-3 py-3">
              <p className="text-xs font-mono text-outline">Ham Score Vektörü</p>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {activeSnapshot.rawScores.map((score, index) => (
                  <div key={`score-${index}`} className="rounded-xl bg-black/15 px-2 py-2">
                    <p className="text-[10px] font-mono text-outline">{result.tokens[index]}</p>
                    <p className="text-sm font-mono text-on-surface mt-1">{score.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <article className="rounded-[18px] bg-surface-container-lowest/65 border border-white/[0.04] p-4 space-y-3 overflow-auto">
            <h4 className="text-xs font-mono uppercase tracking-widest text-outline">
              Q / K / V Projections
            </h4>
            {renderVector('Q', activeQuery)}
            {renderVector('K', activeKey)}
            {renderVector('V', activeValue)}
          </article>
        </section>
      </div>
    </div>
  )
}
