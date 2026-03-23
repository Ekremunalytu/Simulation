import { Suspense, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Copy,
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
        <p className="text-[10px] font-mono uppercase tracking-widest text-outline mb-2">
          Görselleştirme Yükleniyor
        </p>
        <div className="w-16 h-16 rounded-full border border-primary/20 border-t-primary animate-spin mx-auto" />
      </div>
    </div>
  )
}

function SimulationPageModule({ mod }: { mod: RegisteredSimulationModule }) {
  const [fullscreen, setFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)

  const {
    committedParams,
    committedQuery,
    dirty,
    draftParams,
    panelOpen,
    selectedPresetName,
    applyPreset,
    reset,
    runSimulation,
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

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">
              {mod.title}: {mod.subtitle}
            </h1>
            <span className="px-3 py-1 bg-secondary/10 border border-secondary/30 rounded-full text-[10px] text-secondary font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              {dirty ? 'Taslak Değişti' : 'Çalıştırıldı'}
            </span>
          </div>
          <p className="text-on-surface-variant max-w-2xl font-light">{mod.description}</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-1">Kategori</p>
              <p className="font-mono text-sm text-primary uppercase">{mod.category}</p>
            </div>
            <div className="text-right border-l border-outline-variant/30 pl-4">
              <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-1">Zorluk</p>
              <p className="font-mono text-sm text-secondary uppercase">
                {mod.difficulty === 'beginner'
                  ? 'başlangıç'
                  : mod.difficulty === 'intermediate'
                    ? 'orta'
                    : 'ileri'}
              </p>
            </div>
          </div>

          <button
            onClick={copyLink}
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface"
            title="Senaryo bağlantısını kopyala"
          >
            <Copy className="w-4 h-4" />
          </button>

          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface"
            title={panelOpen ? 'Paneli gizle' : 'Paneli göster'}
          >
            {panelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </motion.div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="text-[10px] font-mono uppercase tracking-widest text-outline">
          Aktif senaryo: {selectedPresetName ?? 'Özel'}
          {timelineLabel ? ` · ${timelineLabel}` : ''}
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-secondary">
          {copied ? 'Senaryo bağlantısı kopyalandı' : 'Çalıştırılan parametreler URL ile senkron'}
        </div>
      </div>

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
            className="data-perimeter bg-surface-container/60 rounded-2xl p-6 min-h-[500px] overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4 gap-4">
              <div>
                <h4 className="text-xs font-mono text-outline uppercase tracking-widest">Görsel Analiz</h4>
                <h3 className="text-sm font-semibold mt-1">{mod.title} Görselleştirmesi</h3>
              </div>
              <button
                onClick={() => setFullscreen((current) => !current)}
                className="p-2 rounded-lg bg-surface-container-lowest/50 hover:bg-surface-container-low transition-colors text-outline hover:text-on-surface"
                title="Tam ekran"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
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

            <div className="h-[440px] relative bg-surface-container-lowest/50 rounded-xl border border-outline-variant/5 overflow-hidden">
              <Suspense fallback={<VisualizationLoadingFallback />}>
                <mod.VisualizationComponent params={committedParams} result={result} runtime={runtime} />
              </Suspense>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <MetricsPanel metrics={result.metrics} />
            {mod.theory || mod.formulaTeX ? (
              <FormulaPanel
                formula={mod.formulaTeX}
                label={`${mod.title} güncelleme kuralı`}
                theory={mod.theory}
              />
            ) : null}
          </div>

          <ExplanationPanel learning={result.learning} />
          <ExperimentsPanel experiments={result.experiments} />

          {mod.codeExample ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-container p-6 rounded-xl border border-outline-variant/10"
            >
              <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">
                Kod Örneği
              </h4>
              <pre className="font-mono text-xs text-on-surface-variant overflow-x-auto leading-relaxed">
                <code>{mod.codeExample}</code>
              </pre>
            </motion.div>
          ) : null}
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
                dirty={dirty}
                selectedPresetName={selectedPresetName}
                onParamChange={setDraftParam}
                onRun={runSimulation}
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
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
              <div>
                <h4 className="text-xs font-mono text-outline uppercase tracking-widest">Görsel Analiz</h4>
                <h3 className="text-sm font-semibold mt-0.5">{mod.title} Görselleştirmesi</h3>
              </div>
              <button
                onClick={() => setFullscreen(false)}
                className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-outline hover:text-on-surface"
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

              <div className="w-full h-full bg-surface-container-lowest/50 rounded-xl border border-outline-variant/5 overflow-hidden">
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

  return <SimulationPageContent mod={mod} />
}
