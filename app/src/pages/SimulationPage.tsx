import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getModule } from '../engine/registry'
import { useSimulationParams } from '../hooks/useSimulationParams'
import { ControlPanel } from '../components/simulation/ControlPanel'
import { ExplanationPanel } from '../components/simulation/ExplanationPanel'
import { FormulaPanel } from '../components/simulation/FormulaPanel'

export function SimulationPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  const mod = getModule(moduleId || '')

  if (!mod) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <p className="text-outline font-mono text-sm">Module not found: {moduleId}</p>
      </div>
    )
  }

  const { params, setParam, reset, applyPreset } = useSimulationParams(mod.defaultParams)
  const explanation = mod.explanationGenerator(params)

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8">
      {/* Page Header */}
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
              Active
            </span>
          </div>
          <p className="text-on-surface-variant max-w-2xl font-light">{mod.description}</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-1">Category</p>
            <p className="font-mono text-sm text-primary uppercase">{mod.category}</p>
          </div>
          <div className="text-right border-l border-outline-variant/30 pl-4">
            <p className="text-[10px] text-outline uppercase tracking-[0.2em] mb-1">Difficulty</p>
            <p className="font-mono text-sm text-secondary uppercase">{mod.difficulty}</p>
          </div>
        </div>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Visualization */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="data-perimeter bg-surface-container/60 rounded-2xl p-6 min-h-[500px] overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-xs font-mono text-outline uppercase tracking-widest">Visual Analysis</h4>
                <h3 className="text-sm font-semibold mt-1">{mod.title} Visualization</h3>
              </div>
            </div>
            <div className="h-[440px] relative bg-surface-container-lowest/50 rounded-xl border border-outline-variant/5 overflow-hidden">
              <mod.VisualizationComponent params={params} onParamChange={setParam} />
            </div>
          </motion.div>

          {/* Lower Info Panels */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ExplanationPanel text={explanation} />
            {mod.formulaTeX && (
              <FormulaPanel formula={mod.formulaTeX} label={`${mod.title} Update Rule`} />
            )}
          </div>

          {/* Code Example */}
          {mod.codeExample && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-surface-container p-6 rounded-xl border border-outline-variant/10"
            >
              <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4">Code Example</h4>
              <pre className="font-mono text-xs text-on-surface-variant overflow-x-auto leading-relaxed">
                <code>{mod.codeExample}</code>
              </pre>
            </motion.div>
          )}
        </div>

        {/* Right Control Panel */}
        <aside className="col-span-12 lg:col-span-4">
          <ControlPanel
            controls={mod.controlSchema}
            params={params}
            presets={mod.presets}
            onParamChange={setParam}
            onReset={reset}
            onApplyPreset={applyPreset}
          />
        </aside>
      </div>
    </div>
  )
}
