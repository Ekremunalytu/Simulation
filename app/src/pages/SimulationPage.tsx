import { Suspense, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react'
import { getModule } from '../engine/registry'
import { useSimulationParams } from '../hooks/useSimulationParams'
import { useSimulationPlayback } from '../hooks/useSimulationPlayback'
import { ControlPanel } from '../components/simulation/ControlPanel'
import { ExplanationPanel } from '../components/simulation/ExplanationPanel'
import { ExperimentsPanel } from '../components/simulation/ExperimentsPanel'
import { FormulaPanel } from '../components/simulation/FormulaPanel'
import { MetricsPanel } from '../components/simulation/MetricsPanel'
import { PlaybackControls } from '../components/simulation/PlaybackControls'
import { SimulationErrorBoundary } from '../components/simulation/SimulationErrorBoundary'
import type {
  RegisteredSimulationModule,
  SimulationResultBase,
  SimulationRuntime,
} from '../types/simulation'

const simulationResultCache = new Map<string, SimulationResultBase>()

function VisualizationLoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <p className="eyebrow mb-2">Görselleştirme Yükleniyor</p>
        <div className="w-16 h-16 rounded-full border border-primary/20 border-t-primary animate-spin mx-auto" />
      </div>
    </div>
  )
}

function SimulationPageModule({ mod }: { mod: RegisteredSimulationModule }) {
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'learning'>('analysis')

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
    if (!copied) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false)
    }, 1600)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [copied])

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${committedQuery}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
  }

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

  return (
    <div className="p-6 md:p-8 max-w-[1580px] mx-auto space-y-5">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-start justify-between gap-4"
      >
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {compactMeta.map((item) => (
              <span
                key={item}
                className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant border border-white/[0.04]"
              >
                {item}
              </span>
            ))}
          </div>
          <div>
            <h1 className="font-headline text-2xl md:text-3xl font-semibold tracking-tight">
              {mod.title}: {mod.subtitle}
            </h1>
            <p className="text-sm text-on-surface-variant max-w-3xl mt-2 leading-relaxed">
              {mod.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="rounded-2xl bg-surface-container-low px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
          >
            {copied ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}
          </button>
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="rounded-2xl bg-surface-container-low px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-high transition-colors inline-flex items-center gap-2"
          >
            {panelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            {panelOpen ? 'Kontrolleri Gizle' : 'Kontroller'}
          </button>
        </div>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="surface-card rounded-[18px] border border-white/[0.05] overflow-hidden"
      >
        <div className="px-5 md:px-6 pt-5 pb-4 border-b border-white/[0.04]">
          <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="eyebrow">Görsel Analiz</p>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold">{mod.title} Görselleştirmesi</h2>
                {timelineLabel ? (
                  <span className="rounded-full bg-surface-container px-3 py-1 text-xs text-on-surface-variant">
                    {timelineLabel}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {overlayMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl bg-black/30 px-3 py-2 border border-white/[0.04] min-w-24"
                >
                  <p className="font-mono text-xs text-outline">{metric.label}</p>
                  <p className="text-sm font-semibold text-on-surface mt-1">{metric.value}</p>
                </div>
              ))}
              <button
                onClick={() => setFullscreen((current) => !current)}
                className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface"
                title="Tam ekran"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6 space-y-4">
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

          <div className="h-[480px] md:h-[620px] bg-surface-container-lowest rounded-[16px] overflow-hidden">
            <Suspense fallback={<VisualizationLoadingFallback />}>
              <mod.VisualizationComponent params={committedParams} result={result} runtime={runtime} />
            </Suspense>
          </div>
        </div>
      </motion.section>

      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-2xl bg-surface-container-low p-1 border border-white/[0.04] w-fit">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
              activeTab === 'analysis'
                ? 'bg-surface-container-high text-on-surface'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Analiz
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-4 py-2 rounded-xl text-sm transition-colors ${
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
              className="grid grid-cols-1 xl:grid-cols-2 gap-5"
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
              {mod.codeExample ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="surface-card p-5 rounded-[16px] border border-white/[0.05]"
                >
                  <h4 className="eyebrow mb-4">Kod Örneği</h4>
                  <pre className="font-mono text-sm text-on-surface-variant overflow-x-auto leading-relaxed">
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
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-40"
              aria-label="Kontrolleri kapat"
            />
            <motion.aside
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 28 }}
              transition={{ duration: 0.22 }}
              className="fixed z-50 top-[72px] right-4 bottom-4 w-[380px] max-w-[calc(100vw-2rem)]"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 bg-surface/95 backdrop-blur-sm flex flex-col"
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setFullscreen(false)
              }
            }}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div>
                <h4 className="eyebrow">Görsel Analiz</h4>
                <h3 className="text-base font-semibold mt-0.5">{mod.title} Görselleştirmesi</h3>
              </div>
              <button
                onClick={() => setFullscreen(false)}
                className="p-3 rounded-2xl bg-surface-container hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface"
                title="Tam ekrandan cik"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-6 min-h-0">
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

              <div className="w-full h-full bg-surface-container-lowest rounded-[16px] overflow-hidden">
                <Suspense fallback={<VisualizationLoadingFallback />}>
                  <mod.VisualizationComponent params={committedParams} result={result} runtime={runtime} />
                </Suspense>
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
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-outline font-mono text-sm">Modül bulunamadı: {moduleId}</p>
      </div>
    )
  }

  return <SimulationPageContent key={moduleId} mod={mod} />
}
