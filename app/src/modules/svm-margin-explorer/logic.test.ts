import { describe, expect, it } from 'vitest'
import { deriveSVMMarginExplorerResult, runLinearSVMTraining } from './logic'

describe('svm margin explorer logic', () => {
  it('tends to produce wider margins on better separated data', () => {
    const lowSeparation = deriveSVMMarginExplorerResult({
      numPoints: 70,
      separation: 1.4,
      noise: 1,
      cValue: 1,
      datasetType: 'borderline',
      kernelMode: 'linear',
    })
    const highSeparation = deriveSVMMarginExplorerResult({
      numPoints: 70,
      separation: 2.8,
      noise: 0.7,
      cValue: 1,
      datasetType: 'separable',
      kernelMode: 'linear',
    })

    expect(highSeparation.finalMarginWidth).toBeGreaterThan(lowSeparation.finalMarginWidth)
  })

  it('marks support vectors consistently in the final snapshot', () => {
    const snapshots = runLinearSVMTraining({
      numPoints: 70,
      separation: 2.4,
      noise: 0.8,
      cValue: 1,
      datasetType: 'separable',
      kernelMode: 'linear',
    })

    const finalSnapshot = snapshots.at(-1)
    expect(finalSnapshot?.supportVectorCount).toBe(
      finalSnapshot?.points.filter((point) => point.isSupportVector).length,
    )
  })

  it('changes the training regime when C changes', () => {
    const lowC = deriveSVMMarginExplorerResult({
      numPoints: 80,
      separation: 1.8,
      noise: 1.2,
      cValue: 0.3,
      datasetType: 'borderline',
      kernelMode: 'linear',
    })
    const highC = deriveSVMMarginExplorerResult({
      numPoints: 80,
      separation: 1.8,
      noise: 1.2,
      cValue: 1.8,
      datasetType: 'borderline',
      kernelMode: 'linear',
    })

    expect(Math.abs(highC.finalSupportVectorCount - lowC.finalSupportVectorCount)).toBeGreaterThanOrEqual(1)
  })
})
