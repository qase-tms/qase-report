import { observer } from 'mobx-react-lite'
import { AlertCircle } from 'lucide-react'
import { useRootStore } from '../../store'

interface AttentionRequiredCardProps {
  /** Callback when test is clicked - receives test ID for navigation */
  onTestClick: (testId: string) => void
}

/**
 * AttentionRequiredCard component displays tests that need attention.
 *
 * Shows:
 * - Failed tests from current run
 * - Tests that are historically flaky (badge)
 * - Clickable list for navigation
 * - "Failed" badge (error color) and "Flaky" badge (warning color)
 * - Limit to 5 items with "+N more" indicator
 *
 * Handles empty state when no tests require attention.
 */
export const AttentionRequiredCard = observer(
  ({ onTestClick }: AttentionRequiredCardProps) => {
    const { testResultsStore, analyticsStore } = useRootStore()

    // Get failed tests from current run
    const failedTests = testResultsStore.resultsList.filter(
      (test) => test.execution.status === 'failed'
    )

    // Get flaky test signatures
    const flakyTestSignatures = new Set(analyticsStore.flakyTests)

    // Combine failed tests with flaky status
    const testsNeedingAttention = failedTests.map((test) => ({
      ...test,
      isFlaky: test.signature ? flakyTestSignatures.has(test.signature) : false,
    }))

    // Empty state
    if (testsNeedingAttention.length === 0) {
      return (
        <div className="bg-card rounded-lg border shadow-sm h-full">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-green-500" />
              <h6 className="text-lg font-semibold">Attention Required</h6>
            </div>
            <p className="text-sm text-muted-foreground">
              No tests require attention
            </p>
          </div>
        </div>
      )
    }

    // Limit to 5 items
    const displayedTests = testsNeedingAttention.slice(0, 5)

    return (
      <div className="bg-card rounded-lg border shadow-sm h-full">
        <div className="p-4 pb-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h6 className="text-lg font-semibold">Attention Required</h6>
            <span className="px-2 py-1 rounded-full text-xs bg-destructive text-destructive-foreground">
              {testsNeedingAttention.length}
            </span>
          </div>
        </div>
        <div className="p-4 pt-2">
          <div className="space-y-1">
            {displayedTests.map((test) => (
              <div key={test.id}>
                <button
                  onClick={() => onTestClick(test.id)}
                  className="w-full p-2 rounded hover:bg-accent text-left transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[300px]">
                      {test.title}
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-destructive text-destructive-foreground">
                      Failed
                    </span>
                    {test.isFlaky && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500 text-white">
                        Flaky
                      </span>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>

          {testsNeedingAttention.length > 5 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{testsNeedingAttention.length - 5} more tests
            </p>
          )}
        </div>
      </div>
    )
  }
)
