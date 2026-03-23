import { motion } from 'framer-motion'
import { FlaskConical } from 'lucide-react'
import type { GuidedExperiment } from '../../types/simulation'

interface ExperimentsPanelProps {
  experiments: GuidedExperiment[]
}

export function ExperimentsPanel({ experiments }: ExperimentsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.15 }}
      className="bg-surface-container p-6 rounded-xl border border-outline-variant/10"
    >
      <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4 flex items-center gap-2">
        <FlaskConical className="w-3.5 h-3.5" strokeWidth={1.5} />
        Yönlendirilmiş Deneyler
      </h4>
      <div className="space-y-3">
        {experiments.map((experiment) => (
          <article key={experiment.title} className="rounded-lg bg-surface-container-lowest/50 p-4">
            <h5 className="text-sm font-semibold text-on-surface">{experiment.title}</h5>
            <p className="text-xs text-on-surface-variant mt-2">
              <span className="text-outline uppercase tracking-widest font-mono text-[10px] mr-2">
                Değiştir
              </span>
              {experiment.change}
            </p>
            <p className="text-xs text-on-surface-variant mt-2">
              <span className="text-outline uppercase tracking-widest font-mono text-[10px] mr-2">
                Beklenti
              </span>
              {experiment.expectation}
            </p>
          </article>
        ))}
      </div>
    </motion.div>
  )
}
