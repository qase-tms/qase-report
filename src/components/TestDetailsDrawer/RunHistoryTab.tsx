import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { Badge } from '../ui/badge'

export const RunHistoryTab = observer(() => {
  const { historyStore, selectedTest } = useRootStore()

  if (!selectedTest) return null

  // Check if history is loaded
  if (!historyStore.isHistoryLoaded) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No history data loaded</p>
        <p className="text-sm text-muted-foreground mt-2">
          Load a report with test-history.json to see historical runs
        </p>
      </div>
    )
  }

  // Get test history (last 20 runs per research recommendation)
  const testHistory = historyStore.getTestHistory(selectedTest.signature || '')
  const recentHistory = testHistory.slice(-20).reverse() // Most recent first

  if (recentHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No historical runs for this test</p>
      </div>
    )
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
    return `${ms}ms`
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-4">
        Last {recentHistory.length} runs
      </p>
      {recentHistory.map((run, index) => (
        <div
          key={`${run.run_id}-${index}`}
          className="flex items-center gap-3 p-3 rounded-md bg-muted/50"
        >
          <Badge variant={run.status} className="capitalize shrink-0">
            {run.status}
          </Badge>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatDuration(run.duration)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {formatDate(run.start_time)}
            </p>
          </div>
          {run.error_message && (
            <p className="text-xs text-red-500 truncate max-w-[200px]" title={run.error_message}>
              {run.error_message}
            </p>
          )}
        </div>
      ))}
    </div>
  )
})
