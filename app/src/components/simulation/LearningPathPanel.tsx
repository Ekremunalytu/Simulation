import { useNavigate } from 'react-router-dom'
import { BookMarked, Clock3, ArrowRight, Tags } from 'lucide-react'
import { motion } from 'framer-motion'
import type { RegisteredSimulationModule } from '../../types/simulation'

interface LearningPathPanelProps {
  module: RegisteredSimulationModule
  prerequisites: RegisteredSimulationModule[]
  nextModules: RegisteredSimulationModule[]
}

function formatSyllabusWeeks(weeks: number[]) {
  if (weeks.length === 0) {
    return ''
  }

  const sorted = [...weeks].sort((left, right) => left - right)
  const first = sorted[0]
  const last = sorted.at(-1)

  if (first === last) {
    return `Hafta ${first}`
  }

  return `Hafta ${first}-${last}`
}

export function LearningPathPanel({
  module,
  prerequisites,
  nextModules,
}: LearningPathPanelProps) {
  const navigate = useNavigate()

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="surface-card rounded-[18px] border border-white/[0.05] p-5 md:p-6 space-y-5"
    >
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="eyebrow">Öğrenme Yolu</p>
          <h3 className="font-headline text-2xl font-semibold tracking-tight">
            Bu modül ile neyi pekiştiriyorsun?
          </h3>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Modülü tek başına değil, bağlandığı kavram akışı içinde takip et.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/12 text-primary px-3 py-1.5 text-xs font-medium inline-flex items-center gap-2">
            <Clock3 className="w-3.5 h-3.5" strokeWidth={1.5} />
            Yaklaşık {module.estimatedMinutes} dk
          </span>
          {module.syllabusWeeks?.length ? (
            <span className="rounded-full bg-secondary/10 px-3 py-1.5 text-xs text-secondary inline-flex items-center gap-2">
              {formatSyllabusWeeks(module.syllabusWeeks)}
            </span>
          ) : null}
          <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant inline-flex items-center gap-2">
            <Tags className="w-3.5 h-3.5" strokeWidth={1.5} />
            {module.conceptTags.length} kavram etiketi
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr_1fr] gap-4">
        <article className="surface-panel rounded-[16px] border border-white/[0.04] p-4">
          <h4 className="text-sm font-semibold text-on-surface inline-flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primary" strokeWidth={1.5} />
            Öğrenme Hedefleri
          </h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {module.learningObjectives.map((objective) => (
              <span
                key={objective}
                className="rounded-2xl bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant"
              >
                {objective}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {module.conceptTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-medium text-secondary"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        <article className="surface-panel rounded-[16px] border border-white/[0.04] p-4">
          <h4 className="text-sm font-semibold text-on-surface">Önkoşullar</h4>
          <div className="mt-4 space-y-2">
            {prerequisites.length > 0 ? (
              prerequisites.map((relatedModule) => (
                <button
                  key={relatedModule.id}
                  onClick={() => navigate(`/sim/${relatedModule.id}`)}
                  className="w-full rounded-[14px] bg-surface-container-low px-3 py-3 text-left text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                >
                  <span className="block text-on-surface font-medium">{relatedModule.title}</span>
                  <span className="block mt-1 text-xs">{relatedModule.subtitle}</span>
                </button>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">
                Bu modül için önkoşul bulunmuyor. Doğrudan başlayabilirsin.
              </p>
            )}
          </div>
        </article>

        <article className="surface-panel rounded-[16px] border border-white/[0.04] p-4">
          <h4 className="text-sm font-semibold text-on-surface">Sıradaki Modüller</h4>
          <div className="mt-4 space-y-2">
            {nextModules.length > 0 ? (
              nextModules.map((relatedModule) => (
                <button
                  key={relatedModule.id}
                  onClick={() => navigate(`/sim/${relatedModule.id}`)}
                  className="w-full rounded-[14px] bg-primary/8 px-3 py-3 text-left text-sm text-on-surface-variant hover:bg-primary/12 hover:text-on-surface transition-colors"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block text-on-surface font-medium">{relatedModule.title}</span>
                      <span className="block mt-1 text-xs">{relatedModule.subtitle}</span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">
                Bu modül şimdilik yolun sonundaki duraklardan biri olarak konumlanmış.
              </p>
            )}
          </div>
        </article>
      </div>
    </motion.section>
  )
}
