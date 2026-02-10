/**
 * Minimum number of runs required for accurate flakiness detection.
 * Below this threshold, insufficient data exists to classify flakiness.
 */
export const MIN_RUNS = 5

/**
 * Stability status categories for test health.
 * - flaky: Test alternates between pass/fail inconsistently
 * - stable: Test consistently passes or fails
 * - new_failure: Test recently started failing after being stable
 * - insufficient_data: Less than MIN_RUNS (5) available
 */
export type StabilityStatus =
  | 'flaky'
  | 'stable'
  | 'new_failure'
  | 'insufficient_data'

/**
 * Result of flakiness analysis for a single test.
 */
export interface FlakinessResult {
  /** Flakiness percentage (0-100) - "flaky in X of Y runs" */
  flakinessPercent: number
  /** Stability classification */
  status: StabilityStatus
  /** Number of runs analyzed */
  totalRuns: number
  /** Number of status transitions (pass->fail or fail->pass) */
  statusChanges: number
  /** Whether error messages are consistent across failures */
  hasConsistentErrors: boolean
  /** Minimum runs required for accurate detection */
  minRunsRequired: number
}
