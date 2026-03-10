import { describe, it, expect, beforeEach, vi } from 'vitest'
import { runInAction } from 'mobx'
import { RootStore } from '@/store'
import { createTestStore } from '../../utils/store'
import { makeRun } from '../../factories/run.factory'
import { makeTestResult } from '../../factories/result.factory'
import { makeHistory, makeHistoricalRun } from '../../factories/history.factory'

describe('HistoryStore', () => {
  describe('addCurrentRun', () => {
    let store: RootStore

    beforeEach(() => {
      store = createTestStore()
    })

    it('initializes history when history is null', () => {
      expect(store.historyStore.history).toBeNull()

      store.historyStore.addCurrentRun(
        makeRun({ execution: { start_time: 1700000001000, end_time: 1700000061000, duration: 60000, cumulative_duration: 60000 } }),
        new Map()
      )

      expect(store.historyStore.history).not.toBeNull()
      expect(store.historyStore.history?.schema_version).toBe('1.0.0')
    })

    it('adds a run to history.runs', () => {
      store.historyStore.addCurrentRun(
        makeRun({ execution: { start_time: 1700000001000, end_time: 1700000061000, duration: 60000, cumulative_duration: 60000 } }),
        new Map()
      )

      expect(store.historyStore.history?.runs).toHaveLength(1)
    })

    it('creates per-test entries in history.tests with correct signature', () => {
      const testResult = makeTestResult({
        id: 'test-sig-01',
        signature: 'suite::module::my_test',
        title: 'My Test',
      })
      const testResults = new Map([['test-sig-01', testResult]])

      store.historyStore.addCurrentRun(
        makeRun({ execution: { start_time: 1700000002000, end_time: 1700000062000, duration: 60000, cumulative_duration: 60000 } }),
        testResults
      )

      expect(store.historyStore.history?.tests).toHaveLength(1)
      expect(store.historyStore.history?.tests[0].signature).toBe('suite::module::my_test')
      expect(store.historyStore.history?.tests[0].runs).toHaveLength(1)
    })

    it('prevents duplicate runs when called twice with same start_time', () => {
      const run = makeRun({
        execution: { start_time: 1700000003000, end_time: 1700000063000, duration: 60000, cumulative_duration: 60000 },
      })

      store.historyStore.addCurrentRun(run, new Map())
      store.historyStore.addCurrentRun(run, new Map())

      expect(store.historyStore.history?.runs).toHaveLength(1)
    })

    it('evicts oldest run when MAX_RUNS (100) is exceeded', () => {
      // Pre-populate history with 100 runs
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: Array.from({ length: 100 }, (_, i) =>
            makeHistoricalRun({ run_id: `existing-${i}`, start_time: 1000 + i })
          ),
          tests: [
            {
              signature: 'sig-evict',
              title: 'Evict Test',
              runs: Array.from({ length: 100 }, (_, i) => ({
                run_id: `existing-${i}`,
                status: 'passed' as const,
                duration: 1000,
                start_time: 1000 + i,
                error_message: null,
              })),
            },
          ],
        }
        store.historyStore.isHistoryLoaded = true
      })

      // Add a new run to trigger eviction
      store.historyStore.addCurrentRun(
        makeRun({ execution: { start_time: Date.now() + 999999, end_time: null, duration: 60000, cumulative_duration: 60000 } }),
        new Map()
      )

      expect(store.historyStore.history?.runs).toHaveLength(100)
      expect(store.historyStore.history?.runs[0].run_id).not.toBe('existing-0')
    })

    it('prunes per-test runs for evicted run_id', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: Array.from({ length: 100 }, (_, i) =>
            makeHistoricalRun({ run_id: `existing-${i}`, start_time: 1000 + i })
          ),
          tests: [
            {
              signature: 'sig-prune',
              title: 'Prune Test',
              runs: Array.from({ length: 100 }, (_, i) => ({
                run_id: `existing-${i}`,
                status: 'passed' as const,
                duration: 1000,
                start_time: 1000 + i,
                error_message: null,
              })),
            },
          ],
        }
        store.historyStore.isHistoryLoaded = true
      })

      store.historyStore.addCurrentRun(
        makeRun({ execution: { start_time: Date.now() + 999999, end_time: null, duration: 60000, cumulative_duration: 60000 } }),
        new Map()
      )

      const sigPrune = store.historyStore.history?.tests.find(
        t => t.signature === 'sig-prune'
      )
      // The evicted run (existing-0) should be pruned from per-test runs
      expect(sigPrune?.runs).toHaveLength(99)
      expect(sigPrune?.runs.some(r => r.run_id === 'existing-0')).toBe(false)
    })

    it('removes test entries that have no remaining runs after eviction', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: Array.from({ length: 100 }, (_, i) =>
            makeHistoricalRun({ run_id: `existing-${i}`, start_time: 1000 + i })
          ),
          tests: [
            {
              signature: 'sig-single',
              title: 'Single Run Test',
              // Only has a run for existing-0 which will be evicted
              runs: [
                {
                  run_id: 'existing-0',
                  status: 'passed' as const,
                  duration: 1000,
                  start_time: 1000,
                  error_message: null,
                },
              ],
            },
          ],
        }
        store.historyStore.isHistoryLoaded = true
      })

      store.historyStore.addCurrentRun(
        makeRun({ execution: { start_time: Date.now() + 999999, end_time: null, duration: 60000, cumulative_duration: 60000 } }),
        new Map()
      )

      // The test entry with only runs for existing-0 should be removed entirely
      expect(store.historyStore.history?.tests).toHaveLength(0)
    })
  })

  describe('localStorage persistence', () => {
    let store: RootStore

    beforeEach(() => {
      store = createTestStore()
    })

    it('saveToLocalStorage calls localStorage.setItem with HISTORY_STORAGE_KEY', () => {
      runInAction(() => {
        store.historyStore.history = makeHistory()
        store.historyStore.isHistoryLoaded = true
      })

      store.historyStore.saveToLocalStorage()

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'qase-report-history',
        expect.any(String)
      )
    })

    it('saveToLocalStorage serialized data contains schema_version', () => {
      runInAction(() => {
        store.historyStore.history = makeHistory()
        store.historyStore.isHistoryLoaded = true
      })

      store.historyStore.saveToLocalStorage()

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'qase-report-history',
        expect.stringContaining('"schema_version"')
      )
    })

    it('saveToLocalStorage does nothing when history is null', () => {
      // History is null by default after createTestStore()
      expect(store.historyStore.history).toBeNull()

      store.historyStore.saveToLocalStorage()

      expect(localStorage.setItem).not.toHaveBeenCalled()
    })

    it('clearHistory sets history to null and isHistoryLoaded to false', () => {
      runInAction(() => {
        store.historyStore.history = makeHistory()
        store.historyStore.isHistoryLoaded = true
      })

      store.historyStore.clearHistory()

      expect(store.historyStore.history).toBeNull()
      expect(store.historyStore.isHistoryLoaded).toBe(false)
    })

    it('clearHistory calls localStorage.removeItem with HISTORY_STORAGE_KEY', () => {
      runInAction(() => {
        store.historyStore.history = makeHistory()
        store.historyStore.isHistoryLoaded = true
      })

      store.historyStore.clearHistory()

      expect(localStorage.removeItem).toHaveBeenCalledWith('qase-report-history')
    })
  })

  describe('Corrupted data recovery', () => {
    it('loadFromLocalStorage with corrupted JSON calls removeItem', () => {
      const mockLS = {
        getItem: vi.fn().mockReturnValue('not valid json {{{'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn().mockReturnValue(null),
        get length() {
          return 0
        },
      }
      vi.stubGlobal('localStorage', mockLS)

      const store = new RootStore()

      expect(localStorage.removeItem).toHaveBeenCalledWith('qase-report-history')
      expect(store.historyStore.isHistoryLoaded).toBe(false)
    })

    it('loadFromLocalStorage with valid JSON but non-schema data calls removeItem', () => {
      const mockLS = {
        getItem: vi.fn().mockReturnValue('{"not_a_history": true}'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn().mockReturnValue(null),
        get length() {
          return 0
        },
      }
      vi.stubGlobal('localStorage', mockLS)

      const store = new RootStore()

      expect(localStorage.removeItem).toHaveBeenCalledWith('qase-report-history')
      expect(store.historyStore.isHistoryLoaded).toBe(false)
    })

    it('loadFromLocalStorage with empty localStorage does not set isHistoryLoaded', () => {
      const mockLS = {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn().mockReturnValue(null),
        get length() {
          return 0
        },
      }
      vi.stubGlobal('localStorage', mockLS)

      const store = new RootStore()

      expect(store.historyStore.isHistoryLoaded).toBe(false)
      expect(localStorage.removeItem).not.toHaveBeenCalled()
    })
  })

  describe('Computed getters', () => {
    let store: RootStore

    beforeEach(() => {
      store = createTestStore()
    })

    it('recentRuns returns empty array when no history', () => {
      expect(store.historyStore.recentRuns).toEqual([])
    })

    it('recentRuns returns at most 10 runs, most recent first', () => {
      const runs = Array.from({ length: 15 }, (_, i) =>
        makeHistoricalRun({ run_id: `run-${i}`, start_time: 1000 + i })
      )

      runInAction(() => {
        store.historyStore.history = makeHistory({ runs })
        store.historyStore.isHistoryLoaded = true
      })

      const recentRuns = store.historyStore.recentRuns

      expect(recentRuns).toHaveLength(10)
      // Most recent (run-14) should be first
      expect(recentRuns[0].run_id).toBe('run-14')
    })

    it('totalRuns returns 0 when no history', () => {
      expect(store.historyStore.totalRuns).toBe(0)
    })

    it('totalRuns returns correct count after injection', () => {
      runInAction(() => {
        store.historyStore.history = makeHistory({
          runs: [
            makeHistoricalRun({ run_id: 'run-a' }),
            makeHistoricalRun({ run_id: 'run-b' }),
            makeHistoricalRun({ run_id: 'run-c' }),
          ],
        })
        store.historyStore.isHistoryLoaded = true
      })

      expect(store.historyStore.totalRuns).toBe(3)
    })

    it('getTestHistory returns runs for a matching signature', () => {
      runInAction(() => {
        store.historyStore.history = {
          schema_version: '1.0.0',
          runs: [makeHistoricalRun()],
          tests: [
            {
              signature: 'suite::module::my_test',
              title: 'My Test',
              runs: [
                {
                  run_id: 'run-001',
                  status: 'passed',
                  duration: 1000,
                  start_time: 1700000000000,
                  error_message: null,
                },
              ],
            },
          ],
        }
        store.historyStore.isHistoryLoaded = true
      })

      const history = store.historyStore.getTestHistory('suite::module::my_test')

      expect(history).toHaveLength(1)
      expect(history[0].run_id).toBe('run-001')
    })

    it('getTestHistory returns empty array for unknown signature', () => {
      runInAction(() => {
        store.historyStore.history = makeHistory()
        store.historyStore.isHistoryLoaded = true
      })

      expect(store.historyStore.getTestHistory('unknown::sig')).toEqual([])
    })
  })
})
