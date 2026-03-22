import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { getModulesByCategory } from '../../engine/registry'
import type { CategoryKey } from './IconSidebar'
import type { Category } from '../../types/simulation'

const categoryMeta: Record<string, { title: string; mappedCategory: Category }> = {
  ai: { title: 'Yapay Zeka', mappedCategory: 'ml' },
  database: { title: 'Veri Tabanı Sistemleri', mappedCategory: 'database' },
  calculus: { title: 'Calculus 2', mappedCategory: 'math' },
  'image-processing': { title: 'Görüntü İşleme', mappedCategory: 'algorithms' },
}

interface SecondarySidebarProps {
  activeCategory: CategoryKey
}

export function SecondarySidebar({ activeCategory }: SecondarySidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()

  if (!activeCategory) return null

  const meta = categoryMeta[activeCategory]
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
        className="fixed left-16 top-0 h-full w-60 bg-surface-container-lowest/90 backdrop-blur-xl z-40 border-r border-white/[0.04] py-8 px-5 overflow-y-auto no-scrollbar"
      >
        <header className="mb-8">
          <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-outline mb-1">Modül</h3>
          <h2 className="text-on-surface font-semibold text-base">{meta.title}</h2>
        </header>

        {modules.length > 0 ? (
          <div className="space-y-6">
            <section>
              <div className="flex items-center justify-between text-secondary mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest">Simülasyonlar</span>
                <ChevronRight className="w-3 h-3" strokeWidth={1.5} />
              </div>
              <ul className="space-y-1">
                {modules.map((mod) => {
                  const isActive = location.pathname === `/sim/${mod.id}`
                  return (
                    <li key={mod.id}>
                      <button
                        onClick={() => navigate(`/sim/${mod.id}`)}
                        className={`w-full text-left flex items-center px-3 py-2.5 rounded-lg transition-all text-sm ${
                          isActive
                            ? 'bg-secondary/10 text-secondary border-r-2 border-secondary font-medium'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                      >
                        <span className="mr-3 text-base">{mod.icon}</span>
                        <span>{mod.title}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        ) : (
          <div className="text-outline text-xs font-mono mt-4">
            Bu kategoride henüz simülasyon yok.
          </div>
        )}
      </motion.aside>
    </AnimatePresence>
  )
}
