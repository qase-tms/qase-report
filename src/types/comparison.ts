import type { HistoricalTestRunData, HistoricalRun } from '../schemas/QaseHistory.schema'

/** Status transition between runs (e.g., passed -> failed) */
export interface StatusChange {
  signature: string
  title: string
  oldStatus: 'passed' | 'failed' | 'skipped' | 'broken'
  newStatus: 'passed' | 'failed' | 'skipped' | 'broken'
  /** 'regression' if passed->failed, 'fixed' if failed->passed, 'other' otherwise */
  changeType: 'regression' | 'fixed' | 'other'
}

/** Duration change between runs */
export interface DurationChange {
  signature: string
  title: string
  oldDuration: number
  newDuration: number
  /** Difference in ms (positive = slower, negative = faster) */
  difference: number
  /** Percentage change (positive = slower, negative = faster) */
  percentChange: number
  /** true if change exceeds threshold (>20% or >500ms) */
  isSignificant: boolean
}

/** Test diff categories */
export interface TestDiff {
  /** Tests in compare run but not in base run */
  added: Array<{ signature: string; title: string; status: string; duration: number }>
  /** Tests in base run but not in compare run */
  removed: Array<{ signature: string; title: string; status: string; duration: number }>
  /** Tests with status changes */
  statusChanged: StatusChange[]
  /** Tests with significant duration changes */
  durationChanged: DurationChange[]
  /** Count of tests unchanged between runs */
  unchangedCount: number
}

/** Complete comparison result */
export interface ComparisonResult {
  baseRun: HistoricalRun
  compareRun: HistoricalRun
  diff: TestDiff
  /** Summary stats */
  summary: {
    totalBase: number
    totalCompare: number
    addedCount: number
    removedCount: number
    statusChangedCount: number
    durationChangedCount: number
    regressionCount: number
    fixedCount: number
  }
}

/** Helper to determine status change type */
export function getStatusChangeType(
  oldStatus: string,
  newStatus: string
): 'regression' | 'fixed' | 'other' {
  if (oldStatus === 'passed' && newStatus === 'failed') return 'regression'
  if (oldStatus === 'failed' && newStatus === 'passed') return 'fixed'
  return 'other'
}
