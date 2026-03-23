import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { RegisteredSimulationModule } from '../../types/simulation'

const difficultyColors: Record<string, string> = {
  beginner: 'text-on-surface',
  intermediate: 'text-tertiary',
  advanced: 'text-secondary',
}

const categoryColors: Record<string, string> = {
  ml: 'text-primary group-hover:bg-primary group-hover:text-on-primary',
  database: 'text-secondary group-hover:bg-secondary group-hover:text-on-secondary',
  math: 'text-tertiary group-hover:bg-tertiary group-hover:text-on-tertiary',
  algorithms: 'text-primary group-hover:bg-primary group-hover:text-on-primary',
  probability: 'text-secondary group-hover:bg-secondary group-hover:text-on-secondary',
}

interface SimulationCardProps {
  module: RegisteredSimulationModule
  index: number
}

export function SimulationCard({ module, index }: SimulationCardProps) {
  const navigate = useNavigate()
  const difficultyLabel =
    module.difficulty === 'beginner'
      ? 'başlangıç'
      : module.difficulty === 'intermediate'
        ? 'orta'
        : 'ileri'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={() => navigate(`/sim/${module.id}`)}
      className="group surface-card rounded-[16px] p-7 flex flex-col justify-between border border-white/[0.05] hover:border-primary/18 hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className={`w-12 h-12 rounded-[14px] bg-surface-container flex items-center justify-center transition-all ${categoryColors[module.category]}`}>
            <span className="text-2xl">{module.icon}</span>
          </div>
          <span className="font-mono text-xs text-outline">{module.category}</span>
        </div>
        <h3 className="font-headline text-2xl font-bold mb-3 tracking-tight">{module.title}</h3>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-7">{module.description}</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-outline">Zorluk</span>
          <span className={difficultyColors[module.difficulty]}>{difficultyLabel}</span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs font-mono text-outline">İncele</span>
          <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  )
}
