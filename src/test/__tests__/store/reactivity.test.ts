import { describe, it, expect, beforeEach } from 'vitest'
import { reaction, runInAction } from 'mobx'
import type { RootStore } from '@/store'
import { createTestStore } from '../../utils/store'
import { makeRun } from '../../factories/run.factory'
import { makeTestResult } from '../../factories/result.factory'
import { makeHistory, makeHistoricalRun } from '../../factories/history.factory'

describe('MobX reactivity', () => {
  let store: RootStore

  beforeEach(() => {
    store = createTestStore()
  })

  it('reaction fires when reportStore.totalTests changes after runData injection', () => {
    const emitted: number[] = []
    const dispose = reaction(
      () => store.reportStore.totalTests,
      value => emitted.push(value)
    )

    runInAction(() => {
      store.reportStore.runData = makeRun({
        stats: { total: 42, passed: 40, failed: 1, skipped: 1 },
      })
    })

    expect(emitted).toEqual([42])
    dispose()
  })

  it('reaction fires when testResultsStore.filteredResults.length changes after toggleStatusFilter', () => {
    // Inject 2 test results: 1 passed, 1 failed
    const passedResult = makeTestResult({
      id: 'test-passed',
      execution: {
        status: 'passed',
        start_time: 1700000000000,
        end_time: 1700000001000,
        duration: 1000,
        stacktrace: null,
        thread: 'main',
      },
    })
    const failedResult = makeTestResult({
      id: 'test-failed',
      execution: {
        status: 'failed',
        start_time: 1700000001000,
        end_time: 1700000002000,
        duration: 1000,
        stacktrace: null,
        thread: 'main',
      },
    })

    runInAction(() => {
      store.testResultsStore.testResults.set('test-passed', passedResult)
      store.testResultsStore.testResults.set('test-failed', failedResult)
    })

    const emitted: number[] = []
    const dispose = reaction(
      () => store.testResultsStore.filteredResults.length,
      value => emitted.push(value)
    )

    // Filter to show only 'passed' tests
    runInAction(() => store.testResultsStore.toggleStatusFilter('passed'))

    expect(emitted).toEqual([1])
    dispose()
  })

  it('reaction fires when historyStore.totalRuns changes after history injection', () => {
    const emitted: number[] = []
    const dispose = reaction(
      () => store.historyStore.totalRuns,
      value => emitted.push(value)
    )

    runInAction(() => {
      store.historyStore.history = makeHistory({
        runs: [
          makeHistoricalRun({ run_id: 'run-1' }),
          makeHistoricalRun({ run_id: 'run-2' }),
        ],
      })
    })

    expect(emitted).toEqual([2])
    dispose()
  })

  it('reaction fires when traceStore.hasTraces changes after trace attachment injection', () => {
    const emitted: boolean[] = []
    const dispose = reaction(
      () => store.traceStore.hasTraces,
      value => emitted.push(value)
    )

    // Inject a test result with a Playwright trace attachment
    const testResultWithTrace = makeTestResult({
      id: 'test-with-trace',
      attachments: [
        {
          id: 'trace-001',
          title: 'Playwright Trace',
          file_name: 'trace.zip',
          file_path: './attachments/trace.zip',
          mime_type: 'application/zip',
          size: 1024,
        },
      ],
    })

    runInAction(() => {
      store.testResultsStore.testResults.set('test-with-trace', testResultWithTrace)
    })

    expect(emitted).toEqual([true])
    dispose()
  })

  it('unrelated mutation does not fire totalTests reaction', () => {
    // Pre-inject runData so totalTests has a base value
    runInAction(() => {
      store.reportStore.runData = makeRun({ stats: { total: 5, passed: 5, failed: 0, skipped: 0 } })
    })

    const emitted: number[] = []
    const dispose = reaction(
      () => store.reportStore.totalTests,
      value => emitted.push(value)
    )

    // Change unrelated observable (activeView)
    runInAction(() => { store.setActiveView('dashboard') })

    expect(emitted).toEqual([])
    dispose()
  })

  it('reaction fires correct number of times for multiple mutations', () => {
    const emitted: number[] = []
    const dispose = reaction(
      () => store.historyStore.totalRuns,
      value => emitted.push(value)
    )

    // First mutation: inject history with 1 run
    runInAction(() => {
      store.historyStore.history = makeHistory({
        runs: [makeHistoricalRun({ run_id: 'run-1' })],
      })
    })

    // Second mutation: update history with 3 runs
    runInAction(() => {
      store.historyStore.history = makeHistory({
        runs: [
          makeHistoricalRun({ run_id: 'run-1' }),
          makeHistoricalRun({ run_id: 'run-2' }),
          makeHistoricalRun({ run_id: 'run-3' }),
        ],
      })
    })

    expect(emitted).toEqual([1, 3])
    dispose()
  })

  it('disposed reaction does not fire on subsequent mutations', () => {
    const emitted: number[] = []
    const dispose = reaction(
      () => store.reportStore.totalTests,
      value => emitted.push(value)
    )

    // Dispose immediately before any mutations
    dispose()

    // Inject runData after disposal
    runInAction(() => {
      store.reportStore.runData = makeRun({ stats: { total: 99, passed: 99, failed: 0, skipped: 0 } })
    })

    expect(emitted).toEqual([])
  })
})
