import { observer } from 'mobx-react-lite'
import { TrendingUp } from 'lucide-react'
import { useRootStore } from '../../store'

interface QuickInsightsCardProps {
  /** Callback when test is clicked - receives test ID for navigation */
  onTestClick: (testId: string) => void
}

/**
 * QuickInsightsCard component displays key test insights.
 *
 * Two sections:
 * 1. Top Failures - Failed tests sorted by historical failure count
 * 2. Slowest Tests - Passed/failed tests sorted by duration descending
 *
 * Each section shows top 3 tests.
 * Handles empty states per section.
 */
export const QuickInsightsCard = observer(
  ({ onTestClick }: QuickInsightsCardProps) => {
    const { testResultsStore, historyStore } = useRootStore()

    // Get failed tests for Top Failures section
    const failedTests = testResultsStore.resultsList.filter(
      (test) => test.execution.status === 'failed'
    )

    // Sort by historical failure count (from history)
    const topFailures = failedTests
      .map((test) => {
        if (!test.signature) return { test, failureCount: 0 }

        const history = historyStore.getTestHistory(test.signature)
        const failureCount = history.filter(
          (run) => run.status === 'failed'
        ).length

        return { test, failureCount }
      })
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, 3)

    // Get slowest tests (both passed and failed)
    const slowestTests = testResultsStore.resultsList
      .filter(
        (test) =>
          test.execution.status === 'passed' ||
          test.execution.status === 'failed'
      )
      .sort((a, b) => b.execution.duration - a.execution.duration)
      .slice(0, 3)

    /**
     * Formats duration in milliseconds to human-readable string
     */
    const formatDuration = (ms: number): string => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)

      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
      }
      return `${seconds}s`
    }

    return (
      <div className="bg-card rounded-lg border shadow-sm h-full">
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h6 className="text-lg font-semibold">Quick Insights</h6>
          </div>
        </div>
        <div className="p-4 pt-2">
          <div className="flex flex-col gap-4">
            {/* Top Failures Section */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Top Failures
              </p>

              {topFailures.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No failures to report
                </p>
              ) : (
                <div className="space-y-1">
                  {topFailures.map(({ test, failureCount }) => (
                    <div key={test.id}>
                      <button
                        onClick={() => onTestClick(test.id)}
                        className="w-full p-2 rounded hover:bg-accent text-left transition-colors"
                      >
                        <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                          {test.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {failureCount > 0
                            ? `Failed ${failureCount} times historically`
                            : 'New failure'}
                        </p>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t" />

            {/* Slowest Tests Section */}
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                Slowest Tests
              </p>

              {slowestTests.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No test duration data
                </p>
              ) : (
                <div className="space-y-1">
                  {slowestTests.map((test) => (
                    <div key={test.id}>
                      <button
                        onClick={() => onTestClick(test.id)}
                        className="w-full p-2 rounded hover:bg-accent text-left transition-colors"
                      >
                        <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                          {test.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(test.execution.duration)}
                        </p>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)
