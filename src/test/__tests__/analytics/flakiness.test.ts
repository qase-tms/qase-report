import { describe, it, expect, beforeEach } from 'vitest'
import { runInAction } from 'mobx'
import type { RootStore } from '@/store'
import { createTestStore } from '../../utils/store'
import { makeHistory } from '../../factories/history.factory'
import type { HistoricalTestRunData } from '@/schemas/QaseHistory.schema'

const TEST_SIGNATURE = 'test::flakiness::target'

// Helper: create run objects from status array with optional per-run error messages
const makeRunSequence = (
  statuses: string[],
  errorMessages?: (string | null)[]
): HistoricalTestRunData[] =>
  statuses.map((status, i) => ({
    run_id: `run-${String(i + 1).padStart(3, '0')}`,
    status: status as HistoricalTestRunData['status'],
    duration: 1000,
    start_time: 1700000000000 + i * 60000,
    error_message:
      status === 'failed'
        ? errorMessages
          ? (errorMessages[i] ?? null)
          : null
        : null,
  }))

const injectRuns = (
  store: RootStore,
  runs: HistoricalTestRunData[]
): void => {
  runInAction(() => {
    store.historyStore.history = makeHistory({
      tests: [
        {
          signature: TEST_SIGNATURE,
          title: 'Flakiness Test Target',
          runs,
        },
      ],
    })
  })
}

describe('getFlakinessScore', () => {
  let store: RootStore

  beforeEach(() => {
    store = createTestStore()
  })

  describe('insufficient_data', () => {
    it('returns insufficient_data when history has 4 runs (< MIN_RUNS=5)', () => {
      const runs = makeRunSequence(['passed', 'passed', 'failed', 'passed'])
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.status).toBe('insufficient_data')
      expect(result.totalRuns).toBe(4)
      expect(result.flakinessPercent).toBe(0)
    })

    it('returns insufficient_data when no history for signature', () => {
      runInAction(() => {
        store.historyStore.history = makeHistory({ tests: [] })
      })

      const result = store.analyticsStore.getFlakinessScore('nonexistent::sig')

      expect(result.status).toBe('insufficient_data')
      expect(result.totalRuns).toBe(0)
    })
  })

  describe('stable', () => {
    it('returns stable when 5 all-passed runs (0 transitions)', () => {
      const runs = makeRunSequence(Array(5).fill('passed'))
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.status).toBe('stable')
      expect(result.flakinessPercent).toBe(0)
      expect(result.statusChanges).toBe(0)
    })

    it('returns stable when 5 all-skipped runs (no pass/fail transitions counted)', () => {
      const runs = makeRunSequence(['skipped', 'skipped', 'skipped', 'skipped', 'skipped'])
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.status).toBe('stable')
      expect(result.statusChanges).toBe(0)
      expect(result.flakinessPercent).toBe(0)
    })

    it('returns stable when 5 all-failed runs (0 transitions, no pass/fail change)', () => {
      const runs = makeRunSequence(Array(5).fill('failed'))
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      // No transitions (all failed), flakinessPercent=0, last run failed but prev 3 aren't all passed
      expect(result.status).toBe('stable')
      expect(result.statusChanges).toBe(0)
    })
  })

  describe('flaky detection', () => {
    it('returns flaky for 5 alternating runs [p,f,p,f,p] (4 transitions, 100%)', () => {
      // 4 transitions / 4 possible = 1.0, no failures have different errors: 2 fails with null
      // hasConsistentErrors=true (both null → same key), baseScore*=0.5 → 50% → flaky
      const runs = makeRunSequence(['passed', 'failed', 'passed', 'failed', 'passed'])
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.status).toBe('flaky')
      expect(result.flakinessPercent).toBeGreaterThanOrEqual(20)
      expect(result.statusChanges).toBe(4)
    })

    it('returns flaky when flakinessPercent exceeds 20% threshold (distinct errors avoid penalty)', () => {
      // [p,f,p,f,p] with distinct error messages → hasConsistentErrors=false
      // 4 transitions / 4 possible = 100% → flaky
      const runs = makeRunSequence(
        ['passed', 'failed', 'passed', 'failed', 'passed'],
        [null, 'Error: timeout exceeded', null, 'Error: element not found', null]
      )
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.status).toBe('flaky')
      expect(result.flakinessPercent).toBe(100)
      expect(result.hasConsistentErrors).toBe(false)
    })

    it('returns flaky for 10 runs with 2 transitions and distinct errors (22%)', () => {
      // [p,p,p,p,f,p,p,p,p,p]: transitions p→f (1), f→p (2) = 2 transitions, possibleTransitions=9
      // 1 failure with unique error → hasConsistentErrors check: 1/1=1.0 > 0.8 → penalty applies
      // baseScore = 2/9 * 0.5 ≈ 0.111, flakinessPercent=11 → NOT flaky, but let's use distinct errors:
      // [p,f,p,p,p,f,p,p,p,p]: 3 transitions (p→f, f→p, p→f... wait that's back)
      // Better: [p,f,p,f,p,p,p,p,p,p]: p→f (1), f→p (2), p→f (3), f→p (4) = 4 transitions, possible=9
      // 2 fails with distinct errors: hasConsistentErrors=false
      // baseScore=4/9≈0.444, flakinessPercent=44 → flaky
      const runs = makeRunSequence(
        ['passed', 'failed', 'passed', 'failed', 'passed', 'passed', 'passed', 'passed', 'passed', 'passed'],
        [null, 'Error: timeout', null, 'Error: assertion failed', null, null, null, null, null, null]
      )
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.status).toBe('flaky')
      expect(result.flakinessPercent).toBeGreaterThanOrEqual(20)
    })
  })

  describe('consistent error penalty', () => {
    it('applies 0.5 penalty when >80% failures share the same error message', () => {
      // [p,f,f,f,p]: 2 transitions (p→f, f→p), possible=4, baseScore=2/4=0.5
      // 3 failures all with same error → consistencyRatio=3/3=1.0 > 0.8 → penalty
      // After penalty: 0.25, flakinessPercent=25 → flaky
      const runs = makeRunSequence(
        ['passed', 'failed', 'failed', 'failed', 'passed'],
        [null, 'Error: connection refused', 'Error: connection refused', 'Error: connection refused', null]
      )
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.hasConsistentErrors).toBe(true)
      // With penalty: baseScore (0.5) * 0.5 = 0.25, flakinessPercent = 25
      expect(result.flakinessPercent).toBe(25)
    })

    it('halves baseScore when all failures share same error message', () => {
      // Without penalty: [p,f,p,f,p] → baseScore=1.0, flakinessPercent=100
      // With penalty (same error on both failures): baseScore=0.5, flakinessPercent=50
      const runs = makeRunSequence(
        ['passed', 'failed', 'passed', 'failed', 'passed'],
        [null, 'AssertionError: expected true', null, 'AssertionError: expected true', null]
      )
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.hasConsistentErrors).toBe(true)
      expect(result.flakinessPercent).toBe(50)
      // Still flaky (50 >= 20) but with consistent errors flag
      expect(result.status).toBe('flaky')
    })

    it('does not apply penalty when failures have distinct error messages', () => {
      const runs = makeRunSequence(
        ['passed', 'failed', 'passed', 'failed', 'passed'],
        [null, 'Error: timeout', null, 'Error: assertion failed', null]
      )
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.hasConsistentErrors).toBe(false)
      expect(result.flakinessPercent).toBe(100)
    })
  })

  describe('new_failure detection', () => {
    it('returns new_failure when last run failed and 3+ previous runs passed', () => {
      // [p,p,p,p,f]: last run=failed, prev 3 of last 4 = [p,p,p] → 3 passed ≥ 3 → new_failure
      // transitions: 1 (p→f), possible=4, baseScore=1/4=0.25
      // 1 failure with null error → hasConsistentErrors=true → penalty → baseScore=0.125 → 13%
      // 13% < 20% → check new_failure: last failed, prev 3 passed → new_failure
      const runs = makeRunSequence(['passed', 'passed', 'passed', 'passed', 'failed'])
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.status).toBe('new_failure')
    })

    it('returns new_failure even when explicit error message present (consistent error penalty reduces but does not eliminate)', () => {
      // The important thing is that flakinessPercent < 20, last failed, prev 3 passed
      const runs = makeRunSequence(
        ['passed', 'passed', 'passed', 'passed', 'failed'],
        [null, null, null, null, 'Error: database connection failed']
      )
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result.status).toBe('new_failure')
    })

    it('does not return new_failure when flakinessPercent >= 20 (flaky takes priority)', () => {
      // Lots of transitions → flaky, even if last run failed
      const runs = makeRunSequence(
        ['passed', 'failed', 'passed', 'failed', 'failed'],
        [null, 'Error: A', null, 'Error: B', 'Error: C']
      )
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      // flaky should take priority
      expect(result.status).toBe('flaky')
    })
  })

  describe('result shape', () => {
    it('returns all required fields', () => {
      const runs = makeRunSequence(Array(5).fill('passed'))
      injectRuns(store, runs)

      const result = store.analyticsStore.getFlakinessScore(TEST_SIGNATURE)

      expect(result).toHaveProperty('flakinessPercent')
      expect(result).toHaveProperty('status')
      expect(result).toHaveProperty('totalRuns')
      expect(result).toHaveProperty('statusChanges')
      expect(result).toHaveProperty('hasConsistentErrors')
      expect(result).toHaveProperty('minRunsRequired')
      expect(result.minRunsRequired).toBe(5)
    })
  })
})
