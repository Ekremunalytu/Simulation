import { describe, expect, it } from 'vitest'
import { getAllModules, getModule } from '../engine/registry'
import { registerAllModules } from './register'

registerAllModules()

describe('registerAllModules', () => {
  it('discovers and registers all simulation modules with metadata', () => {
    const modules = getAllModules()

    expect(modules).toHaveLength(51)
    expect(modules[0]?.id).toBe('gradient-descent')
    expect(modules.some((module) => module.id === 'shared')).toBe(false)
  })

  it('merges metadata and filters invalid relationships safely', () => {
    const gradientDescent = getModule('gradient-descent')

    expect(gradientDescent?.featured).toBe(true)
    expect(gradientDescent?.learningObjectives.length).toBeGreaterThan(0)
    expect(gradientDescent?.nextModuleIds).toEqual(
      expect.arrayContaining(['svm-margin-explorer', 'backpropagation-network']),
    )
    expect(gradientDescent?.nextModuleIds.every((id) => Boolean(getModule(id)))).toBe(true)
  })
})
