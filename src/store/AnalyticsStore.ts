import { makeAutoObservable } from 'mobx'
import type { RootStore } from './index'
import type { HistoricalRun } from '../schemas/QaseHistory.schema'

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
}
