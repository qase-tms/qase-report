import { describe, it, expect, beforeEach } from 'vitest'
import { runInAction } from 'mobx'
import { createTestStore } from '../../utils/store'
import { makeHistoricalRun } from '../../factories/history.factory'
import type { RootStore } from '@/store'

/**
 * Comparison tests exercise the `comparison` computed property on AnalyticsStore.
 * The property is backed by the private `computeComparison(baseRun, compareRun)` method.
 *
 * Data setup:
 *   - historyStore.history.runs  — two HistoricalRun objects
 *   - historyStore.history.tests — per-test entries with runs[] keyed by run_id
 */

describe('AnalyticsStore: comparison', () => {
  let store: RootStore

  const BASE_RUN_ID = 'base-run'
  const COMPARE_RUN_ID = 'compare-run'

  const baseRun = makeHistoricalRun({
    run_id: BASE_RUN_ID,
    start_time: 1700000000000,
    end_time: 1700000060000,
    duration: 60000,
    stats: { total: 2, passed: 2, failed: 0, skipped: 0 },
  })

  const compareRun = makeHistoricalRun({
    run_id: COMPARE_RUN_ID,
    start_time: 1700100000000,
    end_time: 1700100060000,
    duration: 60000,
    stats: { total: 2, passed: 1, failed: 1, skipped: 0 },
  })

  beforeEach(() => {
    store = createTestStore()
  })

  it('returns null when no runs are selected', () => {
    expect(store.analyticsStore.comparison).toBeNull()
  })

  describe('regression detection (passed -> failed)', () => {
    it('detects regression when test status changes from passed to failed', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: [baseRun, compareRun],
          tests: [
            {
              signature: 'test::regression',
              title: 'Regression Test',
              runs: [
                { run_id: BASE_RUN_ID, status: 'passed', duration: 1000, start_time: 1700000000000, error_message: null },
                { run_id: COMPARE_RUN_ID, status: 'failed', duration: 1000, start_time: 1700100000000, error_message: 'AssertionError' },
              ],
            },
          ],
        }
        store.analyticsStore.setSelectedBaseRunId(BASE_RUN_ID)
        store.analyticsStore.setSelectedCompareRunId(COMPARE_RUN_ID)
      })

      const result = store.analyticsStore.comparison
      expect(result).not.toBeNull()
      expect(result!.diff.statusChanged).toHaveLength(1)
      expect(result!.diff.statusChanged[0].changeType).toBe('regression')
      expect(result!.diff.statusChanged[0].oldStatus).toBe('passed')
      expect(result!.diff.statusChanged[0].newStatus).toBe('failed')
    })
  })

  describe('fixed detection (failed -> passed)', () => {
    it('detects fixed when test status changes from failed to passed', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: [baseRun, compareRun],
          tests: [
            {
              signature: 'test::fixed',
              title: 'Fixed Test',
              runs: [
                { run_id: BASE_RUN_ID, status: 'failed', duration: 1000, start_time: 1700000000000, error_message: 'Error' },
                { run_id: COMPARE_RUN_ID, status: 'passed', duration: 1000, start_time: 1700100000000, error_message: null },
              ],
            },
          ],
        }
        store.analyticsStore.setSelectedBaseRunId(BASE_RUN_ID)
        store.analyticsStore.setSelectedCompareRunId(COMPARE_RUN_ID)
      })

      const result = store.analyticsStore.comparison
      expect(result).not.toBeNull()
      expect(result!.diff.statusChanged).toHaveLength(1)
      expect(result!.diff.statusChanged[0].changeType).toBe('fixed')
    })
  })

  describe('added and removed tests', () => {
    it('detects added test (present in compare but not in base)', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: [baseRun, compareRun],
          tests: [
            {
              signature: 'test::new',
              title: 'New Test',
              runs: [
                { run_id: COMPARE_RUN_ID, status: 'passed', duration: 500, start_time: 1700100000000, error_message: null },
              ],
            },
          ],
        }
        store.analyticsStore.setSelectedBaseRunId(BASE_RUN_ID)
        store.analyticsStore.setSelectedCompareRunId(COMPARE_RUN_ID)
      })

      const result = store.analyticsStore.comparison
      expect(result).not.toBeNull()
      expect(result!.diff.added).toHaveLength(1)
      expect(result!.diff.added[0].signature).toBe('test::new')
      expect(result!.diff.removed).toHaveLength(0)
    })

    it('detects removed test (present in base but not in compare)', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: [baseRun, compareRun],
          tests: [
            {
              signature: 'test::removed',
              title: 'Removed Test',
              runs: [
                { run_id: BASE_RUN_ID, status: 'passed', duration: 500, start_time: 1700000000000, error_message: null },
              ],
            },
          ],
        }
        store.analyticsStore.setSelectedBaseRunId(BASE_RUN_ID)
        store.analyticsStore.setSelectedCompareRunId(COMPARE_RUN_ID)
      })

      const result = store.analyticsStore.comparison
      expect(result).not.toBeNull()
      expect(result!.diff.removed).toHaveLength(1)
      expect(result!.diff.removed[0].signature).toBe('test::removed')
      expect(result!.diff.added).toHaveLength(0)
    })
  })

  describe('duration significance thresholds', () => {
    it('marks duration change significant when percent change > 20% (1000 -> 1300ms = 30%)', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: [baseRun, compareRun],
          tests: [
            {
              signature: 'test::slow',
              title: 'Slow Test',
              runs: [
                { run_id: BASE_RUN_ID, status: 'passed', duration: 1000, start_time: 1700000000000, error_message: null },
                { run_id: COMPARE_RUN_ID, status: 'passed', duration: 1300, start_time: 1700100000000, error_message: null },
              ],
            },
          ],
        }
        store.analyticsStore.setSelectedBaseRunId(BASE_RUN_ID)
        store.analyticsStore.setSelectedCompareRunId(COMPARE_RUN_ID)
      })

      const result = store.analyticsStore.comparison
      expect(result).not.toBeNull()
      expect(result!.diff.durationChanged).toHaveLength(1)
      expect(result!.diff.durationChanged[0].isSignificant).toBe(true)
    })

    it('does NOT mark duration change significant at exactly 20% (1000 -> 1200ms)', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: [baseRun, compareRun],
          tests: [
            {
              signature: 'test::marginal',
              title: 'Marginal Duration Test',
              runs: [
                { run_id: BASE_RUN_ID, status: 'passed', duration: 1000, start_time: 1700000000000, error_message: null },
                { run_id: COMPARE_RUN_ID, status: 'passed', duration: 1200, start_time: 1700100000000, error_message: null },
              ],
            },
          ],
        }
        store.analyticsStore.setSelectedBaseRunId(BASE_RUN_ID)
        store.analyticsStore.setSelectedCompareRunId(COMPARE_RUN_ID)
      })

      const result = store.analyticsStore.comparison
      expect(result).not.toBeNull()
      expect(result!.diff.durationChanged).toHaveLength(0)
    })

    it('marks duration change significant when absolute difference > 500ms (1000 -> 1501ms)', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: [baseRun, compareRun],
          tests: [
            {
              signature: 'test::absolute',
              title: 'Absolute Duration Test',
              runs: [
                { run_id: BASE_RUN_ID, status: 'passed', duration: 1000, start_time: 1700000000000, error_message: null },
                { run_id: COMPARE_RUN_ID, status: 'passed', duration: 1501, start_time: 1700100000000, error_message: null },
              ],
            },
          ],
        }
        store.analyticsStore.setSelectedBaseRunId(BASE_RUN_ID)
        store.analyticsStore.setSelectedCompareRunId(COMPARE_RUN_ID)
      })

      const result = store.analyticsStore.comparison
      expect(result).not.toBeNull()
      expect(result!.diff.durationChanged).toHaveLength(1)
      expect(result!.diff.durationChanged[0].isSignificant).toBe(true)
    })
  })

  describe('summary counts', () => {
    it('summary.regressionCount reflects number of regressions', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: [baseRun, compareRun],
          tests: [
            {
              signature: 'test::reg1',
              title: 'Regression 1',
              runs: [
                { run_id: BASE_RUN_ID, status: 'passed', duration: 100, start_time: 1700000000000, error_message: null },
                { run_id: COMPARE_RUN_ID, status: 'failed', duration: 100, start_time: 1700100000000, error_message: 'Error' },
              ],
            },
            {
              signature: 'test::reg2',
              title: 'Regression 2',
              runs: [
                { run_id: BASE_RUN_ID, status: 'passed', duration: 100, start_time: 1700000000000, error_message: null },
                { run_id: COMPARE_RUN_ID, status: 'failed', duration: 100, start_time: 1700100000000, error_message: 'Error' },
              ],
            },
          ],
        }
        store.analyticsStore.setSelectedBaseRunId(BASE_RUN_ID)
        store.analyticsStore.setSelectedCompareRunId(COMPARE_RUN_ID)
      })

      const result = store.analyticsStore.comparison
      expect(result).not.toBeNull()
      expect(result!.summary.regressionCount).toBe(2)
    })
  })
})
