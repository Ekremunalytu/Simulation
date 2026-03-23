import { registerModule } from '../engine/registry'
import { getSimulationModuleMetadata } from './metadata'
import type { RegisteredSimulationModule, UnregisteredSimulationModule } from '../types/simulation'

const moduleNamespaces = import.meta.glob('./*/index.ts', { eager: true }) as Record<
  string,
  Record<string, unknown>
>

let registered = false

function isUnregisteredSimulationModule(value: unknown): value is UnregisteredSimulationModule {
  if (!value || typeof value !== 'object') {
    return false
  }

  return (
    'id' in value &&
    'title' in value &&
    'category' in value &&
    'derive' in value &&
    'VisualizationComponent' in value
  )
}

function extractModule(namespace: Record<string, unknown>, path: string) {
  const candidate = Object.values(namespace).find((value) => isUnregisteredSimulationModule(value))

  if (!candidate) {
    throw new Error(`Simulation module export not found for ${path}`)
  }

  return candidate
}

function enrichModule(module: UnregisteredSimulationModule): RegisteredSimulationModule {
  return {
    ...module,
    ...getSimulationModuleMetadata(module.id),
  }
}

function compareModules(left: RegisteredSimulationModule, right: RegisteredSimulationModule) {
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
}

export function registerAllModules() {
  if (registered) {
    return
  }

  const enrichedModules = Object.entries(moduleNamespaces)
    .map(([path, namespace]) => enrichModule(extractModule(namespace, path)))
    .sort(compareModules)

  const validIds = new Set(enrichedModules.map((module) => module.id))

  for (const module of enrichedModules) {
    registerModule({
      ...module,
      prerequisiteModuleIds: module.prerequisiteModuleIds.filter((id) => validIds.has(id)),
      nextModuleIds: module.nextModuleIds.filter((id) => validIds.has(id)),
    })
  }

  registered = true
}
