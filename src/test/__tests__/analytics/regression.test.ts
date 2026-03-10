import { describe, it, expect, beforeEach } from 'vitest'
import { runInAction } from 'mobx'
import type { RootStore } from '@/store'
import { createTestStore } from '../../utils/store'
import { makeHistory } from '../../factories/history.factory'
import type { HistoricalTestRunData } from '@/schemas/QaseHistory.schema'

const TEST_SIGNATURE = 'test::regression::target'

// Helper: create runs with explicit durations (chronological order)
const makeRunsWithDurations = (durations: number[]): HistoricalTestRunData[] =>
  durations.map((duration, i) => ({
    run_id: `run-${String(i + 1).padStart(3, '0')}`,
    status: 'passed' as const,
    duration,
    start_time: 1700000000000 + i * 60000,
    error_message: null,
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
          title: 'Regression Test Target',
          runs,
        },
      ],
    })
  })
}

describe('getPerformanceRegression', () => {
  let store: RootStore

  beforeEach(() => {
    store = createTestStore()
  })

  describe('insufficient data', () => {
    it('returns null when history has 4 runs (< MIN_RUNS_REGRESSION=5)', () => {
      const runs = makeRunsWithDurations([1000, 1000, 1000, 1000])
      injectRuns(store, runs)

      const result = store.analyticsStore.getPerformanceRegression(TEST_SIGNATURE)

      expect(result).toBeNull()
    })

    it('returns null when no history for signature', () => {
      runInAction(() => {
        store.historyStore.history = makeHistory({ tests: [] })
      })

      const result = store.analyticsStore.getPerformanceRegression('nonexistent::sig')

      expect(result).toBeNull()
    })
  })

  describe('no regression', () => {
    it('returns no regression for 5 runs with identical duration [1000,1000,1000,1000,1000]', () => {
      // historical = [1000,1000,1000,1000], mean=1000, stdDev=0
      // isRegression = current > threshold && stdDev > 0 → false (stdDev=0 guard)
      const runs = makeRunsWithDurations([1000, 1000, 1000, 1000, 1000])
      injectRuns(store, runs)

      const result = store.analyticsStore.getPerformanceRegression(TEST_SIGNATURE)

      expect(result).not.toBeNull()
      expect(result!.isRegression).toBe(false)
      expect(result!.stdDev).toBe(0)
    })

    it('returns no regression when last run equals historical mean with some variance', () => {
      // historical = [900, 1100, 1000, 1000]: mean=1000, stdDev ≈ 70.7
      // threshold = 1000 + 2*70.7 ≈ 1141.4
      // current = 1000 < 1141.4 → no regression
      const runs = makeRunsWithDurations([900, 1100, 1000, 1000, 1000])
      injectRuns(store, runs)

      const result = store.analyticsStore.getPerformanceRegression(TEST_SIGNATURE)

      expect(result).not.toBeNull()
      expect(result!.isRegression).toBe(false)
    })
  })

  describe('stdDev=0 guard (no division error)', () => {
    it('returns isRegression=false when historical durations are identical (stdDev=0)', () => {
      // [1000,1000,1000,1000,5000]: historical=[1000,1000,1000,1000], mean=1000, stdDev=0
      // isRegression = 5000 > 1000 && 0 > 0 → false (stdDev guard prevents false positive)
      const runs = makeRunsWithDurations([1000, 1000, 1000, 1000, 5000])
      injectRuns(store, runs)

      const result = store.analyticsStore.getPerformanceRegression(TEST_SIGNATURE)

      expect(result).not.toBeNull()
      expect(result!.isRegression).toBe(false)
      expect(result!.stdDev).toBe(0)
      expect(result!.currentDuration).toBe(5000)
    })

    it('does not throw or produce NaN when all historical durations are the same', () => {
      const runs = makeRunsWithDurations([500, 500, 500, 500, 500])
      injectRuns(store, runs)

      const result = store.analyticsStore.getPerformanceRegression(TEST_SIGNATURE)

      expect(result).not.toBeNull()
      expect(result!.isRegression).toBe(false)
      expect(Number.isNaN(result!.meanDuration)).toBe(false)
      expect(Number.isNaN(result!.threshold)).toBe(false)
    })
  })

  describe('regression detection', () => {
    it('detects regression when last run exceeds mean + 2*stdDev with historical variance', () => {
      // historical = [1000, 1200, 800, 1100]: mean=1025, stdDev≈147.9
      // threshold ≈ 1025 + 2*147.9 ≈ 1320.8
      // current = 10000 → isRegression = true
      const runs = makeRunsWithDurations([1000, 1200, 800, 1100, 10000])
      injectRuns(store, runs)

      const result = store.analyticsStore.getPerformanceRegression(TEST_SIGNATURE)

      expect(result).not.toBeNull()
      expect(result!.isRegression).toBe(true)
      expect(result!.currentDuration).toBe(10000)
    })

    it('returns correct fields when regression is detected', () => {
      const runs = makeRunsWithDurations([1000, 1200, 800, 1100, 10000])
      injectRuns(store, runs)

      const result = store.analyticsStore.getPerformanceRegression(TEST_SIGNATURE)

      expect(result).not.toBeNull()
      expect(result!.isRegression).toBe(true)
      expect(result!.currentDuration).toBeGreaterThan(0)
      expect(result!.meanDuration).toBeGreaterThan(0)
      expect(result!.stdDev).toBeGreaterThan(0)
      expect(result!.threshold).toBeGreaterThan(result!.meanDuration)
    })

    it('excludes last run from historical mean calculation (slice(0,-1))', () => {
      // If last run were INCLUDED in mean, with [1000,1000,1000,1000,10000]:
      // full mean = (1000*4+10000)/5 = 2800
      // But with slice(0,-1): historical=[1000,1000,1000,1000], mean=1000, stdDev=0
      // → isRegression=false (stdDev guard)
      //
      // To demonstrate exclusion: use [800,1200,900,1100,10000]
      // historical=[800,1200,900,1100]: mean=1000, stdDev≈150
      // threshold ≈ 1000 + 300 = 1300
      // current=10000 → isRegression=true
      //
      // If we included all 5: mean=(800+1200+900+1100+10000)/5=2800, stdDev much higher
      // The key check: meanDuration is ~1000 (history of 4), NOT ~2800 (all 5)
      const runs = makeRunsWithDurations([800, 1200, 900, 1100, 10000])
      injectRuns(store, runs)

      const result = store.analyticsStore.getPerformanceRegression(TEST_SIGNATURE)

      expect(result).not.toBeNull()
      expect(result!.isRegression).toBe(true)
      // Historical mean is based on [800,1200,900,1100], not including 10000
      expect(result!.meanDuration).toBeLessThan(2000)
      expect(result!.meanDuration).toBe(1000) // exactly (800+1200+900+1100)/4
    })

    it('does not detect regression when last run is only slightly above mean', () => {
      // [1000, 1200, 800, 1000, 1100]: historical=[1000,1200,800,1000], mean=1000, stdDev≈141
      // threshold ≈ 1000 + 2*141 = 1282
      // current = 1100 < 1282 → no regression
      const runs = makeRunsWithDurations([1000, 1200, 800, 1000, 1100])
      injectRuns(store, runs)

      const result = store.analyticsStore.getPerformanceRegression(TEST_SIGNATURE)

      expect(result).not.toBeNull()
      expect(result!.isRegression).toBe(false)
    })
  })
})
