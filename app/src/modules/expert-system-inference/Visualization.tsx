import { useMemo } from 'react'
import type { VisualizationProps } from '../../types/simulation'
import type {
  ExpertSystemInferenceParams,
  ExpertSystemInferenceResult,
} from './logic'

function eventTone(type: string) {
  if (type === 'goal') {
    return 'text-secondary border-secondary/20 bg-secondary/10'
  }
  if (type === 'failure') {
    return 'text-tertiary border-tertiary/20 bg-tertiary/10'
  }
  if (type === 'rule') {
    return 'text-primary border-primary/20 bg-primary/10'
  }

  return 'text-on-surface-variant border-white/5 bg-surface-container-low/60'
}

export function ExpertSystemInferenceVisualization({
  result,
  runtime,
}: VisualizationProps<ExpertSystemInferenceParams, ExpertSystemInferenceResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.events.length - 1)
  const visibleEvents = result.events.slice(0, activeIndex + 1)
  const activeEvent = visibleEvents.at(-1) ?? result.events[0]
  const firedRuleIds = useMemo(
    () => new Set(visibleEvents.map((event) => event.ruleId).filter(Boolean)),
    [visibleEvents],
  )
  const visibleFacts = activeEvent?.facts ?? result.initialFacts

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {result.strategyLabel} · {result.scenarioTitle}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Hedef</p>
            <p className="font-mono text-sm text-primary">{result.activeGoal}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Görünür Adım</p>
            <p className="font-mono text-sm text-secondary">{activeIndex + 1}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono text-outline uppercase">Durum</p>
            <p className="font-mono text-sm text-tertiary">
              {result.targetReached ? 'Kanıtlandı' : 'Belirsiz'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4 min-h-0">
        <div className="grid grid-rows-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Kural Motoru
              </h4>
              <span className="text-xs font-mono text-outline">
                {firedRuleIds.size} kural aktive oldu
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              {result.rules.map((rule) => {
                const active = firedRuleIds.has(rule.id)
                return (
                  <div
                    key={rule.id}
                    className={`rounded-lg p-3 border transition-colors ${
                      active
                        ? 'border-primary/20 bg-primary/10'
                        : 'border-white/5 bg-surface-container-low/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-on-surface">{rule.id}</p>
                      <p className="text-xs font-mono text-outline">{rule.conclusion}</p>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      IF {rule.conditions.join(' ∧ ')} THEN {rule.conclusion}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Olay Akışı
              </h4>
              <span className="text-xs font-mono text-primary">{activeEvent?.focus}</span>
            </div>
            <div className="space-y-2 overflow-auto">
              {visibleEvents.map((event) => (
                <div
                  key={event.id}
                  className={`rounded-lg border p-3 ${eventTone(event.type)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold">{event.message}</p>
                    <p className="text-xs font-mono uppercase">{event.type}</p>
                  </div>
                  <p className="text-[11px] mt-1 opacity-80">Odak: {event.focus}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Bilinen Gerçekler
              </h4>
              <span className="text-xs font-mono text-secondary">
                {visibleFacts.length} gerçek
              </span>
            </div>
            <div className="flex flex-wrap gap-2 overflow-auto">
              {visibleFacts.map((fact) => (
                <span
                  key={fact}
                  className="rounded-full px-3 py-1 text-xs font-mono bg-surface-container-low text-on-surface-variant"
                >
                  {fact}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Kanıt Zinciri
              </h4>
              <span className="text-xs font-mono text-tertiary">
                {result.proofChain.length} halka
              </span>
            </div>
            <div className="space-y-2 overflow-auto">
              {result.proofChain.length > 0 ? (
                result.proofChain.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-lg bg-surface-container-low/60 p-3"
                  >
                    <p className="text-xs text-on-surface">{item}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-lg bg-surface-container-low/60 p-3">
                  <p className="text-xs text-on-surface-variant">
                    Seçili hedef için görünür bir kanıt zinciri oluşmadı.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
