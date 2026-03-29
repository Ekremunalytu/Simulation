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
      className="surface-card rounded-[20px] p-5"
    >
      <h4 className="eyebrow mb-4 flex items-center gap-2">
        <FlaskConical aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={1.5} />
        Yönlendirilmiş Deneyler
      </h4>
      <div className="space-y-3">
        {experiments.map((experiment) => (
          <article key={experiment.title} className="surface-panel rounded-[16px] p-4">
            <h5 className="text-base font-semibold text-on-surface">{experiment.title}</h5>
            <p className="text-sm text-on-surface-variant mt-2">
              <span className="text-outline font-mono text-xs mr-2">
                Değiştir
              </span>
              {experiment.change}
            </p>
            <p className="text-sm text-on-surface-variant mt-2">
              <span className="text-outline font-mono text-xs mr-2">
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
