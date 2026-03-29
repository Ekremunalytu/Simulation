import { useDeferredValue, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Search, ArrowRight } from 'lucide-react'
import { getAllModules } from '../engine/registry'
import { SimulationCard } from '../components/simulation/SimulationCard'
import {
  courseCategoryMeta,
  filterModules,
  getCourseCategoryForModule,
  getDifficultyLabel,
  getRunModeLabel,
  pickFeaturedModule,
  type ModuleFilterState,
} from '../engine/catalog'

export function Dashboard() {
  const modules = getAllModules()
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
  const featuredCourse =
    featuredModule ? getCourseCategoryForModule(featuredModule) : null
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
    <div className="mx-auto max-w-[1500px] space-y-10 px-8 pb-12 pt-10">
      <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
        <div className="space-y-5">
          <p className="eyebrow">Öğrenme Laboratuvarı</p>
          <div className="space-y-4">
            <h1 className="font-headline text-4xl font-bold tracking-tight text-on-surface md:text-6xl">
              Simülasyon Merkezi
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">
              Kayıp yüzeyi, türev zinciri, arama ağacı ya da integral bölgesi.
              Çalışma alanı aynı kalır; yalnızca odaklandığın model değişir.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-surface-container-low px-4 py-2 text-sm text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
              {modules.length} interaktif modül
            </span>
            <span className="rounded-full bg-primary/10 px-4 py-2 text-sm text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]">
              Aynı shell içinde hızlı konu geçişi
            </span>
          </div>
        </div>

        {featuredModule ? (
          <Link
            to={`/sim/${featuredModule.id}`}
            className="focus-ring group surface-card data-perimeter relative block overflow-hidden rounded-[28px] p-8 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(208,188,255,0.08)] md:p-10"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(208,188,255,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(76,215,246,0.08),transparent_30%)]" />
            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]">
                  Öne Çıkan
                </span>
                {featuredCourse ? (
                  <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
                    {courseCategoryMeta[featuredCourse].title}
                  </span>
                ) : null}
              </div>

              <div className="max-w-xl space-y-4">
                <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface md:text-4xl">
                  {featuredModule.title}: {featuredModule.subtitle}
                </h2>
                <p className="text-base leading-relaxed text-on-surface-variant">
                  {featuredModule.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
                  {getDifficultyLabel(featuredModule.difficulty)}
                </span>
                <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
                  {getRunModeLabel(featuredModule.runMode)}
                </span>
                <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
                  {featuredModule.estimatedMinutes} dk
                </span>
              </div>

              <span className="inline-flex items-center gap-2 rounded-[16px] bg-gradient-to-br from-primary to-primary-container px-5 py-3 font-headline text-sm font-bold text-on-primary-container shadow-[0_0_22px_rgba(208,188,255,0.22)] transition-[transform,box-shadow] duration-200 group-hover:translate-x-1 group-hover:shadow-[0_0_28px_rgba(208,188,255,0.32)]">
                Simülasyonu Aç
                <ArrowRight aria-hidden="true" className="w-4 h-4" strokeWidth={1.5} />
              </span>
            </div>
          </Link>
        ) : null}
      </section>

      <section className="surface-card relative overflow-hidden rounded-[28px] p-5 md:p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(160,120,255,0.12),transparent_38%),radial-gradient(circle_at_top_right,rgba(76,215,246,0.08),transparent_34%)]" />

        <div className="relative space-y-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-3">
              <div>
                <p className="eyebrow">Katalog</p>
                <h2 className="mt-2 font-headline text-2xl font-semibold tracking-tight md:text-[2rem]">
                  Modülleri filtrele ve karşılaştır
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
                  {filteredModules.length} görünür modül
                </span>
                {activeFilterLabels.length > 0 ? (
                  activeFilterLabels.map((label) => (
                    <span
                      key={label}
                      className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]"
                    >
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-xs text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)]">
                    Tüm katalog görünür
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={clearFilters}
                className="focus-ring rounded-2xl bg-surface-container-low px-4 py-2.5 text-sm text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:bg-surface-container-high hover:text-on-surface"
              >
                Filtreleri Temizle
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen((current) => !current)}
                className="focus-ring inline-flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)] hover:bg-primary/14"
              >
                {filtersOpen ? 'Filtreleri Daralt' : 'Filtreleri Aç'}
                <span className={`transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}>
                  <ChevronDown aria-hidden="true" className="w-4 h-4" strokeWidth={1.5} />
                </span>
              </button>
            </div>
          </div>

          {filtersOpen ? (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
              <label className="surface-panel ghost-outline flex items-center gap-3 rounded-[18px] px-4 py-3">
                <Search aria-hidden="true" className="w-4 h-4 text-outline" strokeWidth={1.5} />
                <input
                  value={filters.query}
                  onChange={(event) => updateFilter('query', event.target.value)}
                  placeholder="Başlık, açıklama veya kavram etiketi ara…"
                  className="focus-ring w-full rounded-xl bg-transparent px-1 text-sm text-on-surface placeholder:text-outline/50"
                  aria-label="Katalog araması"
                />
              </label>

              <select
                value={filters.course}
                onChange={(event) => updateFilter('course', event.target.value as ModuleFilterState['course'])}
                aria-label="Derse göre filtrele"
                className="focus-ring surface-panel ghost-outline rounded-[18px] px-4 py-3 text-sm text-on-surface"
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
                aria-label="Seviyeye göre filtrele"
                className="focus-ring surface-panel ghost-outline rounded-[18px] px-4 py-3 text-sm text-on-surface"
              >
                <option value="all">Tüm seviyeler</option>
                <option value="beginner">Başlangıç</option>
                <option value="intermediate">Orta</option>
                <option value="advanced">İleri</option>
              </select>

              <select
                value={filters.runMode}
                onChange={(event) => updateFilter('runMode', event.target.value as ModuleFilterState['runMode'])}
                aria-label="Akış türüne göre filtrele"
                className="focus-ring surface-panel ghost-outline rounded-[18px] px-4 py-3 text-sm text-on-surface"
              >
                <option value="all">Tüm akışlar</option>
                <option value="timeline">Zaman akışlı</option>
                <option value="instant">Anlık</option>
              </select>

              <button
                type="button"
                onClick={() => updateFilter('starterOnly', !filters.starterOnly)}
                aria-pressed={filters.starterOnly}
                className={`focus-ring rounded-[18px] px-4 py-3 text-sm transition-[background-color,color,box-shadow] duration-200 ${
                  filters.starterOnly
                    ? 'bg-primary/12 text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]'
                    : 'surface-panel text-on-surface-variant shadow-[inset_0_0_0_1px_rgba(125,118,136,0.14)] hover:text-on-surface'
                }`}
              >
                Sadece starter modüller
              </button>
            </div>
          ) : null}

          {filteredModules.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredModules.map((mod, index) => (
                <SimulationCard key={mod.id} module={mod} index={index} />
              ))}
            </div>
          ) : (
            <div className="surface-panel rounded-[24px] px-8 py-10 text-center">
              <h3 className="font-headline text-2xl font-semibold tracking-tight">
                Filtrelerle eşleşen modül bulunamadı
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm text-on-surface-variant">
                Arama metnini sadeleştir ya da ders, seviye ve akış filtrelerini temizleyerek kataloğa geri dön.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="focus-ring mt-6 rounded-2xl bg-primary/12 px-4 py-2.5 text-sm font-medium text-primary shadow-[inset_0_0_0_1px_rgba(208,188,255,0.16)]"
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
