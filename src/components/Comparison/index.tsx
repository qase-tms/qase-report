import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { Skeleton } from '@/components/ui/skeleton'
import { RunSelector } from './RunSelector'
import { ComparisonSummary } from './ComparisonSummary'
import { DiffList } from './DiffList'

export const Comparison = observer(() => {
  const { analyticsStore, reportStore, historyStore } = useRootStore()

  // No report loaded
  if (!reportStore.runData) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // No history data
  if (!historyStore.isHistoryLoaded || analyticsStore.comparableRuns.length < 2) {
    return (
      <div className="p-6">
        <h5 className="text-xl font-semibold mb-4">
          Comparison
        </h5>
        <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
          <p className="text-muted-foreground">
            At least 2 runs are required for comparison. Load a report with history data containing multiple runs.
          </p>
        </div>
      </div>
    )
  }

  const comparison = analyticsStore.comparison

  return (
    <div className="p-6">
      <div className="mb-6">
        <h5 className="text-xl font-semibold mb-2">
          Comparison
        </h5>
        <p className="text-sm text-muted-foreground">
          Compare two test runs to see status changes, added/removed tests, and duration differences.
        </p>
      </div>

      <RunSelector />

      {comparison ? (
        <>
          <ComparisonSummary comparison={comparison} />
          <DiffList comparison={comparison} />
        </>
      ) : (
        <div className="bg-card rounded-lg border shadow-sm p-6 text-center">
          <p className="text-muted-foreground">
            Select two runs above to see the comparison.
          </p>
        </div>
      )}
    </div>
  )
})
