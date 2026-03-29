import { motion } from 'framer-motion'
import { Activity } from 'lucide-react'
import type { SimulationMetric } from '../../types/simulation'

interface MetricsPanelProps {
  metrics: SimulationMetric[]
}

const toneClasses: Record<NonNullable<SimulationMetric['tone']>, string> = {
  primary: 'text-primary bg-primary/10',
  secondary: 'text-secondary bg-secondary/10',
  tertiary: 'text-tertiary bg-tertiary/10',
  neutral: 'text-on-surface bg-surface-container-low',
  warning: 'text-tertiary bg-tertiary/10',
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="surface-card rounded-[20px] p-5"
    >
      <h4 className="eyebrow mb-4 flex items-center gap-2">
        <Activity aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={1.5} />
        Temel Metrikler
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="surface-panel rounded-[16px] p-4">
            <p className="font-mono text-xs text-outline mb-2">
              {metric.label}
            </p>
            <p className={`inline-flex px-3 py-1.5 rounded-full text-sm font-semibold ${toneClasses[metric.tone ?? 'neutral']}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
