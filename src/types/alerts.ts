/**
 * Alert severity levels - maps to MUI color palette
 */
export type AlertSeverity = 'warning' | 'error' | 'info'

/**
 * Alert type categories
 */
export type AlertType =
  | 'performance_regression' // Duration > mean + 2*stddev
  | 'flaky_warning'          // From flakiness detection
  | 'new_failure'            // From flakiness detection

/**
 * Single alert item for display
 */
export interface AlertItem {
  /** Unique identifier */
  id: string
  /** Alert category */
  type: AlertType
  /** Display severity */
  severity: AlertSeverity
  /** Test signature for navigation */
  testSignature: string
  /** Test title for display */
  testTitle: string
  /** Human-readable message */
  message: string
  /** Additional context (e.g., duration stats) */
  details?: {
    currentDuration?: number
    meanDuration?: number
    stdDev?: number
    threshold?: number
  }
}

/**
 * Minimum runs required for regression detection (same as flakiness)
 */
export const MIN_RUNS_REGRESSION = 5
