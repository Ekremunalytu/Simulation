import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import type { RegisteredSimulationModule } from '../../types/simulation'
import {
  getCourseCategoryForModule,
  getDifficultyLabel,
  getRunModeLabel,
  courseCategoryMeta,
} from '../../engine/catalog'

const accentTone: Record<string, string> = {
  ml: 'text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]',
  database: 'text-secondary bg-secondary/10 shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)]',
  math: 'text-tertiary bg-tertiary/10 shadow-[inset_0_0_0_1px_rgba(255,184,105,0.16)]',
  algorithms: 'text-secondary bg-secondary/10 shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)]',
  probability: 'text-primary bg-primary/10 shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]',
}

interface SimulationCardProps {
  module: RegisteredSimulationModule
  index: number
}

export function SimulationCard({ module, index }: SimulationCardProps) {
  const course = getCourseCategoryForModule(module)
  const courseLabel = course ? courseCategoryMeta[course].title : module.category

  return (
    <Link
      to={`/sim/${module.id}`}
      className="focus-ring group surface-card block rounded-[24px] p-7 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(0,0,0,0.34)]"
      aria-label={`${module.title} simülasyonunu aç`}
      data-index={index}
    >
      <div className="flex h-full flex-col justify-between gap-8">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] ${accentTone[module.category]}`}
            >
              {courseLabel}
            </span>
            {module.recommendedStarter ? (
              <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-[11px] font-mono uppercase tracking-[0.18em] text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
                Starter
              </span>
            ) : null}
          </div>

          <div className="space-y-3">
            <h3 className="font-headline text-2xl font-bold tracking-tight text-on-surface">
              {module.title}
            </h3>
            <p className="text-sm text-outline">{module.subtitle}</p>
            <p className="text-sm leading-relaxed text-on-surface-variant">{module.description}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs font-mono text-outline">
            <div className="surface-panel rounded-[16px] px-3 py-3">
              <p>Zorluk</p>
              <p className="mt-2 text-sm text-on-surface">{getDifficultyLabel(module.difficulty)}</p>
            </div>
            <div className="surface-panel rounded-[16px] px-3 py-3">
              <p>Akış</p>
              <p className="mt-2 text-sm text-on-surface">{getRunModeLabel(module.runMode)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="font-mono text-outline">{module.estimatedMinutes} dk</span>
            <span className="inline-flex items-center gap-2 font-medium text-on-surface transition-[gap,color] duration-200 group-hover:gap-3 group-hover:text-primary">
              İncele
              <ArrowRight aria-hidden="true" className="w-4 h-4" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
