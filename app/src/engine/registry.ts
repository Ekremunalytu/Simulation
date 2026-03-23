import type { Category, RegisteredSimulationModule } from '../types/simulation'

const modules = new Map<string, RegisteredSimulationModule>()

export function registerModule(mod: RegisteredSimulationModule) {
  modules.set(mod.id, mod)
}

export function getModule(id: string): RegisteredSimulationModule | undefined {
  return modules.get(id)
}

export function getAllModules(): RegisteredSimulationModule[] {
  return Array.from(modules.values()).sort((left, right) => {
    if (left.featured !== right.featured) {
      return Number(right.featured ?? false) - Number(left.featured ?? false)
    }

    if (left.recommendedStarter !== right.recommendedStarter) {
      return Number(right.recommendedStarter ?? false) - Number(left.recommendedStarter ?? false)
    }

    const categoryCompare = left.category.localeCompare(right.category)
    if (categoryCompare !== 0) {
      return categoryCompare
    }

    return left.title.localeCompare(right.title, 'tr')
  })
}

export function getModulesByCategory(category: Category): RegisteredSimulationModule[] {
  return getAllModules().filter((module) => module.category === category)
}

export function getModulesByIds(ids: string[]): RegisteredSimulationModule[] {
  return ids
    .map((id) => getModule(id))
    .filter((module): module is RegisteredSimulationModule => Boolean(module))
}
