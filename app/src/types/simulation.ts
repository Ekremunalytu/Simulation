import type { ComponentType } from 'react'

export type Category = 'ml' | 'database' | 'math' | 'algorithms' | 'probability'

export interface ControlDefinition {
  key: string
  label: string
  type: 'slider' | 'toggle' | 'select'
  min?: number
  max?: number
  step?: number
  options?: { label: string; value: string }[]
}

export interface PresetConfig {
  name: string
  params: Record<string, number | boolean | string>
}

export interface SimulationModule {
  id: string
  title: string
  subtitle: string
  category: Category
  description: string
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  defaultParams: Record<string, number | boolean | string>
  presets: PresetConfig[]
  controlSchema: ControlDefinition[]
  formulaTeX?: string
  explanationGenerator: (params: Record<string, any>) => string
  VisualizationComponent: ComponentType<{ params: Record<string, any>; onParamChange?: (key: string, value: any) => void }>
  codeExample?: string
}
