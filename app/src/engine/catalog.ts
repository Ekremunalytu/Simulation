import type { Category, Difficulty, RegisteredSimulationModule, RunMode } from '../types/simulation'

export type CourseCategoryKey = 'ai' | 'database' | 'calculus' | 'image-processing'

export interface CourseCategoryMeta {
  title: string
  mappedCategory: Category
  description: string
  status?: 'active' | 'planned'
  comingSoonTitle?: string
  comingSoonDescription?: string
  roadmapBullets?: string[]
}

export const courseCategoryMeta: Record<CourseCategoryKey, CourseCategoryMeta> = {
  ai: {
    title: 'Yapay Zeka',
    mappedCategory: 'ml',
    description: 'Arama, optimizasyon, öğrenme ve karar verme modülleri.',
    status: 'active',
  },
  database: {
    title: 'Veri Tabanı Sistemleri',
    mappedCategory: 'database',
    description: 'Sorgu planları, indeksler ve depolama davranışları için ayrılan alan.',
    status: 'planned',
    comingSoonTitle: 'Veri tabanı modülleri yolda',
    comingSoonDescription:
      'Bu ders için interaktif sorgu planlama ve indeks simülasyonları sonraki iterasyonda eklenecek.',
    roadmapBullets: [
      'B+ tree ve hash index karşılaştırmaları',
      'JOIN stratejileri ve sorgu planı görselleştirmeleri',
      'Buffer manager ve disk erişim maliyeti deneyleri',
    ],
  },
  calculus: {
    title: 'Calculus II',
    mappedCategory: 'math',
    description: 'Limit, türev, integral ve çok değişkenli analiz modülleri.',
    status: 'active',
  },
  'image-processing': {
    title: 'Görüntü İşleme',
    mappedCategory: 'algorithms',
    description: 'Filtreleme, edge detection ve görüntü uzayı deneyleri için ayrılan alan.',
    status: 'planned',
    comingSoonTitle: 'Görüntü işleme deneyleri hazırlanıyor',
    comingSoonDescription:
      'Bu ders kategorisi için konvolüsyon, histogram ve segmentasyon simülasyonları planlanıyor.',
    roadmapBullets: [
      'Konvolüsyon çekirdekleri ve frekans etkisi',
      'Histogram eşitleme ve yoğunluk dönüşümleri',
      'Edge detection ve segmentasyon eşik deneyleri',
    ],
  },
}

export interface CourseSyllabusWeek {
  week: number
  topic: string
  kind?: 'lecture' | 'overview' | 'exam' | 'review'
  note?: string
}

export interface CourseSyllabus {
  course: CourseCategoryKey
  title: string
  summary: string
  weeks: CourseSyllabusWeek[]
}

export const courseSyllabus: Partial<Record<CourseCategoryKey, CourseSyllabus>> = {
  ai: {
    course: 'ai',
    title: 'Yapay Zeka Haftalık Akış',
    summary: 'Arama yöntemlerinden üretici yapay zeka ve etik tartışmalarına uzanan çekirdek ders akışı.',
    weeks: [
      { week: 1, topic: 'Ders Tanıtımı', kind: 'overview', note: 'Konu çerçevesi ve problem sınıfları' },
      { week: 2, topic: 'Yapay Zeka Tarihçesi', kind: 'overview', note: 'Kısa tarihçe ve yöntem seçimi' },
      { week: 3, topic: 'Kör Arama Algoritmaları' },
      { week: 4, topic: 'Sezgisel Arama Algoritmaları' },
      { week: 5, topic: 'Lokal Arama Algoritmaları' },
      { week: 6, topic: 'Genetik Algoritmalar' },
      { week: 7, topic: 'Oyun Algoritmaları' },
      { week: 8, topic: 'Ara Sınav 1', kind: 'exam' },
      { week: 9, topic: 'Bilgi Gösterimi' },
      { week: 10, topic: 'Makine Öğrenmesi Algoritmaları-1' },
      { week: 11, topic: 'Makine Öğrenmesi Algoritmaları-2' },
      { week: 12, topic: 'Pekiştirmeli Öğrenme' },
      { week: 13, topic: 'Üretici Yapay Zeka-1' },
      { week: 14, topic: 'Üretici Yapay Zeka-2' },
      { week: 15, topic: 'Yapay Zeka Sistemlerinde Etik ve Yanlılık' },
      { week: 16, topic: 'Final', kind: 'exam' },
    ],
  },
  calculus: {
    course: 'calculus',
    title: 'Matematik 2 Haftalık Akış',
    summary: 'Çok değişkenli analizden katlı integrallere, dizi-serilerden Taylor uygulamalarına uzanan dönem planı.',
    weeks: [
      { week: 1, topic: 'Çok Değişkenli Fonksiyonlar, Limit ve Süreklilik' },
      { week: 2, topic: 'Kuadratik Yüzeyler ve Kısmi Türevler' },
      { week: 3, topic: 'Zincir Kuralı, Kapalı Türev, Yönlü Türev ve Gradyan' },
      { week: 4, topic: 'Teğet Düzlem, Diferansiyeller ve Ekstremum' },
      { week: 5, topic: 'Dikdörtgensel Bölgelerde İki Katlı İntegraller' },
      { week: 6, topic: 'Genel Bölgeler ve Fubini Teoremi' },
      { week: 7, topic: 'Kutupsal Formda İki Katlı İntegraller' },
      { week: 8, topic: 'Ara Sınav 1', kind: 'exam' },
      { week: 9, topic: 'Değişken Dönüşümü, Vektör Değerli Fonksiyonlar ve Yay Uzunluğu' },
      { week: 10, topic: 'Eğrisel İntegraller ve Sonsuz Diziler' },
      { week: 11, topic: 'Monoton Diziler ve Pozitif Terimli Seriler' },
      { week: 12, topic: 'Karşılaştırma, Oran, Kök ve Alterne Seri Testleri' },
      { week: 13, topic: 'Kuvvet Serileri ile Taylor/Maclaurin Serileri' },
      { week: 14, topic: 'Taylor Serisinin Uygulamaları' },
      { week: 15, topic: 'Genel Uygulamalar', kind: 'review', note: 'Toparlayıcı tekrar ve bağlantı haftası' },
      { week: 16, topic: 'Final', kind: 'exam' },
    ],
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

export function getModulesForCourse(
  modules: RegisteredSimulationModule[],
  course: CourseCategoryKey,
) {
  return modules.filter((module) => getCourseCategoryForModule(module) === course)
}

export function getModulesForCourseWeek(
  modules: RegisteredSimulationModule[],
  course: CourseCategoryKey,
  week: number,
) {
  return getModulesForCourse(modules, course).filter((module) => module.syllabusWeeks?.includes(week))
}

export function getSyllabusForCourse(course: CourseCategoryKey) {
  return courseSyllabus[course] ?? null
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
