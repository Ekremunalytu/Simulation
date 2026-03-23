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

export function IconSidebar({ activeCategory, onCategoryToggle }: IconSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  return (
    <nav
      className="fixed left-0 top-0 h-full z-50 w-[84px] px-3 py-5 bg-surface-container-lowest/92 backdrop-blur-xl border-r border-white/[0.04]"
    >
      <div
        className="mb-8 cursor-pointer flex items-center justify-center"
        onClick={() => {
          onCategoryToggle(null)
          navigate('/')
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-5 h-5 text-on-primary-container" />
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => {
            onCategoryToggle(null)
            navigate('/')
          }}
          title="Ana Sayfa"
          className={`w-full flex items-center justify-center h-11 rounded-2xl transition-all duration-300 ${
            isHome && !activeCategory
              ? 'bg-primary/10 text-primary'
              : 'text-outline hover:text-on-surface hover:bg-surface-container-low'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" strokeWidth={1.5} />
        </button>

        <div className="space-y-2 mt-5">
        {navItems.map(({ icon: Icon, cat, label }) => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => onCategoryToggle(isActive ? null : cat)}
              title={label}
                className={`w-full flex items-center justify-center h-11 rounded-2xl transition-all duration-300 ${
                isActive
                    ? 'bg-secondary/10 text-secondary'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-low'
              }`}
            >
                <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            </button>
          )
        })}
      </div>
      </div>

      <div className="flex-1" />

      <button
        className="mt-4 w-full flex items-center justify-center h-11 rounded-2xl text-outline hover:text-on-surface hover:bg-surface-container-low transition-colors duration-300"
      >
        <Settings className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </nav>
  )
}
