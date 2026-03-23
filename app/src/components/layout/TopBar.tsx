import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
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
    <div
      ref={containerRef}
      className="relative hidden sm:flex items-center bg-surface-container-lowest/70 rounded-full px-4 py-1.5 border border-white/[0.04]"
    >
      <Search className="w-3.5 h-3.5 text-outline mr-2" strokeWidth={1.5} />
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
        placeholder="MODÜL ARA..."
        className="bg-transparent border-none text-xs focus:outline-none placeholder:text-outline/40 w-40 tracking-[0.18em] font-mono text-on-surface"
        aria-label="Modül ara"
      />

      {open && hasQuery ? (
        <div className="absolute top-[calc(100%+10px)] right-0 w-[360px] rounded-[18px] bg-surface-container-low border border-white/[0.06] shadow-2xl shadow-black/30 overflow-hidden">
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((module, index) => (
                <button
                  key={module.id}
                  onClick={() => goToModule(module.id)}
                  className={`w-full rounded-[14px] px-3 py-3 text-left transition-colors ${
                    index === activeIndex
                      ? 'bg-surface-container-high'
                      : 'hover:bg-surface-container-high/80'
                  }`}
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-sm font-medium text-on-surface">
                        {module.title}
                      </span>
                      <span className="block text-xs text-on-surface-variant mt-1">
                        {module.subtitle}
                      </span>
                      <span className="block text-[11px] text-outline mt-2">
                        {getDifficultyLabel(module.difficulty)} · {module.estimatedMinutes} dk
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-outline mt-1" strokeWidth={1.5} />
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-5">
              <p className="text-sm text-on-surface">Sonuç bulunamadı</p>
              <p className="text-xs text-on-surface-variant mt-1">
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
      className="fixed top-0 right-0 z-30 flex justify-between items-center px-6 h-14 bg-black/40 backdrop-blur-xl border-b border-white/[0.04] transition-[left] duration-300"
      style={{ left: `${leftOffset}px` }}
    >
      {tabs && tabs.length > 0 ? (
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={tab.onClick}
              className={`pb-4 pt-4 font-body text-xs tracking-[0.18em] transition-all ${
                tab.active
                  ? 'text-secondary border-b-2 border-secondary'
                  : 'text-outline hover:text-on-surface'
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
