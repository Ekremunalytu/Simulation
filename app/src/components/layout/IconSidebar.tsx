import { useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Brain,
  Database,
  Sigma,
  Eye,
  Settings,
  Sparkles,
} from 'lucide-react'
import { getModulesByCategory } from '../../engine/registry'
import type { Category } from '../../types/simulation'

export type CategoryKey = 'ai' | 'database' | 'calculus' | 'image-processing' | null

interface IconSidebarProps {
  activeCategory: CategoryKey
  onCategoryToggle: (cat: CategoryKey) => void
}

const navItems: { icon: typeof Brain; cat: CategoryKey; label: string }[] = [
  { icon: Brain, cat: 'ai', label: 'Yapay Zeka' },
  { icon: Database, cat: 'database', label: 'Veri Tabanı Sistemleri' },
  { icon: Sigma, cat: 'calculus', label: 'Calculus II' },
  { icon: Eye, cat: 'image-processing', label: 'Görüntü İşleme' },
]

const categoryMeta: Record<Exclude<CategoryKey, null>, { title: string; mappedCategory: Category }> = {
  ai: { title: 'Yapay Zeka', mappedCategory: 'ml' },
  database: { title: 'Veri Tabanı Sistemleri', mappedCategory: 'database' },
  calculus: { title: 'Calculus II', mappedCategory: 'math' },
  'image-processing': { title: 'Görüntü İşleme', mappedCategory: 'algorithms' },
}

export function IconSidebar({ activeCategory, onCategoryToggle }: IconSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'
  const expanded = activeCategory !== null
  const modules = activeCategory ? getModulesByCategory(categoryMeta[activeCategory].mappedCategory) : []

  return (
    <nav
      className={`fixed left-0 top-0 h-full z-50 py-5 bg-surface-container-lowest/92 backdrop-blur-xl border-r border-white/[0.04] transition-[width,padding] duration-300 ${
        expanded ? 'w-[248px] px-4' : 'w-[84px] px-3'
      }`}
    >
      <div
        className={`mb-8 cursor-pointer flex items-center ${expanded ? 'gap-3' : 'justify-center'}`}
        onClick={() => {
          onCategoryToggle(null)
          navigate('/')
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-5 h-5 text-on-primary-container" />
        </div>
        {expanded ? (
          <div>
            <p className="eyebrow">Obsidian Lab</p>
            <p className="text-sm text-on-surface-variant mt-1">Tek sidebar navigasyon</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => {
            onCategoryToggle(null)
            navigate('/')
          }}
          title="Ana Sayfa"
          className={`w-full flex items-center ${expanded ? 'justify-start px-3' : 'justify-center'} h-11 rounded-2xl transition-all duration-300 ${
            isHome && !activeCategory
              ? 'bg-primary/10 text-primary'
              : 'text-outline hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          {expanded ? <span className="ml-3 text-sm">Ana Sayfa</span> : null}
        </button>

        <div className={`space-y-2 ${expanded ? 'mt-4' : 'mt-5'}`}>
          {expanded ? <p className="eyebrow px-3 pb-1">Dersler</p> : null}
        {navItems.map(({ icon: Icon, cat, label }) => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => onCategoryToggle(isActive ? null : cat)}
              title={label}
                className={`w-full flex items-center ${expanded ? 'justify-start px-3' : 'justify-center'} h-11 rounded-2xl transition-all duration-300 ${
                isActive
                    ? 'bg-secondary/10 text-secondary'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                {expanded ? <span className="ml-3 text-sm text-left">{label}</span> : null}
            </button>
          )
        })}
      </div>
      </div>

      {expanded && activeCategory ? (
        <div className="mt-6 flex-1 min-h-0">
          <div className="px-3 mb-3">
            <p className="eyebrow">Modüller</p>
            <p className="text-sm text-on-surface mt-2">{categoryMeta[activeCategory].title}</p>
          </div>
          <div className="space-y-1 overflow-y-auto no-scrollbar max-h-[calc(100vh-260px)] pr-1">
            {modules.map((mod) => {
              const isActive = location.pathname === `/sim/${mod.id}`

              return (
                <button
                  key={mod.id}
                  onClick={() => navigate(`/sim/${mod.id}`)}
                  className={`w-full text-left flex items-center px-3 py-2.5 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-surface-container-low text-on-surface'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  }`}
                >
                  <span className="text-base mr-3">{mod.icon}</span>
                  <span className="text-sm leading-snug">{mod.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <button
        className={`mt-4 w-full flex items-center ${expanded ? 'justify-start px-3' : 'justify-center'} h-11 rounded-2xl text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors duration-300`}
      >
        <Settings className="w-5 h-5" strokeWidth={1.5} />
        {expanded ? <span className="ml-3 text-sm">Ayarlar</span> : null}
      </button>
    </nav>
  )
}
