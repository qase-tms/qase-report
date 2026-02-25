import { makeAutoObservable, runInAction } from 'mobx'
import type { RootStore } from './index'
import { QaseRunSchema, type QaseRun } from '../schemas/QaseRun.schema'
import { ParserService } from '../services/ParserService'

/**
 * MobX store for managing run.json data with reactive state.
 * Provides loading states and computed values for UI consumption.
 */
export class ReportStore {
  runData: QaseRun | null = null
  isLoading = false
  error: string | null = null

  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /**
   * Loads and validates run.json file.
   * Updates observable state with loading status and errors.
   *
   * @param file - File object containing run.json data
   */
  async loadRun(file: File): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      const parserService = new ParserService()
      const text = await file.text()
      const validated = await parserService.parseJSON(text, QaseRunSchema)

      runInAction(() => {
        this.runData = validated
      })
    } catch (error) {
      runInAction(() => {
        this.error =
          error instanceof Error ? error.message : 'Failed to load run data'
      })
    } finally {
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  /**
   * Total number of tests in the run.
   * Returns 0 if no run data loaded.
   */
  get totalTests(): number {
    return this.runData?.stats.total || 0
  }

  /**
   * Pass rate percentage (0-100).
   * Returns 0 if no run data or no tests.
   */
  get passRate(): number {
    if (!this.runData || this.runData.stats.total === 0) {
      return 0
    }
    return (this.runData.stats.passed / this.runData.stats.total) * 100
  }

  /**
   * Failed rate percentage (0-100).
   * Returns 0 if no run data or no tests.
   */
  get failedRate(): number {
    if (!this.runData || this.runData.stats.total === 0) {
      return 0
    }
    return (this.runData.stats.failed / this.runData.stats.total) * 100
  }

  /**
   * Skipped rate percentage (0-100).
   * Returns 0 if no run data or no tests.
   */
  get skippedRate(): number {
    if (!this.runData || this.runData.stats.total === 0) {
      return 0
    }
    return (this.runData.stats.skipped / this.runData.stats.total) * 100
  }

  /**
   * Number of blocked tests.
   */
  get blockedCount(): number {
    if (!this.runData) return 0
    return this.runData.stats.blocked ?? 0
  }

  /**
   * Blocked rate percentage (0-100).
   * Returns 0 if no run data or no tests.
   */
  get blockedRate(): number {
    if (!this.runData || this.runData.stats.total === 0) {
      return 0
    }
    return (this.blockedCount / this.runData.stats.total) * 100
  }

  /**
   * Formatted duration as human-readable string (e.g., "1h 23m 45s").
   * Returns "0s" if no run data.
   */
  get formattedDuration(): string {
    if (!this.runData) return '0s'

    const ms = this.runData.execution.duration
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    }
    return `${seconds}s`
  }

  /**
   * Returns pass rates per suite, computed from test results.
   * Groups tests by suite relation, calculates passed/total ratio.
   */
  get suitePassRates(): Array<{ suite: string; passRate: number; total: number; passed: number }> {
    if (!this.runData) return []

    const suiteGroups = new Map<string, { passed: number; total: number }>()

    for (const test of this.root.testResultsStore.resultsList) {
      const suites = test.relations?.suite?.data || []

      for (const suite of suites) {
        const existing = suiteGroups.get(suite.title) || { passed: 0, total: 0 }
        existing.total++
        if (test.execution.status === 'passed') existing.passed++
        suiteGroups.set(suite.title, existing)
      }
    }

    return Array.from(suiteGroups.entries())
      .map(([suite, stats]) => ({
        suite,
        passRate: stats.total > 0 ? (stats.passed / stats.total) * 100 : 0,
        total: stats.total,
        passed: stats.passed,
      }))
      .sort((a, b) => a.passRate - b.passRate) // Worst first for attention
  }
}
