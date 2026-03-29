import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, CornerDownLeft } from 'lucide-react'
import { getAllModules } from '../../engine/registry'
import { getDifficultyLabel, searchModules } from '../../engine/catalog'

interface TopBarProps {
  leftOffset?: number
  tabs?: { label: string; active?: boolean; onClick?: () => void }[]
}

function QuickModuleSearch() {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const modules = getAllModules()

  const results = useMemo(() => searchModules(modules, query).slice(0, 6), [modules, query])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  const hasQuery = query.trim().length > 0

  const goToModule = (moduleId: string) => {
    navigate(`/sim/${moduleId}`)
  }

  return (
    <div ref={containerRef} role="search" className="relative hidden sm:block">
      <div className="surface-panel ghost-outline flex items-center gap-3 rounded-full px-4 py-2">
        <Search aria-hidden="true" className="w-3.5 h-3.5 text-outline" strokeWidth={1.5} />
        <input
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActiveIndex(0)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (!open && event.key === 'ArrowDown' && results.length > 0) {
              setOpen(true)
              return
            }

            if (event.key === 'ArrowDown') {
              event.preventDefault()
              setActiveIndex((current) => (results.length > 0 ? (current + 1) % results.length : 0))
            }

            if (event.key === 'ArrowUp') {
              event.preventDefault()
              setActiveIndex((current) => (results.length > 0 ? (current - 1 + results.length) % results.length : 0))
            }

            if (event.key === 'Enter' && results[activeIndex]) {
              event.preventDefault()
              goToModule(results[activeIndex].id)
            }

            if (event.key === 'Escape') {
              setOpen(false)
            }
          }}
          placeholder="Modül ara…"
          className="focus-ring w-48 rounded-full bg-transparent px-1 py-1 text-xs font-mono tracking-[0.18em] text-on-surface placeholder:text-outline/50"
          aria-label="Modül ara"
          aria-expanded={open && hasQuery}
          aria-controls="quick-module-search-results"
        />
        <span className="rounded-full bg-surface-container-high px-2 py-1 text-[10px] font-mono tracking-[0.16em] text-outline">
          /
        </span>
      </div>

      {open && hasQuery ? (
        <div
          id="quick-module-search-results"
          className="glass absolute top-[calc(100%+12px)] right-0 z-20 w-[380px] overflow-hidden rounded-[22px]"
        >
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((module, index) => (
                <Link
                  key={module.id}
                  to={`/sim/${module.id}`}
                  onClick={() => setOpen(false)}
                  className={`focus-ring block w-full rounded-[16px] px-3 py-3 text-left transition-[background-color,color,transform] duration-200 ${
                    index === activeIndex
                      ? 'bg-surface-container-high text-on-surface'
                      : 'text-on-surface-variant hover:bg-surface-container-high/80 hover:text-on-surface'
                  }`}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-on-surface">
                        {module.title}
                      </span>
                      <span className="mt-1 block text-xs text-on-surface-variant">
                        {module.subtitle}
                      </span>
                      <span className="mt-2 flex items-center gap-2 text-[11px] text-outline">
                        {getDifficultyLabel(module.difficulty)} · {module.estimatedMinutes} dk
                        <CornerDownLeft aria-hidden="true" className="w-3 h-3" strokeWidth={1.5} />
                      </span>
                    </span>
                    <ArrowRight aria-hidden="true" className="mt-1 w-4 h-4 text-outline" strokeWidth={1.5} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5">
              <p className="text-sm text-on-surface">Sonuç bulunamadı</p>
              <p className="mt-1 text-xs text-on-surface-variant">
                Başlık, açıklama veya kavram etiketleri ile yeniden dene.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export function TopBar({ leftOffset = 84, tabs }: TopBarProps) {
  const location = useLocation()

  return (
    <header
      className="fixed top-0 right-0 z-30 flex h-16 items-center justify-between px-6 bg-[linear-gradient(180deg,rgba(8,8,10,0.92),rgba(8,8,10,0.72))] backdrop-blur-xl transition-[left] duration-300"
      style={{ left: `${leftOffset}px` }}
    >
      {tabs && tabs.length > 0 ? (
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className={`focus-ring border-b-2 pb-4 pt-4 font-body text-xs tracking-[0.18em] transition-[color,border-color] duration-200 ${
                tab.active
                  ? 'border-secondary text-secondary'
                  : 'border-transparent text-outline hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      ) : (
        <div />
      )}

      <div className="flex items-center gap-4">
        <QuickModuleSearch key={location.pathname} />
      </div>
    </header>
  )
}
