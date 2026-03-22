import type { Category, RegisteredSimulationModule } from '../types/simulation'

const modules = new Map<string, RegisteredSimulationModule>()

export function registerModule(mod: RegisteredSimulationModule) {
  modules.set(mod.id, mod)
}

export function getModule(id: string): RegisteredSimulationModule | undefined {
  return modules.get(id)
}

export function getAllModules(): RegisteredSimulationModule[] {
  return Array.from(modules.values())
}

export function getModulesByCategory(category: Category): RegisteredSimulationModule[] {
  return getAllModules().filter((module) => module.category === category)
}
