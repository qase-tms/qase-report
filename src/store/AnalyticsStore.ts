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
import {
  type StabilityGrade,
  type StabilityResult,
  MIN_RUNS_STABILITY,
  GRADE_THRESHOLDS,
} from '../types/stability'
import type { QaseTestResult } from '../schemas/QaseTestResult.schema'
import type { GalleryAttachment } from '../types/gallery'
import type { Step } from '../schemas/Step.schema'
import type { ComparisonResult, TestDiff, StatusChange, DurationChange } from '../types/comparison'
import { getStatusChangeType } from '../types/comparison'

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
 * Represents a cluster of failed tests sharing similar error messages.
 */
export interface FailureCluster {
  /** Normalized error pattern (first 100 chars, lowercased, whitespace-normalized) */
  errorPattern: string
  /** Tests in this cluster */
  tests: QaseTestResult[]
}

/**
 * MobX store for analytics computations.
 * Provides reactive trend data derived from HistoryStore without recomputing on every render.
 * Uses MobX computed values to cache results and only recompute when dependencies change.
 */
export class AnalyticsStore {
  /** Selected base run ID for comparison (older run) */
  selectedBaseRunId: string | null = null

  /** Selected compare run ID for comparison (newer run) */
  selectedCompareRunId: string | null = null

  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  /** Sets the base run for comparison */
  setSelectedBaseRunId = (runId: string | null) => {
    this.selectedBaseRunId = runId
  }

  /** Sets the compare run for comparison */
  setSelectedCompareRunId = (runId: string | null) => {
    this.selectedCompareRunId = runId
  }

  /** Clears comparison selection */
  clearComparisonSelection = () => {
    this.selectedBaseRunId = null
    this.selectedCompareRunId = null
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
   * Returns all alerts (flakiness + regressions) for dashboard display.
   * Alerts are sorted by severity (error first, then warning).
   *
   * Computed property automatically updates when history data changes.
   */
  get alerts(): AlertItem[] {
    const history = this.root.historyStore.history
    if (!history || history.tests.length === 0) return []

    const alerts: AlertItem[] = []

    for (const test of history.tests) {
      const signature = test.signature

      // Check flakiness (existing logic)
      const flakiness = this.getFlakinessScore(signature)

      if (flakiness.status === 'flaky') {
        alerts.push({
          id: `flaky-${signature}`,
          type: 'flaky_warning',
          severity: 'warning',
          testSignature: signature,
          testTitle: test.title,
          message: `Flaky in ${flakiness.statusChanges} of ${flakiness.totalRuns} runs (${flakiness.flakinessPercent}%)`,
        })
      } else if (flakiness.status === 'new_failure') {
        alerts.push({
          id: `new-failure-${signature}`,
          type: 'new_failure',
          severity: 'error',
          testSignature: signature,
          testTitle: test.title,
          message: `Started failing after ${flakiness.totalRuns - 1} stable runs`,
        })
      }

      // Check performance regression
      const regression = this.getPerformanceRegression(signature)
      if (regression?.isRegression) {
        const pctIncrease = Math.round(
          ((regression.currentDuration - regression.meanDuration) / regression.meanDuration) * 100
        )
        alerts.push({
          id: `regression-${signature}`,
          type: 'performance_regression',
          severity: 'error',
          testSignature: signature,
          testTitle: test.title,
          message: `Duration ${pctIncrease}% above normal (${regression.currentDuration}ms vs ${regression.meanDuration}ms avg)`,
          details: {
            currentDuration: regression.currentDuration,
            meanDuration: regression.meanDuration,
            stdDev: regression.stdDev,
            threshold: regression.threshold,
          },
        })
      }
    }

    // Sort: errors first, then warnings
    return alerts.sort((a, b) => {
      if (a.severity === 'error' && b.severity !== 'error') return -1
      if (a.severity !== 'error' && b.severity === 'error') return 1
      return 0
    })
  }

  /**
   * Returns count of alerts for dashboard badge display.
   */
  get alertCount(): number {
    return this.alerts.length
  }

  /**
   * Indicates whether any alerts exist.
   */
  get hasAlerts(): boolean {
    return this.alerts.length > 0
  }

  /**
   * Returns stability scores for all tests with sufficient data.
   * Tests with <10 runs are excluded (grade N/A).
   *
   * Computed property automatically updates when history data changes.
   */
  get testStabilityMap(): Map<string, StabilityResult> {
    const history = this.root.historyStore.history
    if (!history) return new Map()

    const stabilityMap = new Map<string, StabilityResult>()

    for (const test of history.tests) {
      const result = this.getStabilityScore(test.signature)
      // Only include tests with sufficient data
      if (result.grade !== 'N/A') {
        stabilityMap.set(test.signature, result)
      }
    }

    return stabilityMap
  }

  /**
   * Returns distribution of tests across grade categories.
   * Useful for dashboard widget showing grade breakdown.
   *
   * Computed property automatically updates when history data changes.
   */
  get gradeDistribution(): Record<StabilityGrade, number> {
    const distribution: Record<StabilityGrade, number> = {
      'A+': 0,
      'A': 0,
      'B': 0,
      'C': 0,
      'D': 0,
      'F': 0,
      'N/A': 0,
    }

    for (const result of this.testStabilityMap.values()) {
      distribution[result.grade]++
    }

    return distribution
  }

  /**
   * Returns failed tests grouped by normalized error message similarity.
   * Only returns clusters with 2+ tests (single failures are not clusters).
   * Clusters are sorted by test count descending.
   *
   * Error extraction priority:
   * 1. test.message (user-friendly error)
   * 2. First line of execution.stacktrace (fallback)
   * 3. '__no_error__' (tests without error info)
   *
   * Computed property automatically updates when test results change.
   */
  get failureClusters(): FailureCluster[] {
    const failedTests = this.root.testResultsStore.resultsList
      .filter(test => test.execution.status === 'failed')

    if (failedTests.length === 0) return []

    const clusters = new Map<string, QaseTestResult[]>()

    for (const test of failedTests) {
      // Extract error: prefer message, fallback to first stacktrace line
      const errorSource = test.message
        ?? test.execution.stacktrace?.split('\n')[0]
        ?? null

      const errorKey = this.normalizeErrorMessage(errorSource)

      if (!clusters.has(errorKey)) {
        clusters.set(errorKey, [])
      }
      clusters.get(errorKey)!.push(test)
    }

    // Convert to array, filter single-test "clusters", sort by count desc
    return Array.from(clusters.entries())
      .filter(([_, tests]) => tests.length >= 2)
      .map(([errorPattern, tests]) => ({ errorPattern, tests }))
      .sort((a, b) => b.tests.length - a.tests.length)
  }

  /**
   * Returns count of failure clusters.
   * Useful for sidebar/dashboard badges.
   */
  get failureClusterCount(): number {
    return this.failureClusters.length
  }

  /**
   * Indicates whether any failure clusters exist.
   */
  get hasFailureClusters(): boolean {
    return this.failureClusters.length > 0
  }

  /**
   * Returns all attachments from all tests with test metadata for Gallery view.
   * Collects attachments from both test-level and step-level (recursively) sources.
   *
   * Each attachment includes:
   * - Original attachment data
   * - Test ID, title, and status for navigation/display
   * - Source location (test or step)
   * - Step ID if from step
   *
   * Computed property automatically updates when test results change.
   */
  get galleryAttachments(): GalleryAttachment[] {
    const results: GalleryAttachment[] = []

    for (const test of this.root.testResultsStore.resultsList) {
      const testId = test.id
      const testTitle = test.title
      const testStatus = test.execution.status

      // Collect test-level attachments
      for (const attachment of test.attachments) {
        results.push({
          attachment,
          testId,
          testTitle,
          testStatus,
          source: 'test',
        })
      }

      // Collect step-level attachments (recursive)
      this.collectStepAttachments(test.steps, testId, testTitle, testStatus, results)
    }

    return results
  }

  /**
   * Returns total count of gallery attachments.
   * Useful for sidebar/dashboard badges.
   */
  get galleryAttachmentCount(): number {
    return this.galleryAttachments.length
  }

  /**
   * Indicates whether any gallery attachments exist.
   */
  get hasGalleryAttachments(): boolean {
    return this.galleryAttachments.length > 0
  }

  /**
   * Returns comparison result between two selected runs.
   * Uses Map-based O(n+m) algorithm for efficient diff computation.
   * Returns null if either run is not selected or not found.
   *
   * Computed property automatically updates when selections or history change.
   */
  get comparison(): ComparisonResult | null {
    if (!this.selectedBaseRunId || !this.selectedCompareRunId) return null

    const history = this.root.historyStore.history
    if (!history) return null

    const baseRun = history.runs.find(r => r.run_id === this.selectedBaseRunId)
    const compareRun = history.runs.find(r => r.run_id === this.selectedCompareRunId)

    if (!baseRun || !compareRun) return null

    return this.computeComparison(baseRun, compareRun)
  }

  /**
   * Indicates whether a valid comparison is available.
   */
  get hasComparison(): boolean {
    return this.comparison !== null
  }

  /**
   * Returns runs available for comparison selection.
   * Limited to most recent 20 runs for dropdown usability.
   */
  get comparableRuns(): HistoricalRun[] {
    const history = this.root.historyStore.history
    if (!history) return []

    return [...history.runs]
      .sort((a, b) => b.start_time - a.start_time) // Most recent first
      .slice(0, 20)
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
   * Calculates duration coefficient of variation (CV).
   * CV measures duration consistency - lower is better.
   *
   * Formula: CV = (stdDev / mean) * 100
   * Result is capped at 100% to prevent extreme variance from infinitely penalizing score.
   *
   * @param durations - Array of test durations in milliseconds
   * @returns CV as percentage (0-100)
   * @private
   */
  private calculateDurationCV(durations: number[]): number {
    const { mean, stdDev } = this.calculateStats(durations)

    // Handle edge case: if mean is 0, no variance exists
    if (mean === 0) return 0

    // Calculate CV as percentage
    const cv = (stdDev / mean) * 100

    // Cap at 100% for scoring purposes
    return Math.min(cv, 100)
  }

  /**
   * Maps composite score (0-100) to letter grade.
   * Uses GRADE_THRESHOLDS from stability.ts.
   *
   * @param score - Composite stability score (0-100)
   * @returns Letter grade (A+ to F)
   * @private
   */
  private scoreToGrade(score: number): StabilityGrade {
    if (score >= GRADE_THRESHOLDS['A+']) return 'A+'
    if (score >= GRADE_THRESHOLDS['A']) return 'A'
    if (score >= GRADE_THRESHOLDS['B']) return 'B'
    if (score >= GRADE_THRESHOLDS['C']) return 'C'
    if (score >= GRADE_THRESHOLDS['D']) return 'D'
    return 'F'
  }

  /**
   * Normalizes an error message for clustering comparison.
   * Takes first 100 chars, normalizes whitespace and case.
   *
   * @param message - Raw error message or null
   * @returns Normalized string key for clustering
   * @private
   */
  private normalizeErrorMessage(message: string | null): string {
    if (!message) return '__no_error__'

    return message
      .slice(0, 100)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
  }

  /**
   * Recursively collects attachments from step hierarchy.
   * Steps can contain nested steps, so this method traverses the tree.
   *
   * @param steps - Array of steps to process
   * @param testId - Test ID for navigation
   * @param testTitle - Test title for display
   * @param testStatus - Test execution status
   * @param collector - Array to push collected attachments into
   * @private
   */
  private collectStepAttachments(
    steps: Step[],
    testId: string,
    testTitle: string,
    testStatus: 'passed' | 'failed' | 'skipped' | 'broken',
    collector: GalleryAttachment[]
  ): void {
    for (const step of steps) {
      // Collect attachments from this step
      for (const attachment of step.execution.attachments) {
        collector.push({
          attachment,
          testId,
          testTitle,
          testStatus,
          source: 'step',
          stepId: step.id,
        })
      }

      // Recursively collect from nested steps
      if (step.steps && step.steps.length > 0) {
        this.collectStepAttachments(step.steps, testId, testTitle, testStatus, collector)
      }
    }
  }

  /**
   * Computes diff between two runs using Map-based set operations.
   * O(n+m) complexity where n=base tests, m=compare tests.
   *
   * @private
   */
  private computeComparison(baseRun: HistoricalRun, compareRun: HistoricalRun): ComparisonResult {
    const history = this.root.historyStore.history!

    // Build Maps for O(1) lookup by signature
    const baseTestsMap = new Map<string, { signature: string; title: string; status: string; duration: number }>()
    const compareTestsMap = new Map<string, { signature: string; title: string; status: string; duration: number }>()

    for (const testEntry of history.tests) {
      const baseRunData = testEntry.runs.find(r => r.run_id === baseRun.run_id)
      const compareRunData = testEntry.runs.find(r => r.run_id === compareRun.run_id)

      if (baseRunData) {
        baseTestsMap.set(testEntry.signature, {
          signature: testEntry.signature,
          title: testEntry.title,
          status: baseRunData.status,
          duration: baseRunData.duration,
        })
      }

      if (compareRunData) {
        compareTestsMap.set(testEntry.signature, {
          signature: testEntry.signature,
          title: testEntry.title,
          status: compareRunData.status,
          duration: compareRunData.duration,
        })
      }
    }

    // Calculate diff
    const added: TestDiff['added'] = []
    const removed: TestDiff['removed'] = []
    const statusChanged: StatusChange[] = []
    const durationChanged: DurationChange[] = []
    let unchangedCount = 0

    // Find added tests (in compare but not in base)
    for (const [signature, test] of compareTestsMap) {
      if (!baseTestsMap.has(signature)) {
        added.push(test)
      }
    }

    // Find removed tests (in base but not in compare)
    for (const [signature, test] of baseTestsMap) {
      if (!compareTestsMap.has(signature)) {
        removed.push(test)
      }
    }

    // Find changed tests (in both)
    for (const [signature, baseTest] of baseTestsMap) {
      const compareTest = compareTestsMap.get(signature)
      if (!compareTest) continue

      let hasChange = false

      // Check status change
      if (baseTest.status !== compareTest.status) {
        hasChange = true
        statusChanged.push({
          signature,
          title: baseTest.title,
          oldStatus: baseTest.status as StatusChange['oldStatus'],
          newStatus: compareTest.status as StatusChange['newStatus'],
          changeType: getStatusChangeType(baseTest.status, compareTest.status),
        })
      }

      // Check duration change (significant = >20% or >500ms)
      const difference = compareTest.duration - baseTest.duration
      const percentChange = baseTest.duration > 0
        ? (difference / baseTest.duration) * 100
        : 0
      const isSignificant = Math.abs(percentChange) > 20 || Math.abs(difference) > 500

      if (isSignificant) {
        hasChange = true
        durationChanged.push({
          signature,
          title: baseTest.title,
          oldDuration: baseTest.duration,
          newDuration: compareTest.duration,
          difference,
          percentChange,
          isSignificant,
        })
      }

      if (!hasChange) {
        unchangedCount++
      }
    }

    // Build summary
    const regressionCount = statusChanged.filter(c => c.changeType === 'regression').length
    const fixedCount = statusChanged.filter(c => c.changeType === 'fixed').length

    return {
      baseRun,
      compareRun,
      diff: {
        added,
        removed,
        statusChanged,
        durationChanged,
        unchangedCount,
      },
      summary: {
        totalBase: baseTestsMap.size,
        totalCompare: compareTestsMap.size,
        addedCount: added.length,
        removedCount: removed.length,
        statusChangedCount: statusChanged.length,
        durationChangedCount: durationChanged.length,
        regressionCount,
        fixedCount,
      },
    }
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
   * Calculates comprehensive stability score for a test using weighted multi-factor analysis.
   *
   * Algorithm:
   * 1. Requires minimum 10 runs for accurate scoring (vs 5 for flakiness)
   * 2. Calculates three metrics:
   *    - Pass rate: % of runs that passed
   *    - Flakiness: From getFlakinessScore (status transitions)
   *    - Duration CV: Coefficient of variation (consistency)
   * 3. Computes weighted composite score:
   *    score = passRate*0.5 + (100-flakinessPercent)*0.3 + (100-durationCV)*0.2
   * 4. Maps score to letter grade (A+ to F)
   *
   * @param signature - Test signature to analyze
   * @returns StabilityResult with grade, score, and underlying metrics
   */
  getStabilityScore(signature: string): StabilityResult {
    const runs = this.root.historyStore.getTestHistory(signature)

    // Check minimum runs requirement
    if (runs.length < MIN_RUNS_STABILITY) {
      return {
        grade: 'N/A',
        score: 0,
        passRate: 0,
        flakinessPercent: 0,
        durationCV: 0,
        totalRuns: runs.length,
        minRunsRequired: MIN_RUNS_STABILITY,
      }
    }

    // Calculate pass rate
    const passedCount = runs.filter((r) => r.status === 'passed').length
    const passRate = (passedCount / runs.length) * 100

    // Get flakiness percentage from existing method
    const flakiness = this.getFlakinessScore(signature)
    const flakinessPercent = flakiness.flakinessPercent

    // Calculate duration CV
    const durations = runs.map((r) => r.duration)
    const durationCV = this.calculateDurationCV(durations)

    // Calculate composite score (weighted)
    // Pass rate: 50%, Stability (100-flakiness): 30%, Consistency (100-CV): 20%
    const score = passRate * 0.5 + (100 - flakinessPercent) * 0.3 + (100 - durationCV) * 0.2

    // Clamp score to 0-100 range
    const clampedScore = Math.max(0, Math.min(100, score))

    // Determine grade
    const grade = this.scoreToGrade(clampedScore)

    return {
      grade,
      score: Math.round(clampedScore),
      passRate: Math.round(passRate),
      flakinessPercent,
      durationCV: Math.round(durationCV),
      totalRuns: runs.length,
      minRunsRequired: MIN_RUNS_STABILITY,
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
