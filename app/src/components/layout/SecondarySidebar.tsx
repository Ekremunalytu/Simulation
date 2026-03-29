import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { getModulesByCategory } from '../../engine/registry'
import { courseCategoryMeta } from '../../engine/catalog'
import type { CategoryKey } from './IconSidebar'

interface SecondarySidebarProps {
  activeCategory: CategoryKey
}

export function SecondarySidebar({ activeCategory }: SecondarySidebarProps) {
  const location = useLocation()

  if (!activeCategory) return null

  const meta = courseCategoryMeta[activeCategory]
  if (!meta) return null

  const modules = getModulesByCategory(meta.mappedCategory)

  return (
    <AnimatePresence>
      <motion.aside
        id="secondary-sidebar"
        key={activeCategory}
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -260, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="glass fixed left-[76px] top-3 bottom-3 z-40 w-[228px] overflow-y-auto rounded-[26px] px-5 py-6 no-scrollbar"
      >
        <header className="mb-7 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="eyebrow mb-2">Ders Alanı</h3>
              <h2 className="text-lg font-semibold text-on-surface">{meta.title}</h2>
            </div>
            <span className="rounded-full bg-surface-container-high/80 px-3 py-1 text-xs font-mono text-on-surface-variant">
              {modules.length}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            {meta.description}
          </p>
        </header>

        {modules.length > 0 ? (
          <div className="space-y-6">
            <section>
              <div className="mb-3 flex items-center justify-between text-secondary">
                <span className="eyebrow text-secondary">Simülasyonlar</span>
                <ChevronRight aria-hidden="true" className="w-3 h-3" strokeWidth={1.5} />
              </div>
              <ul className="space-y-2">
                {modules.map((mod) => {
                  const isActive = location.pathname === `/sim/${mod.id}`
                  return (
                    <li key={mod.id}>
                      <Link
                        to={`/sim/${mod.id}`}
                        className={`focus-ring block w-full rounded-[18px] px-3 py-3 text-sm transition-[background-color,color,transform] duration-200 ${
                          isActive
                            ? 'bg-secondary/12 text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)]'
                            : 'surface-panel text-on-surface-variant hover:-translate-y-0.5 hover:text-on-surface'
                        }`}
                      >
                        <span className="block text-sm font-medium text-current">{mod.title}</span>
                        <span className="mt-1 block min-w-0 text-xs text-outline">{mod.subtitle}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        ) : (
          <div className="surface-panel mt-4 space-y-2 rounded-[18px] p-4">
            <p className="text-sm font-medium text-on-surface">
              {meta.comingSoonTitle ?? 'Bu kategoride henüz simülasyon yok.'}
            </p>
            <p className="text-xs leading-relaxed text-on-surface-variant">
              {meta.comingSoonDescription ?? meta.description}
            </p>
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  )
}
