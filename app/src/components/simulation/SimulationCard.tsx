import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { RegisteredSimulationModule } from '../../types/simulation'

const difficultyColors: Record<string, string> = {
  beginner: 'text-on-surface',
  intermediate: 'text-tertiary',
  advanced: 'text-secondary',
}

const categoryBadgeColors: Record<string, string> = {
  ml: 'bg-primary/10 text-primary',
  database: 'bg-secondary/10 text-secondary',
  math: 'bg-tertiary/10 text-tertiary',
  algorithms: 'bg-primary/10 text-primary',
  probability: 'bg-secondary/10 text-secondary',
}

interface SimulationCardProps {
  module: RegisteredSimulationModule
  index: number
}

export function SimulationCard({ module, index }: SimulationCardProps) {
  const navigate = useNavigate()
  void index
  const difficultyLabel =
    module.difficulty === 'beginner'
      ? 'başlangıç'
      : module.difficulty === 'intermediate'
        ? 'orta'
        : 'ileri'

  return (
    <div
      onClick={() => navigate(`/sim/${module.id}`)}
      className="group surface-card rounded-[16px] p-7 flex flex-col justify-between border border-white/[0.05] hover:border-primary/18 hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] ${categoryBadgeColors[module.category]}`}
          >
            {module.category}
          </span>
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
    </div>
  )
}
