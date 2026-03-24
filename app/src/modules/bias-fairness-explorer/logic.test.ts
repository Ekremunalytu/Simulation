import { describe, expect, it } from 'vitest'
import { deriveBiasFairnessExplorerResult } from './logic'

describe('bias fairness explorer logic', () => {
  it('reduces selection rate as the threshold increases', () => {
    const lowThreshold = deriveBiasFairnessExplorerResult({
      scenario: 'loan-approval',
      threshold: 0.42,
      fairnessAdjustment: false,
    })
    const highThreshold = deriveBiasFairnessExplorerResult({
      scenario: 'loan-approval',
      threshold: 0.74,
      fairnessAdjustment: false,
    })

    const lowSelection =
      lowThreshold.snapshots[lowThreshold.selectedThresholdIndex]?.groupMetrics.reduce(
        (sum, metric) => sum + metric.selectionRate,
        0,
      ) ?? 0
    const highSelection =
      highThreshold.snapshots[highThreshold.selectedThresholdIndex]?.groupMetrics.reduce(
        (sum, metric) => sum + metric.selectionRate,
        0,
      ) ?? 0

    expect(highSelection).toBeLessThan(lowSelection)
  })

  it('changes fairness gaps when adjustment is enabled', () => {
    const baseline = deriveBiasFairnessExplorerResult({
      scenario: 'loan-approval',
      threshold: 0.58,
      fairnessAdjustment: false,
    })
    const adjusted = deriveBiasFairnessExplorerResult({
      scenario: 'loan-approval',
      threshold: 0.58,
      fairnessAdjustment: true,
    })

    const baselineGap =
      baseline.snapshots[baseline.selectedThresholdIndex]?.equalOpportunityGap ?? Infinity
    const adjustedGap =
      adjusted.snapshots[adjusted.selectedThresholdIndex]?.equalOpportunityGap ?? Infinity

    expect(adjustedGap).not.toBe(baselineGap)
  })

  it('tracks threshold sweeps for multiple nearby cutoffs', () => {
    const result = deriveBiasFairnessExplorerResult({
      scenario: 'hiring-screen',
      threshold: 0.62,
      fairnessAdjustment: false,
    })

    expect(result.snapshots.length).toBeGreaterThanOrEqual(5)
    expect(result.thresholdSeries).toHaveLength(result.snapshots.length)
  })
})
