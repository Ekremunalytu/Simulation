import type { Category, Difficulty, RegisteredSimulationModule, RunMode } from '../types/simulation'

export type CourseCategoryKey = 'ai' | 'database' | 'calculus' | 'image-processing'

export interface CourseCategoryMeta {
  title: string
  mappedCategory: Category
  description: string
  comingSoonTitle?: string
  comingSoonDescription?: string
}

export const courseCategoryMeta: Record<CourseCategoryKey, CourseCategoryMeta> = {
  ai: {
    title: 'Yapay Zeka',
    mappedCategory: 'ml',
    description: 'Arama, optimizasyon, öğrenme ve karar verme modülleri.',
  },
  database: {
    title: 'Veri Tabanı Sistemleri',
    mappedCategory: 'database',
    description: 'Sorgu planları, indeksler ve depolama davranışları için ayrılan alan.',
    comingSoonTitle: 'Veri tabanı modülleri yolda',
    comingSoonDescription:
      'Bu ders için interaktif sorgu planlama ve indeks simülasyonları sonraki iterasyonda eklenecek.',
  },
  calculus: {
    title: 'Calculus II',
    mappedCategory: 'math',
    description: 'Limit, türev, integral ve çok değişkenli analiz modülleri.',
  },
  'image-processing': {
    title: 'Görüntü İşleme',
    mappedCategory: 'algorithms',
    description: 'Filtreleme, edge detection ve görüntü uzayı deneyleri için ayrılan alan.',
    comingSoonTitle: 'Görüntü işleme deneyleri hazırlanıyor',
    comingSoonDescription:
      'Bu ders kategorisi için konvolüsyon, histogram ve segmentasyon simülasyonları planlanıyor.',
  },
}

export interface ModuleFilterState {
  query: string
  course: CourseCategoryKey | 'all'
  difficulty: Difficulty | 'all'
  runMode: RunMode | 'all'
  starterOnly: boolean
}

function normalize(value: string) {
  return value.toLocaleLowerCase('tr-TR').trim()
}

export function getCourseCategoryForModule(module: Pick<RegisteredSimulationModule, 'category'>): CourseCategoryKey | null {
  const entry = Object.entries(courseCategoryMeta).find(([, meta]) => meta.mappedCategory === module.category)
  return (entry?.[0] as CourseCategoryKey | undefined) ?? null
}

export function searchModules(modules: RegisteredSimulationModule[], query: string) {
  const normalizedQuery = normalize(query)

  if (!normalizedQuery) {
    return modules
  }

  return modules.filter((module) =>
    [module.title, module.subtitle, module.description, ...module.conceptTags]
      .some((field) => normalize(field).includes(normalizedQuery)),
  )
}

export function filterModules(
  modules: RegisteredSimulationModule[],
  filters: ModuleFilterState,
) {
  return searchModules(modules, filters.query).filter((module) => {
    if (filters.course !== 'all' && getCourseCategoryForModule(module) !== filters.course) {
      return false
    }

    if (filters.difficulty !== 'all' && module.difficulty !== filters.difficulty) {
      return false
    }

    if (filters.runMode !== 'all' && module.runMode !== filters.runMode) {
      return false
    }

    if (filters.starterOnly && !module.recommendedStarter) {
      return false
    }

    return true
  })
}

export function pickFeaturedModule(modules: RegisteredSimulationModule[]) {
  const explicit = modules.find((module) => module.featured)
  if (explicit) {
    return explicit
  }

  const starter = modules.find((module) => module.recommendedStarter)
  if (starter) {
    return starter
  }

  return modules.find((module) => module.difficulty === 'beginner') ?? modules[0]
}

export function getStarterModules(modules: RegisteredSimulationModule[], limit = 4) {
  return modules.filter((module) => module.recommendedStarter).slice(0, limit)
}

export function getDifficultyLabel(difficulty: Difficulty) {
  if (difficulty === 'beginner') {
    return 'Başlangıç'
  }

  if (difficulty === 'intermediate') {
    return 'Orta'
  }

  return 'İleri'
}

export function getRunModeLabel(runMode: RunMode) {
  return runMode === 'timeline' ? 'Zaman Akışlı' : 'Anlık'
}
