import type { SimulationModule } from '../types/simulation'

const modules: Map<string, SimulationModule> = new Map()

export function registerModule(mod: SimulationModule) {
  modules.set(mod.id, mod)
}

export function getModule(id: string): SimulationModule | undefined {
  return modules.get(id)
}

export function getAllModules(): SimulationModule[] {
  return Array.from(modules.values())
}

export function getModulesByCategory(category: string): SimulationModule[] {
  return getAllModules().filter((m) => m.category === category)
}
