import { makeAutoObservable, runInAction } from 'mobx'
import type { RootStore } from './index'
import {
  QaseHistorySchema,
  type QaseHistory,
  type HistoricalRun,
  type HistoricalTestRunData,
} from '../schemas/QaseHistory.schema'
import type { QaseRun } from '../schemas/QaseRun.schema'
import type { QaseTestResult } from '../schemas/QaseTestResult.schema'
import { FileLoaderService } from '../services/FileLoaderService'

/**
 * LocalStorage key for persisting history data.
 */
const HISTORY_STORAGE_KEY = 'qase-report-history'

/**
 * Maximum number of runs to store (memory management).
 * Research shows diminishing returns after 30-50 runs,
 * but we allow 100 for comprehensive historical analysis.
 */
const MAX_RUNS = 100

/**
 * Size threshold for localStorage warning (2MB).
 */
const SIZE_WARNING_THRESHOLD = 2 * 1024 * 1024

/**
 * MobX store for managing test history data with tiered loading.
 * Handles historical run data, localStorage persistence, and memory management.
 *
 * Tiered loading strategy:
 * - Load summary statistics upfront (runs array)
 * - Per-test details available on-demand (tests array)
 * - Limits to MAX_RUNS to prevent memory explosion
 */
export class HistoryStore {
  /**
   * Full history data, nullable before load
   */
  history: QaseHistory | null = null

  /**
   * Tracking state for history load status
   */
  isHistoryLoaded = false

  /**
   * Validation or loading error message
   */
  historyError: string | null = null

  constructor(public root: RootStore) {
    makeAutoObservable(this)
    this.loadFromLocalStorage()
  }

  /**
   * Loads and validates a test-history.json file.
   * Updates observable state and persists to localStorage on success.
   *
   * @param file - File object containing test-history.json data
   */
  async loadHistoryFile(file: File): Promise<void> {
    this.historyError = null

    try {
      const fileLoader = new FileLoaderService()
      const text = await fileLoader.readAsText(file)
      const parsed = JSON.parse(text)
      const validated = QaseHistorySchema.parse(parsed)

      runInAction(() => {
        this.history = validated
        this.isHistoryLoaded = true
        this.historyError = null
      })

      this.saveToLocalStorage()
    } catch (error) {
      runInAction(() => {
        this.historyError =
          error instanceof Error
            ? error.message
            : 'Failed to load history data'
        this.isHistoryLoaded = false
      })
    }
  }

  /**
   * Persists history data to localStorage.
   * Handles quota errors and warns if data exceeds size threshold.
   */
  saveToLocalStorage(): void {
    if (!this.history) return

    try {
      const data = JSON.stringify(this.history)

      // Warn if data exceeds threshold
      if (data.length > SIZE_WARNING_THRESHOLD) {
        console.warn(
          `[HistoryStore] History data exceeds ${SIZE_WARNING_THRESHOLD / (1024 * 1024)}MB (${(data.length / (1024 * 1024)).toFixed(2)}MB). Consider reducing run count.`
        )
      }

      localStorage.setItem(HISTORY_STORAGE_KEY, data)
    } catch (error) {
      runInAction(() => {
        this.historyError =
          error instanceof Error
            ? `LocalStorage error: ${error.message}`
            : 'Failed to save history to localStorage'
      })
    }
  }

  /**
   * Restores history data from localStorage on initialization.
   * Clears storage if validation fails (corrupted data).
   */
  loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem(HISTORY_STORAGE_KEY)
      if (!data) return

      const parsed = JSON.parse(data)
      const validated = QaseHistorySchema.parse(parsed)

      runInAction(() => {
        this.history = validated
        this.isHistoryLoaded = true
      })
    } catch (error) {
      // Clear corrupted data
      localStorage.removeItem(HISTORY_STORAGE_KEY)
      console.warn(
        '[HistoryStore] Cleared corrupted history data from localStorage:',
        error instanceof Error ? error.message : error
      )
    }
  }

  /**
   * Clears all history data and removes from localStorage.
   */
  clearHistory(): void {
    this.history = null
    this.isHistoryLoaded = false
    this.historyError = null
    localStorage.removeItem(HISTORY_STORAGE_KEY)
  }

  /**
   * Appends current run data to history.
   * Creates HistoricalRun and updates per-test history.
   * Limits to MAX_RUNS for memory management.
   *
   * @param run - Current run metadata from QaseRun
   * @param testResults - Map of test results keyed by ID
   */
  addCurrentRun(run: QaseRun, testResults: Map<string, QaseTestResult>): void {
    // Initialize history if empty
    if (!this.history) {
      this.history = {
        schema_version: '1.0.0',
        runs: [],
        tests: [],
      }
    }

    // Create run ID from timestamp or UUID
    const runId = run.execution.start_time
      ? new Date(run.execution.start_time).getTime().toString()
      : `run-${Date.now()}`

    // Check if this run already exists (prevent duplicates)
    if (this.history.runs.some((r) => r.run_id === runId)) {
      return
    }

    // Create historical run entry
    const historicalRun: HistoricalRun = {
      run_id: runId,
      title: run.title ?? null,
      environment: run.environment ?? null,
      start_time: run.execution.start_time
        ? new Date(run.execution.start_time).getTime()
        : Date.now(),
      end_time: run.execution.end_time
        ? new Date(run.execution.end_time).getTime()
        : Date.now(),
      duration: run.execution.duration,
      stats: {
        total: run.stats.total,
        passed: run.stats.passed,
        failed: run.stats.failed,
        skipped: run.stats.skipped,
        blocked: run.stats.blocked,
        invalid: run.stats.invalid,
        muted: run.stats.muted,
      },
    }

    // Add run to history
    this.history.runs.push(historicalRun)

    // Update per-test history
    for (const testResult of testResults.values()) {
      const signature = testResult.signature
      if (!signature) continue

      // Find or create test entry
      let testEntry = this.history.tests.find((t) => t.signature === signature)
      if (!testEntry) {
        testEntry = {
          signature,
          title: testResult.title,
          runs: [],
        }
        this.history.tests.push(testEntry)
      }

      // Extract first line of error message for flakiness detection
      let errorMessage: string | null = null
      if (testResult.execution.stacktrace) {
        const firstLine = testResult.execution.stacktrace.split('\n')[0]
        errorMessage = firstLine?.trim() || null
      }

      // Add run data for this test
      const testRunData: HistoricalTestRunData = {
        run_id: runId,
        status: testResult.execution.status as
          | 'passed'
          | 'failed'
          | 'skipped'
          | 'broken',
        duration: testResult.execution.duration,
        start_time: testResult.execution.start_time
          ? new Date(testResult.execution.start_time).getTime()
          : Date.now(),
        error_message: errorMessage,
      }

      testEntry.runs.push(testRunData)
    }

    // Enforce MAX_RUNS limit (remove oldest runs)
    while (this.history.runs.length > MAX_RUNS) {
      const oldestRun = this.history.runs.shift()
      if (oldestRun) {
        // Remove run data from per-test history
        for (const testEntry of this.history.tests) {
          testEntry.runs = testEntry.runs.filter(
            (r) => r.run_id !== oldestRun.run_id
          )
        }
        // Remove tests with no remaining run data
        this.history.tests = this.history.tests.filter(
          (t) => t.runs.length > 0
        )
      }
    }

    this.isHistoryLoaded = true
    this.saveToLocalStorage()
  }

  /**
   * Returns the most recent runs from history.
   * Provides quick access to recent run summaries.
   */
  get recentRuns(): HistoricalRun[] {
    if (!this.history) return []
    // Return last 10 runs, most recent first
    return [...this.history.runs].reverse().slice(0, 10)
  }

  /**
   * Returns the total number of runs in history.
   */
  get totalRuns(): number {
    return this.history?.runs.length || 0
  }

  /**
   * Returns historical data for a specific test by signature.
   * Enables tiered loading - only fetch per-test details when needed.
   *
   * @param signature - Test signature (stable identifier)
   * @returns Array of run data for the test, or empty array if not found
   */
  getTestHistory(signature: string): HistoricalTestRunData[] {
    if (!this.history) return []

    const testEntry = this.history.tests.find((t) => t.signature === signature)
    return testEntry?.runs || []
  }
}
