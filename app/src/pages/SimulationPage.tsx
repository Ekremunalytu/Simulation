import { Suspense, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Copy,
  Maximize2,
  Minimize2,
  PanelRight,
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
      ? 'Parametreler güncelleniyor'
      : syncState === 'synced'
        ? 'Değişiklikler senkron'
        : 'Hazır'

  const metaItems = [
    { label: 'Kategori', value: mod.category.toUpperCase(), tone: 'text-primary' },
    {
      label: 'Zorluk',
      value:
        mod.difficulty === 'beginner'
          ? 'Başlangıç'
          : mod.difficulty === 'intermediate'
            ? 'Orta'
            : 'İleri',
      tone: 'text-secondary',
    },
    {
      label: 'Durum',
      value: syncLabel,
      tone: syncState === 'updating' ? 'text-secondary' : 'text-on-surface',
    },
  ]

  return (
    <div className="p-8 max-w-[1640px] mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="surface-card rounded-[32px] border border-white/[0.06] px-8 py-8 md:px-10 md:py-9"
      >
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="eyebrow">Simülasyon Modülü</p>
              <span className="rounded-full bg-secondary/12 px-3 py-1.5 text-xs text-secondary">
                {selectedPresetName ?? 'Özel Senaryo'}
              </span>
              {timelineLabel ? (
                <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant">
                  {timelineLabel}
                </span>
              ) : null}
            </div>
            <div>
              <h1 className="font-headline text-3xl md:text-5xl font-bold tracking-tight">
                {mod.title}: {mod.subtitle}
              </h1>
              <p className="text-on-surface-variant max-w-2xl text-base md:text-lg leading-relaxed mt-4">
                {mod.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {metaItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl bg-surface-container-low px-4 py-3 border border-white/[0.05] min-w-32"
                >
                  <p className="eyebrow mb-1">{item.label}</p>
                  <p className={`font-medium text-sm ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start xl:items-end gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={copyLink}
                className="rounded-2xl bg-surface-container-low px-4 py-3 hover:bg-surface-container-high transition-colors text-on-surface flex items-center gap-2"
                title="Senaryo bağlantısını kopyala"
              >
                <Copy className="w-4 h-4" />
                <span className="text-sm">{copied ? 'Bağlantı kopyalandı' : 'Bağlantıyı kopyala'}</span>
              </button>

              <button
                onClick={() => setPanelOpen(!panelOpen)}
                className="rounded-2xl bg-surface-container-low px-4 py-3 hover:bg-surface-container-high transition-colors text-on-surface flex items-center gap-2"
                title={panelOpen ? 'Paneli gizle' : 'Paneli göster'}
              >
                {panelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                <span className="text-sm">{panelOpen ? 'Paneli gizle' : 'Paneli göster'}</span>
              </button>
            </div>

            <div className="rounded-2xl bg-surface-container-low px-4 py-3 border border-white/[0.05] max-w-sm">
              <p className="eyebrow mb-1">Senkron</p>
              <p className="text-sm text-on-surface-variant">
                {copied ? 'Aktif senaryo bağlantısı kopyalandı.' : 'Parametreler URL ile otomatik senkron kalır.'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-12 gap-8">
        <div
          className={`col-span-12 ${
            panelOpen ? 'lg:col-span-8' : 'lg:col-span-12'
          } space-y-6 transition-all duration-300`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="data-perimeter surface-card rounded-[32px] p-6 md:p-7 min-h-[540px] overflow-hidden border border-white/[0.06]"
          >
            <div className="flex justify-between items-start mb-5 gap-4 flex-wrap">
              <div className="space-y-2">
                <p className="eyebrow">Görsel Analiz</p>
                <div>
                  <h3 className="text-xl font-semibold">{mod.title} Görselleştirmesi</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    Birincil deney alanı burada. İkincil açıklamalar ve metrikler aşağıda sekmelerde yer alır.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {mod.runMode === 'timeline' ? (
                  <div className="text-sm text-on-surface-variant flex items-center gap-2 rounded-2xl bg-surface-container-low px-4 py-2.5 border border-white/[0.05]">
                    <PanelRight className="w-4 h-4 text-outline" />
                    {timelineLabel ?? `Adım ${playback.frameIndex + 1}`}
                  </div>
                ) : null}
                <button
                  onClick={() => setFullscreen((current) => !current)}
                  className="p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface"
                  title="Tam ekran"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

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

            <div className="h-[460px] md:h-[520px] relative bg-surface-container-lowest/70 rounded-[26px] border border-white/[0.05] overflow-hidden">
              <Suspense fallback={<VisualizationLoadingFallback />}>
                <mod.VisualizationComponent params={committedParams} result={result} runtime={runtime} />
              </Suspense>
            </div>
          </motion.div>

          <div className="space-y-5">
            <div className="flex items-center gap-2 rounded-2xl bg-surface-container-low p-1 border border-white/[0.05] w-fit">
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
                  className="grid grid-cols-1 xl:grid-cols-2 gap-6"
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
                  className="space-y-6"
                >
                  <ExplanationPanel learning={result.learning} />
                  <ExperimentsPanel experiments={result.experiments} />

                  {mod.codeExample ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="surface-card p-6 rounded-[24px] border border-white/[0.06]"
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
        </div>

        <AnimatePresence>
          {panelOpen ? (
            <motion.aside
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="col-span-12 lg:col-span-4"
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
          ) : null}
        </AnimatePresence>
      </div>

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

              <div className="w-full h-full bg-surface-container-lowest/70 rounded-[26px] border border-white/[0.05] overflow-hidden">
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
