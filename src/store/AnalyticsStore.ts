import { makeAutoObservable } from 'mobx'
import type { RootStore } from './index'
import type { HistoricalRun } from '../schemas/QaseHistory.schema'
import type { HistoricalTestRunData } from '../schemas/QaseHistory.schema'
import {
  type FlakinessResult,
  type StabilityStatus,
  MIN_RUNS,
} from '../types/flakiness'
import { AlertItem, MIN_RUNS_REGRESSION } from '../types/alerts'

/**
 * Data point for trend visualization.
 * Contains test statistics and pass rate for a single historical run.
 */
export interface TrendDataPoint {
  runId: string
  timestamp: number
  date: string // formatted for chart display
  passed: number
  failed: number
  skipped: number
  broken: number
  total: number
  passRate: number // percentage 0-100
  duration: number // milliseconds
}

/**
 * MobX store for analytics computations.
 * Provides reactive trend data derived from HistoryStore without recomputing on every render.
 * Uses MobX computed values to cache results and only recompute when dependencies change.
 */
export class AnalyticsStore {
  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * Returns pass rate trend data from history.
   * Data is sorted chronologically (oldest first) for time-series rendering.
   *
   * Computed property automatically updates when history data changes.
   */
  get passRateTrend(): TrendDataPoint[] {
    const history = this.root.historyStore.history
    if (!history || history.runs.length === 0) return []

    return history.runs
      .slice() // don't mutate original
      .sort((a, b) => a.start_time - b.start_time) // oldest first for chart
      .map((run) => this.mapRunToTrendPoint(run))
  }

  /**
   * Returns duration trend data from history.
   * Uses same dataset as passRateTrend - data structure includes both metrics.
   *
   * Computed property automatically updates when history data changes.
   */
  get durationTrend(): TrendDataPoint[] {
    // Same as passRateTrend - data structure includes duration
    return this.passRateTrend
  }

  /**
   * Indicates whether sufficient trend data exists for visualization.
   * Requires at least 2 runs for meaningful trend analysis.
   */
  get hasTrendData(): boolean {
    return this.passRateTrend.length >= 2
  }

  /**
   * Returns signatures of all tests classified as flaky.
   * Useful for filtering test list to show only flaky tests.
   *
   * Computed property automatically updates when history data changes.
   */
  get flakyTests(): string[] {
    const history = this.root.historyStore.history
    if (!history) return []

    return history.tests
      .map((t) => t.signature)
      .filter((sig) => this.getFlakinessScore(sig).status === 'flaky')
  }

  /**
   * Returns the count of flaky tests.
   * Useful for dashboard display.
   *
   * Computed property automatically updates when history data changes.
   */
  get flakyTestCount(): number {
    return this.flakyTests.length
  }

  /**
   * Calculates mean and standard deviation for an array of numbers
   * @private
   */
  private calculateStats(values: number[]): { mean: number; stdDev: number } {
    const n = values.length
    if (n === 0) return { mean: 0, stdDev: 0 }

    const mean = values.reduce((sum, v) => sum + v, 0) / n
    const squaredDiffs = values.map(v => (v - mean) ** 2)
    const variance = squaredDiffs.reduce((sum, v) => sum + v, 0) / n
    const stdDev = Math.sqrt(variance)

    return { mean, stdDev }
  }

  /**
   * Maps a HistoricalRun to a TrendDataPoint.
   * Calculates pass rate percentage and formats date for chart display.
   *
   * @param run - Historical run data from HistoryStore
   * @returns TrendDataPoint with computed metrics
   * @private
   */
  private mapRunToTrendPoint(run: HistoricalRun): TrendDataPoint {
    const { passed, failed, skipped, broken, total } = run.stats

    // Calculate pass rate percentage (0-100)
    // Handle edge case: zero total (passRate = 0)
    const passRate = total > 0 ? (passed / total) * 100 : 0

    // Format date for chart labels using locale-aware formatting
    const date = new Date(run.start_time).toLocaleDateString()

    return {
      runId: run.run_id,
      timestamp: run.start_time,
      date,
      passed,
      failed,
      skipped,
      broken: broken ?? 0,
      total,
      passRate,
      duration: run.duration,
    }
  }

  /**
   * Detects performance regression for a test using 2-sigma outlier detection.
   * A regression is detected when the most recent duration exceeds mean + 2*stdDev.
   *
   * @param signature - Test signature to analyze
   * @returns Object with isRegression flag and stats, or null if insufficient data
   */
  getPerformanceRegression(signature: string): {
    isRegression: boolean
    currentDuration: number
    meanDuration: number
    stdDev: number
    threshold: number
  } | null {
    const runs = this.root.historyStore.getTestHistory(signature)

    // Require minimum runs for statistical validity
    if (runs.length < MIN_RUNS_REGRESSION) {
      return null
    }

    // Sort chronologically, get durations
    const sortedRuns = [...runs].sort((a, b) => a.start_time - b.start_time)
    const durations = sortedRuns.map(r => r.duration)

    // Calculate stats from all BUT the most recent run (to compare against)
    const historicalDurations = durations.slice(0, -1)
    const { mean, stdDev } = this.calculateStats(historicalDurations)

    // Current (most recent) duration
    const currentDuration = durations[durations.length - 1]

    // 2-sigma threshold
    const threshold = mean + 2 * stdDev

    // Detect regression
    const isRegression = currentDuration > threshold && stdDev > 0

    return {
      isRegression,
      currentDuration,
      meanDuration: Math.round(mean),
      stdDev: Math.round(stdDev),
      threshold: Math.round(threshold),
    }
  }

  /**
   * Calculates flakiness score for a specific test using multi-factor analysis.
   * Analyzes status transitions and error message consistency to avoid false positives.
   *
   * Algorithm:
   * 1. Requires minimum 5 runs for accurate detection
   * 2. Counts status transitions (pass<->fail)
   * 3. Analyzes error message consistency across failures
   * 4. Reduces flakiness score if errors are consistent (likely real bug)
   *
   * @param signature - Test signature to analyze
   * @returns FlakinessResult with score, status, and analysis details
   */
  getFlakinessScore(signature: string): FlakinessResult {
    // Get test history from HistoryStore
    const runs = this.root.historyStore.getTestHistory(signature)

    // Check minimum runs requirement (FLKY-04)
    if (runs.length < MIN_RUNS) {
      return {
        flakinessPercent: 0,
        status: 'insufficient_data',
        totalRuns: runs.length,
        statusChanges: 0,
        hasConsistentErrors: false,
        minRunsRequired: MIN_RUNS,
      }
    }

    // Sort runs chronologically for transition analysis
    const sortedRuns = [...runs].sort((a, b) => a.start_time - b.start_time)

    // Count status transitions (pass<->fail)
    // Skip skipped/broken in transition counting (they don't indicate flakiness)
    let statusChanges = 0
    let previousStatus: 'passed' | 'failed' | null = null

    for (const run of sortedRuns) {
      if (run.status === 'skipped' || run.status === 'broken') {
        continue // Don't count skipped/broken in transitions
      }

      if (previousStatus !== null && previousStatus !== run.status) {
        statusChanges++
      }

      previousStatus = run.status
    }

    // Analyze error message consistency
    const failedRuns = sortedRuns.filter((run) => run.status === 'failed')
    let hasConsistentErrors = false

    if (failedRuns.length > 0) {
      // Group errors by first 100 chars (normalize)
      const errorPatterns = new Map<string, number>()

      for (const run of failedRuns) {
        const errorKey = run.error_message
          ? run.error_message.slice(0, 100)
          : '__no_error__'
        errorPatterns.set(errorKey, (errorPatterns.get(errorKey) || 0) + 1)
      }

      // Check if >80% of failures have same error pattern
      const mostCommonErrorCount = Math.max(...errorPatterns.values())
      const consistencyRatio = mostCommonErrorCount / failedRuns.length

      hasConsistentErrors = consistencyRatio > 0.8
    }

    // Calculate flakiness score
    // Base: proportion of possible transitions that occurred
    const possibleTransitions = sortedRuns.length - 1
    let baseScore =
      possibleTransitions > 0 ? statusChanges / possibleTransitions : 0

    // Penalty: If errors are consistent, multiply by 0.5 (likely real bug, not flaky)
    if (hasConsistentErrors) {
      baseScore *= 0.5
    }

    const flakinessPercent = Math.round(baseScore * 100)

    // Determine status
    let status: StabilityStatus

    if (flakinessPercent >= 20) {
      // 20%+ transitions = flaky
      status = 'flaky'
    } else {
      // Check for new_failure pattern: last run failed AND previous 3+ runs passed
      const recentRuns = sortedRuns.slice(-4) // Last 4 runs
      const lastRunFailed = recentRuns[recentRuns.length - 1]?.status === 'failed'
      const previousRunsPassed =
        recentRuns.slice(0, -1).filter((r) => r.status === 'passed').length >= 3

      if (lastRunFailed && previousRunsPassed) {
        status = 'new_failure'
      } else {
        status = 'stable'
      }
    }

    return {
      flakinessPercent,
      status,
      totalRuns: runs.length,
      statusChanges,
      hasConsistentErrors,
      minRunsRequired: MIN_RUNS,
    }
  }
}
