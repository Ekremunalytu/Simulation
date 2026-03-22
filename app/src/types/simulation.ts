import type { ComponentType, LazyExoticComponent } from 'react'

export type Category = 'ml' | 'database' | 'math' | 'algorithms' | 'probability'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type SimulationParamValue = number | boolean | string
export type SimulationParamsBase = Record<string, SimulationParamValue>
export type RunMode = 'instant' | 'timeline'
export type PlaybackSpeed = 0.5 | 1 | 2

interface BaseControlDefinition<TParams extends SimulationParamsBase> {
  key: keyof TParams
  label: string
}

export type ControlDefinition<TParams extends SimulationParamsBase> =
  | (BaseControlDefinition<TParams> & {
      type: 'slider'
      min: number
      max: number
      step: number
    })
  | (BaseControlDefinition<TParams> & {
      type: 'toggle'
    })
  | (BaseControlDefinition<TParams> & {
      type: 'select'
      options: { label: string; value: string }[]
    })

export interface PresetConfig<TParams extends SimulationParamsBase> {
  name: string
  params: TParams
}

export interface LearningContent {
  summary: string
  interpretation: string
  warnings: string
  tryNext: string
}

export interface GuidedExperiment {
  title: string
  change: string
  expectation: string
}

export interface SimulationMetric {
  label: string
  value: string
  tone?: 'primary' | 'secondary' | 'tertiary' | 'neutral' | 'warning'
}

export interface SimulationTimelineFrame {
  label: string
}

export interface SimulationTimeline {
  frames: SimulationTimelineFrame[]
}

export interface SimulationResultBase {
  learning: LearningContent
  metrics: SimulationMetric[]
  experiments: GuidedExperiment[]
  timeline?: SimulationTimeline
}

export interface SimulationRuntime {
  runMode: RunMode
  frameIndex: number
  totalFrames: number
  isPlaying: boolean
  speed: PlaybackSpeed
}

export interface VisualizationProps<
  TParams extends SimulationParamsBase,
  TResult extends SimulationResultBase,
> {
  params: TParams
  result: TResult
  runtime: SimulationRuntime
}

export interface SimulationModule<
  TParams extends SimulationParamsBase,
  TResult extends SimulationResultBase,
> {
  id: string
  title: string
  subtitle: string
  category: Category
  description: string
  icon: string
  difficulty: Difficulty
  runMode: RunMode
  defaultParams: TParams
  presets: PresetConfig<TParams>[]
  controlSchema: ControlDefinition<TParams>[]
  formulaTeX?: string
  derive: (params: TParams) => TResult
  VisualizationComponent:
    | ComponentType<VisualizationProps<TParams, TResult>>
    | LazyExoticComponent<ComponentType<VisualizationProps<TParams, TResult>>>
  codeExample?: string
}

export type RegisteredSimulationModule = SimulationModule<
  SimulationParamsBase,
  SimulationResultBase
>

export function defineSimulationModule<
  TParams extends SimulationParamsBase,
  TResult extends SimulationResultBase,
>(module: SimulationModule<TParams, TResult>): RegisteredSimulationModule {
  return module as unknown as RegisteredSimulationModule
}
