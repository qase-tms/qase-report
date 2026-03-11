import { screen, act } from '@testing-library/react'
import { describe, it, expect, beforeAll, vi } from 'vitest'
import { runInAction } from 'mobx'
import { renderWithProviders } from '../../utils/render'
import { Dashboard } from '@/components/Dashboard'
import { makeRun } from '../../factories/run.factory'
import { makeTestResult } from '../../factories/result.factory'

// jsdom does not implement window.matchMedia — required by usePrefersReducedMotion hook
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('Dashboard', () => {
  it('renders skeleton placeholders when no runData (zero-data state)', () => {
    renderWithProviders(<Dashboard />)
    // reportStore.runData is null by default — Dashboard renders Skeleton elements
    // Content headings like 'Quick Insights' are NOT in the document
    expect(screen.queryByText('Quick Insights')).not.toBeInTheDocument()
    expect(screen.queryByText('Attention Required')).not.toBeInTheDocument()
  })

  it('renders content cards when runData is populated', () => {
    const { store } = renderWithProviders(<Dashboard />)
    act(() => {
      runInAction(() => {
        store.reportStore.runData = makeRun()
      })
    })
    expect(screen.getByText('Quick Insights')).toBeInTheDocument()
    expect(screen.getByText('Attention Required')).toBeInTheDocument()
  })

  it('shows "No tests require attention" when no failed tests', () => {
    const { store } = renderWithProviders(<Dashboard />)
    act(() => {
      runInAction(() => {
        store.reportStore.runData = makeRun()
        // Only passed test in store — no failed tests
        const passedTest = makeTestResult({ id: 'pass-1', title: 'Passing Login Test' })
        store.testResultsStore.testResults.set(passedTest.id, passedTest)
      })
    })
    expect(screen.getByText('No tests require attention')).toBeInTheDocument()
  })

  it('shows failed test title in AttentionRequired when failed test present', () => {
    const { store } = renderWithProviders(<Dashboard />)
    act(() => {
      runInAction(() => {
        store.reportStore.runData = makeRun()
        const failedTest = makeTestResult({
          id: 'fail-1',
          title: 'Failing Login Test',
          execution: { ...makeTestResult().execution, status: 'failed' },
        })
        store.testResultsStore.testResults.set(failedTest.id, failedTest)
      })
    })
    // The test title appears in AttentionRequiredCard and QuickInsightsCard — assert at least one is present
    expect(screen.getAllByText('Failing Login Test').length).toBeGreaterThan(0)
  })

  it('shows TestHealthWidget empty state message when historyStore.isHistoryLoaded is true but no stability data', () => {
    const { store } = renderWithProviders(<Dashboard />)
    act(() => {
      runInAction(() => {
        store.reportStore.runData = makeRun()
        store.historyStore.isHistoryLoaded = true
      })
    })
    // TestHealthWidget shows the insufficient data message when testStabilityMap is empty
    expect(screen.getByText(/load history data/i)).toBeInTheDocument()
  })
})
