import { describe, it, expect, beforeEach } from 'vitest'
import { runInAction } from 'mobx'
import type { RootStore } from '@/store'
import { createTestStore } from '../../utils/store'
import { makeRun } from '../../factories/run.factory'
import { makeTestResult } from '../../factories/result.factory'

describe('ReportStore computed values', () => {
  let store: RootStore

  beforeEach(() => {
    store = createTestStore()
  })

  describe('totalTests', () => {
    it('returns 0 when no runData loaded', () => {
      expect(store.reportStore.totalTests).toBe(0)
    })

    it('returns stats.total after runData injection', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun({ stats: { total: 15, passed: 10, failed: 3, skipped: 2 } })
      })
      expect(store.reportStore.totalTests).toBe(15)
    })
  })

  describe('passRate', () => {
    it('returns 0 when no runData', () => {
      expect(store.reportStore.passRate).toBe(0)
    })

    it('returns (passed/total)*100', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun({ stats: { total: 10, passed: 8, failed: 1, skipped: 1 } })
      })
      expect(store.reportStore.passRate).toBe(80)
    })
  })

  describe('failedRate', () => {
    it('returns 0 when no runData', () => {
      expect(store.reportStore.failedRate).toBe(0)
    })

    it('returns (failed/total)*100', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun({ stats: { total: 10, passed: 8, failed: 1, skipped: 1 } })
      })
      expect(store.reportStore.failedRate).toBe(10)
    })
  })

  describe('skippedRate', () => {
    it('returns 0 when no runData', () => {
      expect(store.reportStore.skippedRate).toBe(0)
    })

    it('returns (skipped/total)*100', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun({ stats: { total: 10, passed: 8, failed: 1, skipped: 1 } })
      })
      expect(store.reportStore.skippedRate).toBe(10)
    })
  })

  describe('blockedRate', () => {
    it('returns 0 when no runData', () => {
      expect(store.reportStore.blockedRate).toBe(0)
    })

    it('returns 0 when stats.blocked is undefined', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun({ stats: { total: 10, passed: 8, failed: 1, skipped: 1 } })
      })
      expect(store.reportStore.blockedRate).toBe(0)
    })

    it('returns (blocked/total)*100 when blocked is set', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun({
          stats: { total: 10, passed: 7, failed: 1, skipped: 1, blocked: 1 },
        })
      })
      expect(store.reportStore.blockedRate).toBe(10)
    })
  })

  describe('formattedDuration', () => {
    it('returns "0s" when no runData', () => {
      expect(store.reportStore.formattedDuration).toBe('0s')
    })

    it('returns seconds-only format for short duration (5000ms -> "5s")', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun({
          execution: {
            start_time: 1700000000000,
            end_time: 1700000005000,
            duration: 5000,
            cumulative_duration: 5000,
          },
        })
      })
      expect(store.reportStore.formattedDuration).toBe('5s')
    })

    it('returns minutes format for 60000ms ("1m 0s")', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun({
          execution: {
            start_time: 1700000000000,
            end_time: 1700000060000,
            duration: 60000,
            cumulative_duration: 60000,
          },
        })
      })
      expect(store.reportStore.formattedDuration).toBe('1m 0s')
    })

    it('returns hours format for 3600000ms ("1h 0m 0s")', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun({
          execution: {
            start_time: 1700000000000,
            end_time: 1700003600000,
            duration: 3600000,
            cumulative_duration: 3600000,
          },
        })
      })
      expect(store.reportStore.formattedDuration).toBe('1h 0m 0s')
    })
  })

  describe('suitePassRates', () => {
    it('returns empty array when no runData', () => {
      expect(store.reportStore.suitePassRates).toEqual([])
    })

    it('computes correct pass rates grouped by suite title', () => {
      runInAction(() => {
        store.reportStore.runData = makeRun()
        store.testResultsStore.testResults.set(
          't1',
          makeTestResult({
            id: 't1',
            execution: { status: 'passed', start_time: 0, end_time: 1000, duration: 1000, stacktrace: null, thread: 'main' },
            relations: { suite: { data: [{ title: 'Suite A', public_id: null }] } },
          })
        )
        store.testResultsStore.testResults.set(
          't2',
          makeTestResult({
            id: 't2',
            execution: { status: 'passed', start_time: 0, end_time: 1000, duration: 1000, stacktrace: null, thread: 'main' },
            relations: { suite: { data: [{ title: 'Suite A', public_id: null }] } },
          })
        )
        store.testResultsStore.testResults.set(
          't3',
          makeTestResult({
            id: 't3',
            execution: { status: 'failed', start_time: 0, end_time: 1000, duration: 1000, stacktrace: null, thread: 'main' },
            relations: { suite: { data: [{ title: 'Suite B', public_id: null }] } },
          })
        )
      })

      const rates = store.reportStore.suitePassRates
      expect(rates).toHaveLength(2)

      // Sorted worst-first (Suite B has 0% pass rate, Suite A has 100%)
      expect(rates[0].suite).toBe('Suite B')
      expect(rates[0].passRate).toBe(0)
      expect(rates[0].total).toBe(1)
      expect(rates[0].passed).toBe(0)

      expect(rates[1].suite).toBe('Suite A')
      expect(rates[1].passRate).toBe(100)
      expect(rates[1].total).toBe(2)
      expect(rates[1].passed).toBe(2)
    })
  })
})

describe('RootStore selection', () => {
  let store: RootStore

  beforeEach(() => {
    store = createTestStore()
  })

  it('selectedTest returns null when no test selected', () => {
    expect(store.selectedTest).toBeNull()
  })

  it('selectedTest returns the test result matching selectedTestId', () => {
    const result = makeTestResult({ id: 'my-test' })
    runInAction(() => {
      store.testResultsStore.testResults.set('my-test', result)
    })
    store.selectTest('my-test')
    expect(store.selectedTest).toStrictEqual(result)
  })

  it('selectedTest returns null after clearSelection()', () => {
    const result = makeTestResult({ id: 'my-test' })
    runInAction(() => {
      store.testResultsStore.testResults.set('my-test', result)
    })
    store.selectTest('my-test')
    expect(store.selectedTest).not.toBeNull()
    store.clearSelection()
    expect(store.selectedTest).toBeNull()
  })
})

describe('TestResultsStore filtering', () => {
  let store: RootStore

  beforeEach(() => {
    store = createTestStore()
    runInAction(() => {
      store.testResultsStore.testResults.set(
        'p1',
        makeTestResult({
          id: 'p1',
          title: 'Login Test',
          execution: { status: 'passed', start_time: 0, end_time: 1000, duration: 1000, stacktrace: null, thread: 'main' },
        })
      )
      store.testResultsStore.testResults.set(
        'p2',
        makeTestResult({
          id: 'p2',
          title: 'Checkout Test',
          execution: { status: 'passed', start_time: 0, end_time: 1000, duration: 1000, stacktrace: null, thread: 'main' },
        })
      )
      store.testResultsStore.testResults.set(
        'f1',
        makeTestResult({
          id: 'f1',
          title: 'Payment Test',
          execution: { status: 'failed', start_time: 0, end_time: 1000, duration: 1000, stacktrace: null, thread: 'main' },
        })
      )
    })
  })

  it('filteredResults returns all tests when no filters active', () => {
    expect(store.testResultsStore.filteredResults).toHaveLength(3)
  })

  it('filteredResults excludes tests not matching statusFilters', () => {
    store.testResultsStore.toggleStatusFilter('passed')
    const results = store.testResultsStore.filteredResults
    expect(results).toHaveLength(2)
    expect(results.every(r => r.execution.status === 'passed')).toBe(true)
  })

  it('filteredResults filters by searchQuery (case-insensitive title match)', () => {
    store.testResultsStore.setSearchQuery('login')
    const results = store.testResultsStore.filteredResults
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('p1')
  })

  it('filteredResults combines status filter and search query', () => {
    store.testResultsStore.toggleStatusFilter('passed')
    store.testResultsStore.setSearchQuery('Checkout')
    const results = store.testResultsStore.filteredResults
    expect(results).toHaveLength(1)
    expect(results[0].id).toBe('p2')
  })

  it('activeFilterCount returns 0 when no filters active', () => {
    expect(store.testResultsStore.activeFilterCount).toBe(0)
  })

  it('activeFilterCount returns 1 after status toggle', () => {
    store.testResultsStore.toggleStatusFilter('passed')
    expect(store.testResultsStore.activeFilterCount).toBe(1)
  })

  it('activeFilterCount returns 2 after status toggle + search query', () => {
    store.testResultsStore.toggleStatusFilter('passed')
    store.testResultsStore.setSearchQuery('Login')
    expect(store.testResultsStore.activeFilterCount).toBe(2)
  })

  it('resultsList returns all test results as array', () => {
    expect(store.testResultsStore.resultsList).toHaveLength(3)
  })

  it('clearFilters resets all filters and search query', () => {
    store.testResultsStore.toggleStatusFilter('passed')
    store.testResultsStore.setSearchQuery('Login')
    expect(store.testResultsStore.activeFilterCount).toBe(2)

    store.testResultsStore.clearFilters()

    expect(store.testResultsStore.activeFilterCount).toBe(0)
    expect(store.testResultsStore.searchQuery).toBe('')
    expect(store.testResultsStore.statusFilters.size).toBe(0)
    expect(store.testResultsStore.filteredResults).toHaveLength(3)
  })
})
