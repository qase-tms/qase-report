import { describe, it, expect, beforeEach } from 'vitest'
import { runInAction } from 'mobx'
import type { RootStore } from '@/store'
import { createTestStore } from '../../utils/store'
import { makeHistory } from '../../factories/history.factory'
import type { HistoricalTestRunData } from '@/schemas/QaseHistory.schema'

const TEST_SIGNATURE = 'test::stability::target'

// Helper: create an array of run objects with explicit statuses
const makeRuns = (
  statuses: string[],
  duration = 1000,
  errorMessage: string | null = null
): HistoricalTestRunData[] =>
  statuses.map((status, i) => ({
    run_id: `run-${String(i + 1).padStart(3, '0')}`,
    status: status as HistoricalTestRunData['status'],
    duration,
    start_time: 1700000000000 + i * 60000,
    error_message: status === 'failed' ? errorMessage : null,
  }))

// Helper: inject runs for TEST_SIGNATURE into the store
const injectRuns = (
  store: RootStore,
  runs: HistoricalTestRunData[]
): void => {
  runInAction(() => {
    store.historyStore.history = makeHistory({
      tests: [
        {
          signature: TEST_SIGNATURE,
          title: 'Stability Test Target',
          runs,
        },
      ],
    })
  })
}

describe('getStabilityScore', () => {
  let store: RootStore

  beforeEach(() => {
    store = createTestStore()
  })

  describe('insufficient data (N/A)', () => {
    it('returns grade N/A when history has 9 runs (< MIN_RUNS_STABILITY=10)', () => {
      const runs = makeRuns(Array(9).fill('passed'))
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore(TEST_SIGNATURE)

      expect(result.grade).toBe('N/A')
      expect(result.totalRuns).toBe(9)
    })

    it('returns grade N/A and totalRuns 0 when signature has no history', () => {
      runInAction(() => {
        store.historyStore.history = makeHistory({ tests: [] })
      })

      const result = store.analyticsStore.getStabilityScore('nonexistent::signature')

      expect(result.grade).toBe('N/A')
      expect(result.totalRuns).toBe(0)
    })

    it('returns grade N/A for mismatched signature even when other tests have history', () => {
      const runs = makeRuns(Array(15).fill('passed'))
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore('completely::different::sig')

      expect(result.grade).toBe('N/A')
      expect(result.totalRuns).toBe(0)
    })
  })

  describe('A+ grade (score >= 95)', () => {
    it('returns grade A+ when all 10 runs pass with consistent 1000ms duration', () => {
      // passRate=100, flakinessPercent=0, durationCV=0
      // score = 100*0.5 + 100*0.3 + 100*0.2 = 100
      const runs = makeRuns(Array(10).fill('passed'), 1000)
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore(TEST_SIGNATURE)

      expect(result.grade).toBe('A+')
      expect(result.score).toBe(100)
      expect(result.passRate).toBe(100)
      expect(result.flakinessPercent).toBe(0)
      expect(result.durationCV).toBe(0)
      expect(result.totalRuns).toBe(10)
    })

    it('returns grade A+ for 15 all-passed runs with consistent duration', () => {
      const runs = makeRuns(Array(15).fill('passed'), 2000)
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore(TEST_SIGNATURE)

      expect(result.grade).toBe('A+')
      expect(result.score).toBe(100)
    })
  })

  describe('F grade (score < 60)', () => {
    it('returns grade F when all 10 runs fail', () => {
      // passRate=0, flakinessPercent=0 (no transitions), durationCV=0
      // score = 0 + 30 + 20 = 50 → F
      const runs = makeRuns(Array(10).fill('failed'), 1000)
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore(TEST_SIGNATURE)

      expect(result.grade).toBe('F')
      expect(result.score).toBeLessThan(60)
      expect(result.passRate).toBe(0)
    })
  })

  describe('intermediate grades', () => {
    it('returns grade B when 7 passes and 3 fails (all fails at start, no transitions beyond 1)', () => {
      // [f,f,f,p,p,p,p,p,p,p]: 1 transition (f→p), hasConsistentErrors=true (3 null-error fails)
      // baseScore=1/9*0.5 (penalty)≈0.0556, flakinessPercent=6 (< 20, stable/new_failure check)
      // last run passed → stable
      // passRate=70, flakinessPercent=6, durationCV=0
      // score = 35 + 94*0.3 + 20 = 35 + 28.2 + 20 = 83.2 → rounded 83 → B
      const runs = makeRuns(
        ['failed', 'failed', 'failed', 'passed', 'passed', 'passed', 'passed', 'passed', 'passed', 'passed'],
        1000
      )
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore(TEST_SIGNATURE)

      expect(result.grade).toBe('B')
      expect(result.score).toBeGreaterThanOrEqual(80)
      expect(result.score).toBeLessThan(90)
    })

    it('returns grade A when 9 passes + 1 fail (fail last), consistent duration', () => {
      // [p,p,p,p,p,p,p,p,p,f]: 1 transition (p→f at end)
      // hasConsistentErrors=true (1 null-error fail), baseScore=1/9*0.5≈0.0556, flakinessPercent=6
      // last run failed, prev 3+ passed → new_failure status
      // passRate=90, flakinessPercent=6, durationCV=0
      // score = 45 + 94*0.3 + 20 = 45 + 28.2 + 20 = 93.2 → rounded 93 → A
      const runs = makeRuns(
        ['passed', 'passed', 'passed', 'passed', 'passed', 'passed', 'passed', 'passed', 'passed', 'failed'],
        1000
      )
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore(TEST_SIGNATURE)

      expect(result.grade).toBe('A')
      expect(result.score).toBeGreaterThanOrEqual(90)
      expect(result.score).toBeLessThan(95)
    })
  })

  describe('score clamping', () => {
    it('score is never greater than 100', () => {
      const runs = makeRuns(Array(20).fill('passed'), 1000)
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore(TEST_SIGNATURE)

      expect(result.score).toBeLessThanOrEqual(100)
    })

    it('score is never less than 0', () => {
      const runs = makeRuns(Array(10).fill('failed'), 1000)
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore(TEST_SIGNATURE)

      expect(result.score).toBeGreaterThanOrEqual(0)
    })
  })

  describe('result shape', () => {
    it('returns all required fields', () => {
      const runs = makeRuns(Array(10).fill('passed'), 1000)
      injectRuns(store, runs)

      const result = store.analyticsStore.getStabilityScore(TEST_SIGNATURE)

      expect(result).toHaveProperty('grade')
      expect(result).toHaveProperty('score')
      expect(result).toHaveProperty('passRate')
      expect(result).toHaveProperty('flakinessPercent')
      expect(result).toHaveProperty('durationCV')
      expect(result).toHaveProperty('totalRuns')
      expect(result).toHaveProperty('minRunsRequired')
      expect(result.minRunsRequired).toBe(10)
    })
  })
})
