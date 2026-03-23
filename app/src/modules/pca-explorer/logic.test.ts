import { describe, expect, it } from 'vitest'
import { derivePCAExplorerResult, type PCAExplorerParams } from './logic'

const baseParams: PCAExplorerParams = {
  sampleCount: 90,
  datasetShape: 'ellipse',
  rotation: 35,
  spreadX: 2.4,
  spreadY: 0.8,
  noise: 0.8,
  componentCount: 1,
}

describe('pca explorer logic', () => {
  it('keeps explained variance ratios normalized', () => {
    const result = derivePCAExplorerResult(baseParams)
    const total = result.explainedVariance.reduce((sum, item) => sum + item.ratio, 0)

    expect(total).toBeCloseTo(1, 5)
  })

  it('orders principal components by variance', () => {
    const result = derivePCAExplorerResult(baseParams)

    expect(result.components[0]!.eigenvalue).toBeGreaterThanOrEqual(result.components[1]!.eigenvalue)
  })

  it('reduces reconstruction error when more components are used', () => {
    const oneComponent = derivePCAExplorerResult(baseParams)
    const twoComponents = derivePCAExplorerResult({ ...baseParams, componentCount: 2 })

    expect(twoComponents.reconstructionError).toBeLessThanOrEqual(oneComponent.reconstructionError)
  })
})
