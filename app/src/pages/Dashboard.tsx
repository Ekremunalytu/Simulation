import { useDeferredValue, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Search } from 'lucide-react'
import { getAllModules } from '../engine/registry'
import { SimulationCard } from '../components/simulation/SimulationCard'
import {
  courseCategoryMeta,
  filterModules,
  getDifficultyLabel,
  getRunModeLabel,
  pickFeaturedModule,
  type ModuleFilterState,
} from '../engine/catalog'

export function Dashboard() {
  const modules = getAllModules()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<ModuleFilterState>({
    query: '',
    course: 'all',
    difficulty: 'all',
    runMode: 'all',
    starterOnly: false,
  })
  const [filtersOpen, setFiltersOpen] = useState(true)
  const deferredQuery = useDeferredValue(filters.query)

  const filteredModules = useMemo(
    () => filterModules(modules, { ...filters, query: deferredQuery }),
    [deferredQuery, filters, modules],
  )
  const featuredModule = pickFeaturedModule(modules)
  const activeFilterLabels = [
    filters.query ? `Arama: ${filters.query}` : null,
    filters.course !== 'all' ? courseCategoryMeta[filters.course].title : null,
    filters.difficulty !== 'all' ? getDifficultyLabel(filters.difficulty) : null,
    filters.runMode !== 'all' ? getRunModeLabel(filters.runMode) : null,
    filters.starterOnly ? 'Starter modüller' : null,
  ].filter((label): label is string => Boolean(label))

  const updateFilter = <K extends keyof ModuleFilterState>(key: K, value: ModuleFilterState[K]) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      course: 'all',
      difficulty: 'all',
      runMode: 'all',
      starterOnly: false,
    })
  }

  return (
    <div className="p-8 max-w-[1480px] mx-auto space-y-8">
      <div className="space-y-4 pt-4">
        <p className="eyebrow">Öğrenme Laboratuvarı</p>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
          Simülasyon Merkezi
        </h1>
        <p className="text-on-surface-variant text-base max-w-2xl">
          Aynı koyu laboratuvar estetiğini koruyan, daha ferah ve okunaklı bir katalog. Her modül tek bir kavrama odaklanır, detaylar içeride açılır.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant border border-white/[0.05]">
          <span className="w-2 h-2 rounded-full bg-primary" />
          {modules.length} interaktif simülasyon modülü
        </div>
      </div>

      {featuredModule ? (
        <div
          className="group relative overflow-hidden rounded-[18px] surface-card data-perimeter p-8 md:p-10 cursor-pointer border border-white/[0.05]"
          onClick={() => navigate(`/sim/${featuredModule.id}`)}
        >
          <div className="absolute top-0 right-0 p-6">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              Öne Çıkan
            </span>
          </div>
          <div className="relative z-10 max-w-lg">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight mb-4 group-hover:text-primary transition-colors">
              {featuredModule.title}: {featuredModule.subtitle}
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed mb-8">
              {featuredModule.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs text-on-surface-variant">
                {getDifficultyLabel(featuredModule.difficulty)}
              </span>
              <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs text-on-surface-variant">
                {getRunModeLabel(featuredModule.runMode)}
              </span>
              <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs text-on-surface-variant">
                {featuredModule.estimatedMinutes} dk
              </span>
            </div>
            <button className="px-6 py-3 rounded-[14px] bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-headline font-bold text-sm flex items-center gap-2 hover:shadow-[0_0_20px_#d0bcff33] transition-all">
              Simülasyonu Başlat →
            </button>
          </div>
          <div className="absolute bottom-0 right-0 w-1/2 h-full opacity-30 pointer-events-none overflow-hidden">
            <svg className="w-full h-full text-secondary opacity-40" viewBox="0 0 400 300">
              <path d="M 50 250 Q 150 50 250 200 T 400 100" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="250" cy="200" fill="currentColor" r="4" />
            </svg>
          </div>
        </div>
      ) : null}

      <section className="relative overflow-hidden rounded-[22px] surface-card border border-white/[0.05]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(160,120,255,0.12),transparent_38%),radial-gradient(circle_at_top_right,rgba(76,215,246,0.08),transparent_34%)] pointer-events-none" />

        <div className="relative p-5 md:p-6 space-y-5">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="space-y-3">
              <div>
                <p className="eyebrow">Katalog</p>
                <h2 className="font-headline text-2xl md:text-[2rem] font-semibold tracking-tight mt-2">
                  Modülleri filtrele ve karşılaştır
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs text-on-surface-variant border border-white/[0.04]">
                  {filteredModules.length} görünür modül
                </span>
                {activeFilterLabels.length > 0 ? (
                  activeFilterLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant border border-white/[0.04]"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant border border-white/[0.04]">
                    Tüm katalog görünür
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={clearFilters}
                className="rounded-2xl bg-surface-container-low px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                Filtreleri Temizle
              </button>
              <button
                onClick={() => setFiltersOpen((current) => !current)}
                className="rounded-2xl bg-primary/10 text-primary px-4 py-2.5 text-sm font-medium inline-flex items-center gap-2 border border-primary/20 hover:bg-primary/14 transition-colors"
              >
                {filtersOpen ? 'Filtreleri Daralt' : 'Filtreleri Aç'}
                <span
                  className={`transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
                >
                  <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
                </span>
              </button>
            </div>
          </div>

          {filtersOpen ? (
            <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))] gap-3">
              <label className="rounded-[16px] bg-surface-container-low px-4 py-3 border border-white/[0.04] flex items-center gap-3">
                <Search className="w-4 h-4 text-outline" strokeWidth={1.5} />
                <input
                  value={filters.query}
                  onChange={(event) => updateFilter('query', event.target.value)}
                  placeholder="Başlık, açıklama veya kavram etiketi ara"
                  className="w-full bg-transparent text-sm text-on-surface placeholder:text-outline/50 focus:outline-none"
                  aria-label="Katalog araması"
                />
              </label>

              <select
                value={filters.course}
                onChange={(event) => updateFilter('course', event.target.value as ModuleFilterState['course'])}
                className="rounded-[16px] bg-surface-container-low px-4 py-3 border border-white/[0.04] text-sm text-on-surface focus:outline-none"
              >
                <option value="all">Tüm dersler</option>
                {Object.entries(courseCategoryMeta).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.title}
                  </option>
                ))}
              </select>

              <select
                value={filters.difficulty}
                onChange={(event) =>
                  updateFilter('difficulty', event.target.value as ModuleFilterState['difficulty'])
                }
                className="rounded-[16px] bg-surface-container-low px-4 py-3 border border-white/[0.04] text-sm text-on-surface focus:outline-none"
              >
                <option value="all">Tüm seviyeler</option>
                <option value="beginner">Başlangıç</option>
                <option value="intermediate">Orta</option>
                <option value="advanced">İleri</option>
              </select>

              <select
                value={filters.runMode}
                onChange={(event) => updateFilter('runMode', event.target.value as ModuleFilterState['runMode'])}
                className="rounded-[16px] bg-surface-container-low px-4 py-3 border border-white/[0.04] text-sm text-on-surface focus:outline-none"
              >
                <option value="all">Tüm akışlar</option>
                <option value="timeline">Zaman akışlı</option>
                <option value="instant">Anlık</option>
              </select>

              <button
                onClick={() => updateFilter('starterOnly', !filters.starterOnly)}
                className={`rounded-[16px] px-4 py-3 border text-sm transition-colors ${
                  filters.starterOnly
                    ? 'bg-primary/12 text-primary border-primary/20'
                    : 'bg-surface-container-low text-on-surface-variant border-white/[0.04] hover:text-on-surface'
                }`}
              >
                Sadece starter modüller
              </button>
            </div>
          ) : null}

          {filteredModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModules.map((mod, index) => (
                <SimulationCard key={mod.id} module={mod} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] border border-white/[0.05] bg-surface-container-low/60 p-8 text-center">
              <h3 className="font-headline text-2xl font-semibold tracking-tight">
                Filtrelerle eşleşen modül bulunamadı
              </h3>
              <p className="text-sm text-on-surface-variant max-w-xl mx-auto mt-3">
                Arama metnini sadeleştir ya da ders, seviye ve akış filtrelerini temizleyerek kataloğa geri dön.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 rounded-2xl bg-primary/12 text-primary px-4 py-2.5 text-sm font-medium"
              >
                Tüm filtreleri sıfırla
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
