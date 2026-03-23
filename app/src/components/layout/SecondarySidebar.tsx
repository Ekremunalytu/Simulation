import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { getModulesByCategory } from '../../engine/registry'
import { courseCategoryMeta } from '../../engine/catalog'
import type { CategoryKey } from './IconSidebar'

interface SecondarySidebarProps {
  activeCategory: CategoryKey
}

export function SecondarySidebar({ activeCategory }: SecondarySidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  if (!activeCategory) return null

  const meta = courseCategoryMeta[activeCategory]
  if (!meta) return null

  const modules = getModulesByCategory(meta.mappedCategory)

  return (
    <AnimatePresence>
      <motion.aside
        key={activeCategory}
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -260, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-16 top-0 h-full w-60 bg-surface-container-lowest/90 backdrop-blur-xl z-40 border-r border-white/[0.05] py-8 px-5 overflow-y-auto no-scrollbar"
      >
        <header className="mb-8">
          <h3 className="eyebrow mb-2">Modül</h3>
          <h2 className="text-on-surface font-semibold text-lg">{meta.title}</h2>
        </header>

        {modules.length > 0 ? (
          <div className="space-y-6">
            <section>
              <div className="flex items-center justify-between text-secondary mb-3">
                <span className="eyebrow text-secondary">Simülasyonlar</span>
                <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
              </div>
              <ul className="space-y-1">
                {modules.map((mod) => {
                  const isActive = location.pathname === `/sim/${mod.id}`
                  return (
                    <li key={mod.id}>
                      <button
                        onClick={() => navigate(`/sim/${mod.id}`)}
                        className={`w-full text-left flex items-center px-3 py-3 rounded-2xl transition-all text-sm ${
                          isActive
                            ? 'bg-secondary/10 text-secondary font-medium'
                            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                        }`}
                      >
                        <span>{mod.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        ) : (
          <div className="rounded-[18px] bg-surface-container-low p-4 border border-white/[0.04] space-y-2 mt-4">
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
