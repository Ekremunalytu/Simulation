import { Link, useLocation } from 'react-router-dom'
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
  const isHome = location.pathname === '/'
  const baseButtonClass =
    'focus-ring group relative flex h-12 w-12 items-center justify-center rounded-2xl text-outline transition-[background-color,color,transform] duration-200 hover:bg-surface-container-low hover:text-on-surface'

  return (
    <nav
      aria-label="Birincil gezinme"
      className="fixed inset-y-0 left-0 z-50 flex w-[88px] flex-col items-center gap-4 px-4 py-5 bg-surface-container-lowest/88 backdrop-blur-xl"
    >
      <Link
        to="/"
        onClick={() => onCategoryToggle(null)}
        aria-label="Ana sayfaya dön"
        className="focus-ring mb-3 flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-primary to-primary-container shadow-[0_0_24px_rgba(208,188,255,0.26)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(208,188,255,0.34)]"
      >
        <Sparkles aria-hidden="true" className="w-5 h-5 text-on-primary-container" />
        <span className="sr-only">Obsidian Lab</span>
      </Link>

      <div className="flex flex-col items-center gap-2">
        <Link
          to="/"
          onClick={() => onCategoryToggle(null)}
          aria-label="Ana sayfa"
          className={`${baseButtonClass} ${
            isHome && !activeCategory
              ? 'bg-primary/12 text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]'
              : ''
          }`}
        >
          <LayoutDashboard aria-hidden="true" className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          <span className="sr-only">Ana sayfa</span>
        </Link>

        <div className="my-4 h-px w-9 bg-gradient-to-r from-transparent via-outline-variant/80 to-transparent" />

        {navItems.map(({ icon: Icon, cat, label }) => {
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              type="button"
              aria-label={label}
              aria-controls="secondary-sidebar"
              aria-pressed={isActive}
              onClick={() => onCategoryToggle(isActive ? null : cat)}
              className={`${baseButtonClass} ${
                isActive
                  ? 'bg-secondary/12 text-secondary shadow-[inset_0_0_0_1px_rgba(76,215,246,0.16)]'
                  : ''
              }`}
            >
              <Icon aria-hidden="true" className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              <span className="sr-only">{label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex-1" />

      <button
        type="button"
        aria-label="Ayarlar"
        className={`${baseButtonClass} mt-2`}
      >
        <Settings aria-hidden="true" className="w-5 h-5" strokeWidth={1.5} />
        <span className="sr-only">Ayarlar</span>
      </button>
    </nav>
  )
}
