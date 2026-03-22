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
  { icon: Sigma, cat: 'calculus', label: 'Calculus 2' },
  { icon: Eye, cat: 'image-processing', label: 'Görüntü İşleme' },
]

export function IconSidebar({ activeCategory, onCategoryToggle }: IconSidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const isHome = location.pathname === '/'

  return (
    <nav className="fixed left-0 top-0 h-full z-50 flex flex-col items-center py-6 w-16 bg-black/60 backdrop-blur-xl border-r border-white/[0.04]">
      {/* Logo */}
      <div
        className="mb-10 cursor-pointer"
        onClick={() => {
          onCategoryToggle(null)
          navigate('/')
        }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-lg shadow-primary/20">
          <Sparkles className="w-5 h-5 text-on-primary-container" />
        </div>
      </div>

      {/* Dashboard */}
      <button
        onClick={() => {
          onCategoryToggle(null)
          navigate('/')
        }}
        title="Dashboard"
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 mb-6 ${
          isHome && !activeCategory
            ? 'bg-violet-500/10 text-violet-400'
            : 'text-neutral-600 hover:text-violet-300'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {/* Category Items */}
      <div className="flex flex-col gap-3 flex-1">
        {navItems.map(({ icon: Icon, cat, label }) => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => onCategoryToggle(isActive ? null : cat)}
              title={label}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-violet-500/10 text-violet-400 border-l-2 border-secondary'
                  : 'text-neutral-600 hover:text-violet-300'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </button>
          )
        })}
      </div>

      {/* Settings */}
      <button className="w-10 h-10 flex items-center justify-center rounded-xl text-neutral-600 hover:text-violet-300 transition-colors duration-300 mt-auto">
        <Settings className="w-5 h-5" strokeWidth={1.5} />
      </button>
    </nav>
  )
}
