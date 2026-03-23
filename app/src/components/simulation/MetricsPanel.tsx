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
      className="bg-surface-container p-6 rounded-xl border border-outline-variant/10"
    >
      <h4 className="text-[10px] font-bold text-outline uppercase tracking-widest mb-4 flex items-center gap-2">
        <Activity className="w-3.5 h-3.5" strokeWidth={1.5} />
        Temel Metrikler
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg bg-surface-container-lowest/50 p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-outline mb-2">
              {metric.label}
            </p>
            <p className={`inline-flex px-2.5 py-1 rounded-md text-sm font-semibold ${toneClasses[metric.tone ?? 'neutral']}`}>
              {metric.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
