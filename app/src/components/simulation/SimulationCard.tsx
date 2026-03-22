import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import type { SimulationModule } from '../../types/simulation'

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
  module: SimulationModule
  index: number
}

export function SimulationCard({ module, index }: SimulationCardProps) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={() => navigate(`/sim/${module.id}`)}
      className="group rounded-xl bg-surface-container-low p-8 flex flex-col justify-between border border-transparent hover:border-primary/20 transition-all cursor-pointer"
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className={`w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center transition-all ${categoryColors[module.category]}`}>
            <span className="text-2xl">{module.icon}</span>
          </div>
          <span className="text-[10px] font-mono text-outline uppercase">{module.category}</span>
        </div>
        <h3 className="font-headline text-xl font-bold mb-2">{module.title}</h3>
        <p className="text-on-surface/50 text-xs leading-relaxed mb-6">{module.description}</p>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider">
          <span className="text-outline uppercase">Difficulty</span>
          <span className={`uppercase ${difficultyColors[module.difficulty]}`}>{module.difficulty}</span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-[10px] font-mono text-outline uppercase tracking-wider">Explore</span>
          <ArrowRight className="w-4 h-4 text-outline group-hover:text-primary transition-colors" strokeWidth={1.5} />
        </div>
      </div>
    </motion.div>
  )
}
