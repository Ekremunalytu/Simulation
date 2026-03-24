import { useMemo } from 'react'
import type { VisualizationProps } from '../../types/simulation'
import type {
  BlockedRule,
  InferenceEvent,
  KnowledgeRepresentationParams,
  KnowledgeRepresentationResult,
  RepresentationLayer,
} from './logic'

function eventTone(type: InferenceEvent['type']) {
  if (type === 'goal-reached') {
    return 'text-secondary border-secondary/20 bg-secondary/10'
  }
  if (type === 'failure') {
    return 'text-tertiary border-tertiary/20 bg-tertiary/10'
  }
  if (type === 'rule-fired') {
    return 'text-primary border-primary/20 bg-primary/10'
  }

  return 'text-on-surface-variant border-white/5 bg-surface-container-low/60'
}

function nodeClasses(active: boolean, focus: boolean, layerId: RepresentationLayer['id']) {
  if (focus) {
    return 'border-primary/30 bg-primary/12 text-on-surface shadow-[0_0_16px_#d0bcff22]'
  }
  if (active && layerId === 'methods') {
    return 'border-secondary/30 bg-secondary/12 text-secondary'
  }
  if (active) {
    return 'border-primary/20 bg-surface-container text-on-surface'
  }

  return 'border-white/5 bg-surface-container-low/60 text-on-surface-variant'
}

function ruleClasses(state: 'fired' | 'candidate' | 'blocked' | 'inactive') {
  if (state === 'fired') {
    return 'border-primary/20 bg-primary/10'
  }
  if (state === 'candidate') {
    return 'border-secondary/20 bg-secondary/10'
  }
  if (state === 'blocked') {
    return 'border-tertiary/20 bg-tertiary/10'
  }

  return 'border-white/5 bg-surface-container-low/60'
}

function buildBlockedRuleMap(blockedRules: BlockedRule[]) {
  return new Map(blockedRules.map((rule) => [rule.ruleId, rule]))
}

export function KnowledgeRepresentationVisualization({
  result,
  runtime,
}: VisualizationProps<KnowledgeRepresentationParams, KnowledgeRepresentationResult>) {
  const activeIndex = Math.min(runtime.frameIndex, result.events.length - 1)
  const visibleEvents = result.events.slice(0, activeIndex + 1)
  const activeEvent = visibleEvents.at(-1) ?? result.events[0]
  const visibleFacts = new Set(activeEvent?.facts ?? result.initialFacts)
  const firedRuleIds = useMemo(
    () => new Set(visibleEvents.map((event) => event.ruleId).filter(Boolean)),
    [visibleEvents],
  )
  const blockedRuleMap = useMemo(
    () => buildBlockedRuleMap(result.blockedRules),
    [result.blockedRules],
  )

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#d0bcff]" />
          <span className="text-xs font-mono uppercase tracking-widest text-outline">
            {result.strategyLabel} · AI Method Selection
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
              {result.goalReached ? 'Kanıtlandı' : 'Eksik Kanıt'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-[1.18fr_0.82fr] gap-4 min-h-0">
        <div className="grid grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Knowledge Map
              </h4>
              <span className="text-xs font-mono text-outline">
                {visibleFacts.size} aktif düğüm
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 min-h-0 overflow-auto pr-1">
              {result.representationLayers.map((layer) => (
                <div
                  key={layer.id}
                  className="rounded-lg bg-surface-container-low/50 p-3 flex flex-col min-h-0"
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h5 className="text-xs font-mono uppercase tracking-wider text-outline">
                      {layer.title}
                    </h5>
                    <span className="text-[11px] font-mono text-outline">
                      {layer.nodes.filter((node) => visibleFacts.has(node.id)).length}/
                      {layer.nodes.length}
                    </span>
                  </div>
                  <div className="space-y-2 overflow-auto min-h-0">
                    {layer.nodes.map((node) => {
                      const active = visibleFacts.has(node.id)
                      const focus = activeEvent?.focus === node.id

                      return (
                        <div
                          key={node.id}
                          className={`rounded-lg border p-3 transition-colors ${nodeClasses(active, focus, layer.id)}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-semibold">{node.label}</p>
                            <span className="text-[11px] font-mono uppercase opacity-80">
                              {layer.id}
                            </span>
                          </div>
                          <p className="text-[11px] mt-1 opacity-80">{node.description}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Inference Timeline
              </h4>
              <span className="text-xs font-mono text-primary">{activeEvent?.focus}</span>
            </div>

            <div className="space-y-2 overflow-auto min-h-0 pr-1">
              {visibleEvents.map((event) => (
                <div
                  key={event.id}
                  className={`rounded-lg border p-3 ${eventTone(event.type)}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold">{event.message}</p>
                    <p className="text-xs font-mono uppercase">{event.type}</p>
                  </div>
                  <div className="flex items-center justify-between gap-3 mt-1 text-[11px] opacity-80">
                    <span>Odak: {event.focus}</span>
                    {event.ruleId ? <span>{event.ruleId}</span> : null}
                  </div>
                  {event.unmetFacts?.length ? (
                    <p className="text-[11px] mt-2 opacity-85">
                      Eksik: {event.unmetFacts.join(', ')}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-rows-[minmax(0,1fr)_minmax(0,0.95fr)] gap-4 min-h-0">
          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Rule Agenda
              </h4>
              <span className="text-xs font-mono text-secondary">
                {firedRuleIds.size} rule fired
              </span>
            </div>

            <div className="space-y-2 overflow-auto min-h-0 pr-1">
              {result.rules.map((rule) => {
                const unmetFacts = rule.conditions.filter((condition) => !visibleFacts.has(condition))
                const state = firedRuleIds.has(rule.id)
                  ? 'fired'
                  : unmetFacts.length === 0
                    ? 'candidate'
                    : blockedRuleMap.has(rule.id)
                      ? 'blocked'
                      : 'inactive'
                const blockedEntry = blockedRuleMap.get(rule.id)

                return (
                  <div
                    key={rule.id}
                    className={`rounded-lg border p-3 transition-colors ${ruleClasses(state)}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-on-surface">{rule.id}</p>
                      <p className="text-[11px] font-mono uppercase text-outline">{state}</p>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      IF {rule.conditions.join(' ∧ ')} THEN {rule.conclusion}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-2">{rule.explanation}</p>
                    {blockedEntry?.unmetFacts.length ? (
                      <p className="text-[11px] mt-2 text-tertiary">
                        Eksik öncüller: {blockedEntry.unmetFacts.join(', ')}
                      </p>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-surface-container-lowest/50 rounded-lg p-4 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono text-outline uppercase tracking-widest">
                Proof / Gap Panel
              </h4>
              <span className="text-xs font-mono text-tertiary">
                {result.goalReached ? `${result.proofChain.length} halka` : `${result.blockedRules.length} blokaj`}
              </span>
            </div>

            <div className="space-y-2 overflow-auto min-h-0 pr-1">
              {result.goalReached ? (
                result.proofChain.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="rounded-lg bg-surface-container-low/60 p-3"
                  >
                    <p className="text-xs text-on-surface">{item}</p>
                  </div>
                ))
              ) : (
                result.blockedRules.map((entry) => (
                  <div
                    key={`${entry.ruleId}-${entry.conclusion}`}
                    className="rounded-lg bg-tertiary/10 border border-tertiary/15 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold text-on-surface">{entry.ruleId}</p>
                      <p className="text-[11px] font-mono text-tertiary">{entry.conclusion}</p>
                    </div>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      {entry.explanation}
                    </p>
                    <p className="text-[11px] mt-2 text-tertiary">
                      Eksik: {entry.unmetFacts.join(', ')}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
