import type { VisualizationProps } from '../../types/simulation'
import { DynamicProgrammingVisualization } from '../shared/DynamicProgrammingVisualization'
import type { ValueIterationParams, ValueIterationResult } from './logic'

export function ValueIterationVisualization({
  result,
  runtime,
}: VisualizationProps<ValueIterationParams, ValueIterationResult>) {
  return (
    <DynamicProgrammingVisualization
      result={result}
      title="Value Iteration"
      frameIndex={runtime.frameIndex}
    />
  )
}
