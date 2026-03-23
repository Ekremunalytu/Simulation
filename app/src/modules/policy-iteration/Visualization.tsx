import type { VisualizationProps } from '../../types/simulation'
import { DynamicProgrammingVisualization } from '../shared/DynamicProgrammingVisualization'
import type { PolicyIterationParams, PolicyIterationResult } from './logic'

export function PolicyIterationVisualization({
  result,
  runtime,
}: VisualizationProps<PolicyIterationParams, PolicyIterationResult>) {
  return (
    <DynamicProgrammingVisualization
      result={result}
      title="Policy Iteration"
      frameIndex={runtime.frameIndex}
    />
  )
}
