import { Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { getModule } from '../engine/registry'
import { useSimulationParams } from '../hooks/useSimulationParams'
import { useSimulationPlayback } from '../hooks/useSimulationPlayback'
import { useSimulationNavigation } from '../hooks/useSimulationNavigation'
import { ControlPanel } from '../components/simulation/ControlPanel'
import { ExplanationPanel } from '../components/simulation/ExplanationPanel'
import { ExperimentsPanel } from '../components/simulation/ExperimentsPanel'
import { FormulaPanel } from '../components/simulation/FormulaPanel'
import { MetricsPanel } from '../components/simulation/MetricsPanel'
import { PlaybackControls } from '../components/simulation/PlaybackControls'
import { CheckpointPanel } from '../components/simulation/CheckpointPanel'
import { ChallengePanel } from '../components/simulation/ChallengePanel'
import { SimulationErrorBoundary } from '../components/simulation/SimulationErrorBoundary'
import { LearningPathPanel } from '../components/simulation/LearningPathPanel'
import { getModulesByIds } from '../engine/registry'
import type {
  RegisteredSimulationModule,
  SimulationResultBase,
  SimulationRuntime,
} from '../types/simulation'

const simulationResultCache = new Map<string, SimulationResultBase>()

function VisualizationLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="text-center">
        <p className="eyebrow mb-2">Görselleştirme Yükleniyor</p>
        <div className="mx-auto h-16 w-16 rounded-full border border-primary/20 border-t-primary animate-spin" />
      </div>
    </div>
  )
}

function SimulationPageModule({ mod }: { mod: RegisteredSimulationModule }) {
  const [fullscreen, setFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'learning'>('analysis')
  const { prev, next, currentIndex, total } = useSimulationNavigation(mod)

  const {
    committedParams,
    committedQuery,
    draftParams,
    panelOpen,
    selectedPresetName,
    syncState,
    applyPreset,
    reset,
    setDraftParam,
    setPanelOpen,
  } = useSimulationParams({
    moduleId: mod.id,
    defaults: mod.defaultParams,
    presets: mod.presets,
  })

  const result = useMemo(() => {
    const cacheKey = `${mod.id}?${committedQuery}`
    const cached = simulationResultCache.get(cacheKey)

    if (cached) {
      return cached
    }

    const nextResult = mod.derive(committedParams)
    simulationResultCache.set(cacheKey, nextResult)
    return nextResult
  }, [committedParams, committedQuery, mod])

  const timelineFrames = result.timeline?.frames.length ?? 1
  const playback = useSimulationPlayback({
    runMode: mod.runMode,
    totalFrames: timelineFrames,
    initialFrameIndex: result.timeline?.initialFrameIndex ?? 0,
    resetKey: `${mod.id}:${committedQuery}`,
  })

  const runtime: SimulationRuntime = useMemo(
    () => ({
      runMode: mod.runMode,
      frameIndex: playback.frameIndex,
      totalFrames: playback.totalFrames,
      isPlaying: playback.isPlaying,
      speed: playback.speed,
    }),
    [mod.runMode, playback.frameIndex, playback.isPlaying, playback.speed, playback.totalFrames],
  )

  useEffect(() => {
    if (!panelOpen && !fullscreen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      if (fullscreen) {
        setFullscreen(false)
        return
      }

      if (panelOpen) {
        setPanelOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [fullscreen, panelOpen, setPanelOpen])

  const timelineLabel =
    mod.runMode === 'timeline'
      ? result.timeline?.frames[Math.min(playback.frameIndex, timelineFrames - 1)]?.label
      : null

  const syncLabel =
    syncState === 'updating'
      ? 'Güncelleniyor'
      : syncState === 'synced'
        ? 'Hazır'
        : 'Hazır'

  const compactMeta = [
    selectedPresetName ?? 'Özel Senaryo',
    mod.category.toUpperCase(),
    mod.difficulty === 'beginner'
      ? 'Başlangıç'
      : mod.difficulty === 'intermediate'
        ? 'Orta'
        : 'İleri',
    syncLabel,
  ]

  const overlayMetrics = result.metrics.slice(0, 3)
  const prerequisiteModules = getModulesByIds(mod.prerequisiteModuleIds)
  const nextModules = getModulesByIds(mod.nextModuleIds)

  return (
    <div className="mx-auto max-w-[1580px] space-y-6 px-6 pb-10 pt-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start"
      >
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {compactMeta.map((item) => (
              <span
                key={item}
                className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="space-y-2">
            <h1 className="font-headline text-2xl font-semibold tracking-tight md:text-3xl">
              {mod.title}: {mod.subtitle}
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-on-surface-variant">
              {mod.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <div className="surface-panel flex items-center gap-1 rounded-2xl p-1">
            {prev ? (
              <Link
                to={`/sim/${prev.id}`}
                aria-label={`Önceki modül: ${prev.title}`}
                className="focus-ring rounded-xl p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              >
                <ChevronLeft aria-hidden="true" className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                aria-label="Önceki modül yok"
                disabled
                className="rounded-xl p-2 text-outline/30"
              >
                <ChevronLeft aria-hidden="true" className="w-4 h-4" />
              </button>
            )}
            <span className="rounded-xl bg-black/20 px-3 py-2 text-xs font-mono text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.12)]">
              {currentIndex + 1}/{total}
            </span>
            {next ? (
              <Link
                to={`/sim/${next.id}`}
                aria-label={`Sonraki modül: ${next.title}`}
                className="focus-ring rounded-xl p-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              >
                <ChevronRight aria-hidden="true" className="w-4 h-4" />
              </Link>
            ) : (
              <button
                type="button"
                aria-label="Sonraki modül yok"
                disabled
                className="rounded-xl p-2 text-outline/30"
              >
                <ChevronRight aria-hidden="true" className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setPanelOpen(!panelOpen)}
            aria-expanded={panelOpen}
            aria-controls="simulation-control-drawer"
            className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-surface-container-low px-4 py-2.5 text-sm text-on-surface shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high"
          >
            {panelOpen ? (
              <PanelRightClose aria-hidden="true" className="w-4 h-4" />
            ) : (
              <PanelRightOpen aria-hidden="true" className="w-4 h-4" />
            )}
            {panelOpen ? 'Kontrolleri Gizle' : 'Kontroller'}
          </button>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="surface-card overflow-hidden rounded-[28px]"
      >
        <div className="px-5 pb-4 pt-5 md:px-6">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
            <div className="space-y-2">
              <p className="eyebrow">Görsel Analiz</p>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{mod.title} Görselleştirmesi</h2>
                {timelineLabel ? (
                  <span className="rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
                    {timelineLabel}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {overlayMetrics.map((metric) => (
                <div key={metric.label} className="surface-panel min-w-28 rounded-[18px] px-3 py-2">
                  <p className="font-mono text-xs text-outline">{metric.label}</p>
                  <p className="mt-1 text-sm font-semibold text-on-surface">{metric.value}</p>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFullscreen((current) => !current)}
                aria-label="Tam ekranı aç"
                className="focus-ring rounded-[18px] bg-surface-container-low p-3 text-outline shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high hover:text-on-surface"
              >
                <Maximize2 aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <div className="tonal-rule mb-5 opacity-50" />

          <div className="space-y-4">
            {mod.runMode === 'timeline' ? (
              <PlaybackControls
                frameIndex={playback.frameIndex}
                totalFrames={playback.totalFrames}
                isPlaying={playback.isPlaying}
                speed={playback.speed}
                onPlay={playback.play}
                onPause={playback.pause}
                onStep={playback.step}
                onRestart={playback.restart}
                onSpeedChange={playback.setSpeed}
              />
            ) : null}

            <div className="overflow-hidden rounded-[22px] bg-surface-container-lowest px-2 py-2 shadow-[inset_0_0_0_1px_rgba(125,118,136,0.12)]">
              <div className="h-[480px] rounded-[18px] bg-[linear-gradient(180deg,rgba(10,10,11,0.92),rgba(7,7,8,0.98))] md:h-[620px]">
                <Suspense fallback={<VisualizationLoadingFallback />}>
                  <mod.VisualizationComponent params={committedParams} result={result} runtime={runtime} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <LearningPathPanel
        module={mod}
        prerequisites={prerequisiteModules}
        nextModules={nextModules}
      />

      <div className="space-y-4">
        <div aria-label="Simülasyon içeriği sekmeleri" className="surface-panel flex w-fit items-center gap-2 rounded-2xl p-1">
          <button
            type="button"
            aria-pressed={activeTab === 'analysis'}
            onClick={() => setActiveTab('analysis')}
            className={`focus-ring rounded-xl px-4 py-2 text-sm transition-[background-color,color] duration-200 ${
              activeTab === 'analysis'
                ? 'bg-surface-container-high text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Analiz
          </button>
          <button
            type="button"
            aria-pressed={activeTab === 'learning'}
            onClick={() => setActiveTab('learning')}
            className={`focus-ring rounded-xl px-4 py-2 text-sm transition-[background-color,color] duration-200 ${
              activeTab === 'learning'
                ? 'bg-surface-container-high text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Öğrenme
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'analysis' ? (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="grid grid-cols-1 gap-5 xl:grid-cols-2"
            >
              <MetricsPanel metrics={result.metrics} />
              {mod.theory || mod.formulaTeX ? (
                <FormulaPanel
                  formula={mod.formulaTeX}
                  label={`${mod.title} güncelleme kuralı`}
                  theory={mod.theory}
                />
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="learning"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="space-y-5"
            >
              <ExplanationPanel learning={result.learning} />
              <ExperimentsPanel experiments={result.experiments} />
              {mod.checkpointQuestions?.length ? (
                <CheckpointPanel key={`${mod.id}-checkpoint`} questions={mod.checkpointQuestions} />
              ) : null}
              {mod.challengeScenarios?.length ? (
                <ChallengePanel challenges={mod.challengeScenarios} />
              ) : null}
              {mod.codeExample ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface-card rounded-[20px] p-5"
                >
                  <h4 className="eyebrow mb-4">Kod Örneği</h4>
                  <pre className="overflow-x-auto font-mono text-sm leading-relaxed text-on-surface-variant">
                    <code>{mod.codeExample}</code>
                  </pre>
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {panelOpen ? (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-[2px]"
              aria-label="Kontrolleri kapat"
            />
            <motion.aside
              id="simulation-control-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Simülasyon kontrolleri"
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.22 }}
              className="fixed right-4 top-[88px] bottom-4 z-[75] w-[380px] max-w-[calc(100vw-2rem)] overscroll-contain"
            >
              <ControlPanel
                controls={mod.controlSchema}
                params={draftParams}
                presets={mod.presets}
                syncState={syncState}
                selectedPresetName={selectedPresetName}
                onParamChange={setDraftParam}
                onReset={reset}
                onApplyPreset={applyPreset}
              />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {fullscreen ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="simulation-fullscreen-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[80] flex flex-col overflow-hidden bg-surface/95 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setFullscreen(false)
              }
            }}
          >
            <div className="shrink-0 flex items-center justify-between px-6 py-4">
              <div>
                <h4 className="eyebrow">Görsel Analiz</h4>
                <h3 id="simulation-fullscreen-title" className="mt-0.5 text-base font-semibold">
                  {mod.title} Görselleştirmesi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setFullscreen(false)}
                aria-label="Tam ekrandan çık"
                className="focus-ring rounded-2xl bg-surface-container p-3 text-outline shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high hover:text-on-surface"
              >
                <Minimize2 aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 min-w-0 overflow-x-hidden px-6 pb-6">
              <div className="tonal-rule mb-5 opacity-50" />
              {mod.runMode === 'timeline' ? (
                <div className="mb-4">
                  <PlaybackControls
                    frameIndex={playback.frameIndex}
                    totalFrames={playback.totalFrames}
                    isPlaying={playback.isPlaying}
                    speed={playback.speed}
                    onPlay={playback.play}
                    onPause={playback.pause}
                    onStep={playback.step}
                    onRestart={playback.restart}
                    onSpeedChange={playback.setSpeed}
                  />
                </div>
              ) : null}

              <div className="h-full min-w-0 overflow-hidden rounded-[22px] bg-surface-container-lowest px-2 py-2 shadow-[inset_0_0_0_1px_rgba(125,118,136,0.12)]">
                <div className="h-full min-w-0 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,rgba(10,10,11,0.92),rgba(7,7,8,0.98))]">
                  <Suspense fallback={<VisualizationLoadingFallback />}>
                    <mod.VisualizationComponent params={committedParams} result={result} runtime={runtime} />
                  </Suspense>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function SimulationPageContent({ mod }: { mod: RegisteredSimulationModule }) {
  return (
    <SimulationErrorBoundary moduleTitle={mod.title} resetKey={mod.id}>
      <SimulationPageModule mod={mod} />
    </SimulationErrorBoundary>
  )
}

export function SimulationPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const mod = getModule(moduleId ?? '')

  if (!mod) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="font-mono text-sm text-outline">Modül bulunamadı: {moduleId}</p>
      </div>
    )
  }

  return <SimulationPageContent key={moduleId} mod={mod} />
}
