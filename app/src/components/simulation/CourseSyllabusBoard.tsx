import { Link } from 'react-router-dom'
import { CalendarRange, Route, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import {
  courseCategoryMeta,
  getModulesForCourseWeek,
  getSyllabusForCourse,
  type CourseCategoryKey,
} from '../../engine/catalog'
import type { RegisteredSimulationModule } from '../../types/simulation'

interface CourseSyllabusBoardProps {
  title: string
  description: string
  courseKeys: CourseCategoryKey[]
  modules: RegisteredSimulationModule[]
  showPlanned?: boolean
}

function WeekKindBadge({ kind }: { kind?: 'lecture' | 'overview' | 'exam' | 'review' }) {
  if (!kind || kind === 'lecture') {
    return null
  }

  const tone =
    kind === 'exam'
      ? 'bg-tertiary/10 text-tertiary shadow-[inset_0_0_0_1px_rgba(255,184,105,0.18)]'
      : kind === 'review'
        ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.18)]'
        : 'bg-secondary/10 text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.18)]'

  const label =
    kind === 'exam' ? 'Sınav' : kind === 'review' ? 'Tekrar' : 'Genel Bakış'

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-medium ${tone}`}>
      {label}
    </span>
  )
}

function PlannedCourseCard({ course }: { course: CourseCategoryKey }) {
  const meta = courseCategoryMeta[course]

  return (
    <article className="surface-panel rounded-[22px] p-5">
      <div className="flex items-center gap-2">
        <Sparkles aria-hidden="true" className="h-4 w-4 text-primary" strokeWidth={1.5} />
        <p className="eyebrow">Planlanan Ders</p>
      </div>
      <h3 className="mt-3 font-headline text-xl font-semibold text-on-surface">
        {meta.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        {meta.comingSoonDescription ?? meta.description}
      </p>
      {meta.roadmapBullets?.length ? (
        <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
          {meta.roadmapBullets.map((bullet) => (
            <li key={bullet} className="rounded-2xl bg-surface-container-low px-3 py-2">
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  )
}

export function CourseSyllabusBoard({
  title,
  description,
  courseKeys,
  modules,
  showPlanned = false,
}: CourseSyllabusBoardProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="eyebrow">Ders Programı</p>
          <h2 className="font-headline text-2xl font-semibold tracking-tight md:text-[2rem]">
            {title}
          </h2>
          <p className="max-w-3xl text-sm leading-relaxed text-on-surface-variant">
            {description}
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {courseKeys.map((course, courseIndex) => {
          const syllabus = getSyllabusForCourse(course)
          if (!syllabus) {
            return showPlanned ? <PlannedCourseCard key={course} course={course} /> : null
          }

          return (
            <motion.article
              key={course}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: courseIndex * 0.05 }}
              className="surface-card rounded-[24px] p-5 md:p-6"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
                    <CalendarRange aria-hidden="true" className="h-3.5 w-3.5 text-secondary" strokeWidth={1.5} />
                    {courseCategoryMeta[course].title}
                  </div>
                  <h3 className="font-headline text-xl font-semibold text-on-surface">
                    {syllabus.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-on-surface-variant">
                    {syllabus.summary}
                  </p>
                </div>
                <div className="rounded-2xl bg-primary/10 px-3 py-2 text-xs text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]">
                  {syllabus.weeks.length} hafta
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {syllabus.weeks.map((week) => {
                  const matchedModules = getModulesForCourseWeek(modules, course, week.week)
                  const hasModules = matchedModules.length > 0
                  const isLectureWeek = (week.kind ?? 'lecture') === 'lecture'

                  return (
                    <div
                      key={`${course}-${week.week}`}
                      className="rounded-[20px] bg-surface-container-low px-4 py-4 shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-mono text-outline">
                              Hafta {week.week}
                            </span>
                            <WeekKindBadge kind={week.kind} />
                          </div>
                          <p className="text-sm font-medium text-on-surface">{week.topic}</p>
                          {week.note ? (
                            <p className="text-xs leading-relaxed text-on-surface-variant">
                              {week.note}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex max-w-[28rem] flex-wrap gap-2">
                          {hasModules ? (
                            matchedModules.map((module) => (
                              <Link
                                key={module.id}
                                to={`/sim/${module.id}`}
                                className="focus-ring inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-2 text-xs text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)] hover:bg-secondary/14"
                              >
                                <Route aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.5} />
                                {module.title}
                              </Link>
                            ))
                          ) : (
                            <span className="rounded-2xl bg-black/15 px-3 py-2 text-xs leading-relaxed text-on-surface-variant">
                              {isLectureWeek
                                ? 'Henüz doğrudan bağlanmış bir modül yok.'
                                : 'Bu hafta için çalışma notu odaklı bir durak planlandı.'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.article>
          )
        })}

        {showPlanned
          ? (Object.entries(courseCategoryMeta) as Array<[CourseCategoryKey, (typeof courseCategoryMeta)[CourseCategoryKey]]>)
              .filter(([course, meta]) => meta.status === 'planned' && !courseKeys.includes(course))
              .map(([course]) => <PlannedCourseCard key={course} course={course} />)
          : null}
      </div>
    </section>
  )
}
