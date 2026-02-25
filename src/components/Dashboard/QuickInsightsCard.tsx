import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { TrendingUp, Clock, XCircle } from 'lucide-react'
import { useRootStore } from '../../store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HelpTooltip } from './HelpTooltip'

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
    const [failuresDialogOpen, setFailuresDialogOpen] = useState(false)
    const [slowestDialogOpen, setSlowestDialogOpen] = useState(false)

    // Get failed tests for Top Failures section
    const failedTests = testResultsStore.resultsList.filter(
      (test) => test.execution.status === 'failed'
    )

    // Sort by historical failure count (from history)
    const allTopFailures = failedTests
      .map((test) => {
        if (!test.signature) return { test, failureCount: 0 }

        const history = historyStore.getTestHistory(test.signature)
        const failureCount = history.filter(
          (run) => run.status === 'failed'
        ).length

        return { test, failureCount }
      })
      .sort((a, b) => b.failureCount - a.failureCount)

    const topFailures = allTopFailures.slice(0, 3)

    // Get slowest tests (both passed and failed)
    const allSlowestTests = testResultsStore.resultsList
      .filter(
        (test) =>
          test.execution.status === 'passed' ||
          test.execution.status === 'failed'
      )
      .sort((a, b) => b.execution.duration - a.execution.duration)

    const slowestTests = allSlowestTests.slice(0, 3)

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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h6 className="text-lg font-semibold">Quick Insights</h6>
            </div>
            <HelpTooltip content="Top Failures: tests with most historical failures. Slowest Tests: longest running tests by execution time. Click any test to view details." />
          </div>
        </div>
        <div className="p-4 pt-2">
          <div className="grid grid-cols-2 gap-6">
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
                <>
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
                  {allTopFailures.length > 3 && (
                    <button
                      onClick={() => setFailuresDialogOpen(true)}
                      className="text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
                    >
                      +{allTopFailures.length - 3} more
                    </button>
                  )}
                </>
              )}
            </div>

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
                <>
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
                  {allSlowestTests.length > 3 && (
                    <button
                      onClick={() => setSlowestDialogOpen(true)}
                      className="text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
                    >
                      +{allSlowestTests.length - 3} more
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Failures Dialog */}
        <Dialog open={failuresDialogOpen} onOpenChange={setFailuresDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-failed" />
                Top Failures
                <span className="px-2 py-1 rounded-full text-xs bg-failed text-white">
                  {allTopFailures.length}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              <div className="space-y-1">
                {allTopFailures.map(({ test, failureCount }) => (
                  <div key={test.id}>
                    <button
                      onClick={() => {
                        onTestClick(test.id)
                        setFailuresDialogOpen(false)
                      }}
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
            </div>
          </DialogContent>
        </Dialog>

        {/* Slowest Tests Dialog */}
        <Dialog open={slowestDialogOpen} onOpenChange={setSlowestDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Slowest Tests
                <span className="px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground">
                  {allSlowestTests.length}
                </span>
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              <div className="space-y-1">
                {allSlowestTests.map((test) => (
                  <div key={test.id}>
                    <button
                      onClick={() => {
                        onTestClick(test.id)
                        setSlowestDialogOpen(false)
                      }}
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
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }
)
