import { describe, it, expect, beforeEach } from 'vitest'
import { runInAction } from 'mobx'
import { createTestStore } from '../../utils/store'
import { makeTestResult } from '../../factories/result.factory'
import type { RootStore } from '@/store'

/**
 * Tests for AnalyticsStore.failureClusters getter.
 *
 * failureClusters reads from root.testResultsStore.resultsList,
 * filters failed tests, groups them by normalized error message,
 * and returns only clusters with >= 2 tests.
 *
 * Normalization: first 100 chars, lowercase, trim, whitespace normalize.
 * Null error source -> '__no_error__' sentinel.
 */

describe('AnalyticsStore: failureClusters', () => {
  let store: RootStore

  beforeEach(() => {
    store = createTestStore()
  })

  it('groups two failed tests with the same error message into one cluster', () => {
    const err = 'AssertionError: expected true to be false'
    runInAction(() => {
      store.testResultsStore.testResults.set(
        'test-a',
        makeTestResult({
          id: 'test-a',
          execution: { ...makeTestResult().execution, status: 'failed' },
          message: err,
        })
      )
      store.testResultsStore.testResults.set(
        'test-b',
        makeTestResult({
          id: 'test-b',
          execution: { ...makeTestResult().execution, status: 'failed' },
          message: err,
        })
      )
    })

    const clusters = store.analyticsStore.failureClusters
    expect(clusters).toHaveLength(1)
    expect(clusters[0].tests).toHaveLength(2)
    expect(clusters[0].errorPattern).toBe(err.slice(0, 100).toLowerCase().trim().replace(/\s+/g, ' '))
  })

  it('excludes single failed test (cluster requires >= 2 tests)', () => {
    runInAction(() => {
      store.testResultsStore.testResults.set(
        'test-single',
        makeTestResult({
          id: 'test-single',
          execution: { ...makeTestResult().execution, status: 'failed' },
          message: 'Unique error only once',
        })
      )
    })

    const clusters = store.analyticsStore.failureClusters
    expect(clusters).toHaveLength(0)
  })

  it('normalizes error message: truncates to 100 chars, lowercases, trims, normalizes whitespace', () => {
    // Construct an error that exceeds 100 chars
    const longError = 'A'.repeat(50) + ' ' + 'B'.repeat(60) // 111 chars total
    runInAction(() => {
      store.testResultsStore.testResults.set(
        'test-norm-1',
        makeTestResult({
          id: 'test-norm-1',
          execution: { ...makeTestResult().execution, status: 'failed' },
          message: longError,
        })
      )
      store.testResultsStore.testResults.set(
        'test-norm-2',
        makeTestResult({
          id: 'test-norm-2',
          execution: { ...makeTestResult().execution, status: 'failed' },
          // Same message — both will normalize to same key
          message: longError,
        })
      )
    })

    const clusters = store.analyticsStore.failureClusters
    expect(clusters).toHaveLength(1)
    // Key must be exactly the first 100 chars, lowercased
    expect(clusters[0].errorPattern).toBe(longError.slice(0, 100).toLowerCase().trim().replace(/\s+/g, ' '))
    expect(clusters[0].errorPattern.length).toBeLessThanOrEqual(100)
  })

  it('uses __no_error__ sentinel when test message is null', () => {
    runInAction(() => {
      store.testResultsStore.testResults.set(
        'test-null-1',
        makeTestResult({
          id: 'test-null-1',
          execution: {
            ...makeTestResult().execution,
            status: 'failed',
            stacktrace: null,
          },
          message: null,
        })
      )
      store.testResultsStore.testResults.set(
        'test-null-2',
        makeTestResult({
          id: 'test-null-2',
          execution: {
            ...makeTestResult().execution,
            status: 'failed',
            stacktrace: null,
          },
          message: null,
        })
      )
    })

    const clusters = store.analyticsStore.failureClusters
    expect(clusters).toHaveLength(1)
    expect(clusters[0].errorPattern).toBe('__no_error__')
  })

  it('sorts clusters by count descending', () => {
    const errorA = 'error alpha'
    const errorB = 'error beta'
    runInAction(() => {
      // 2 tests with errorA
      store.testResultsStore.testResults.set(
        'a1',
        makeTestResult({ id: 'a1', execution: { ...makeTestResult().execution, status: 'failed' }, message: errorA })
      )
      store.testResultsStore.testResults.set(
        'a2',
        makeTestResult({ id: 'a2', execution: { ...makeTestResult().execution, status: 'failed' }, message: errorA })
      )
      // 3 tests with errorB
      store.testResultsStore.testResults.set(
        'b1',
        makeTestResult({ id: 'b1', execution: { ...makeTestResult().execution, status: 'failed' }, message: errorB })
      )
      store.testResultsStore.testResults.set(
        'b2',
        makeTestResult({ id: 'b2', execution: { ...makeTestResult().execution, status: 'failed' }, message: errorB })
      )
      store.testResultsStore.testResults.set(
        'b3',
        makeTestResult({ id: 'b3', execution: { ...makeTestResult().execution, status: 'failed' }, message: errorB })
      )
    })

    const clusters = store.analyticsStore.failureClusters
    expect(clusters).toHaveLength(2)
    // errorB has 3 tests, so it should be first
    expect(clusters[0].tests).toHaveLength(3)
    expect(clusters[1].tests).toHaveLength(2)
  })

  it('returns empty array when there are no failed tests', () => {
    runInAction(() => {
      store.testResultsStore.testResults.set(
        'test-pass',
        makeTestResult({ id: 'test-pass' })
      )
    })

    const clusters = store.analyticsStore.failureClusters
    expect(clusters).toHaveLength(0)
  })
})
