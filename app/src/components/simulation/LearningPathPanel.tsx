import { Link } from 'react-router-dom'
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
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="surface-card space-y-5 rounded-[24px] p-5 md:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p className="eyebrow">Öğrenme Yolu</p>
          <h3 className="font-headline text-2xl font-semibold tracking-tight">
            Bu modül ile neyi pekiştiriyorsun?
          </h3>
          <p className="max-w-3xl text-sm text-on-surface-variant">
            Modülü tek başına değil, bağlandığı kavram akışı içinde takip et.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/12 px-3 py-1.5 text-xs font-medium text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]">
            <span className="inline-flex items-center gap-2">
              <Clock3 aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={1.5} />
              Yaklaşık {module.estimatedMinutes} dk
            </span>
          </span>
          {module.syllabusWeeks?.length ? (
            <span className="rounded-full bg-secondary/10 px-3 py-1.5 text-xs text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)]">
              {formatSyllabusWeeks(module.syllabusWeeks)}
            </span>
          ) : null}
          <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
            <span className="inline-flex items-center gap-2">
              <Tags aria-hidden="true" className="w-3.5 h-3.5" strokeWidth={1.5} />
              {module.conceptTags.length} kavram etiketi
            </span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
        <article className="surface-panel rounded-[20px] p-4">
          <h4 className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface">
            <BookMarked aria-hidden="true" className="w-4 h-4 text-primary" strokeWidth={1.5} />
            Öğrenme Hedefleri
          </h4>
          <div className="mt-4 flex flex-wrap gap-2">
            {module.learningObjectives.map((objective) => (
              <span
                key={objective}
                className="rounded-2xl bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]"
              >
                {objective}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {module.conceptTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-medium text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </article>

        <article className="surface-panel rounded-[20px] p-4">
          <h4 className="text-sm font-semibold text-on-surface">Önkoşullar</h4>
          <div className="mt-4 space-y-2">
            {prerequisites.length > 0 ? (
              prerequisites.map((relatedModule) => (
                <Link
                  key={relatedModule.id}
                  to={`/sim/${relatedModule.id}`}
                  className="focus-ring block w-full rounded-[16px] bg-surface-container-low px-3 py-3 text-left text-sm text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high hover:text-on-surface"
                >
                  <span className="block font-medium text-on-surface">{relatedModule.title}</span>
                  <span className="mt-1 block text-xs">{relatedModule.subtitle}</span>
                </Link>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">
                Bu modül için önkoşul bulunmuyor. Doğrudan başlayabilirsin.
              </p>
            )}
          </div>
        </article>

        <article className="surface-panel rounded-[20px] p-4">
          <h4 className="text-sm font-semibold text-on-surface">Sıradaki Modüller</h4>
          <div className="mt-4 space-y-2">
            {nextModules.length > 0 ? (
              nextModules.map((relatedModule) => (
                <Link
                  key={relatedModule.id}
                  to={`/sim/${relatedModule.id}`}
                  className="focus-ring block w-full rounded-[16px] bg-primary/8 px-3 py-3 text-left text-sm text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(208,188,255,0.14)] hover:bg-primary/12 hover:text-on-surface"
                >
                  <span className="flex items-center justify-between gap-3">
                    <span>
                      <span className="block font-medium text-on-surface">{relatedModule.title}</span>
                      <span className="mt-1 block text-xs">{relatedModule.subtitle}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="w-4 h-4 text-primary" strokeWidth={1.5} />
                  </span>
                </Link>
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
