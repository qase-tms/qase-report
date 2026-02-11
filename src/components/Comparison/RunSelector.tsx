import { observer } from 'mobx-react-lite'
import { ArrowLeftRight } from 'lucide-react'
import { useRootStore } from '../../store'

export const RunSelector = observer(() => {
  const { analyticsStore } = useRootStore()
  const {
    comparableRuns,
    selectedBaseRunId,
    selectedCompareRunId,
    setSelectedBaseRunId,
    setSelectedCompareRunId,
  } = analyticsStore

  const formatRunDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  const formatRunLabel = (run: typeof comparableRuns[0]): string => {
    const date = formatRunDate(run.start_time)
    const passRate = run.stats.total > 0
      ? Math.round((run.stats.passed / run.stats.total) * 100)
      : 0
    return `${date} (${passRate}% pass)`
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4 mb-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="min-w-[280px]">
          <label
            htmlFor="base-run-select"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Base Run (older)
          </label>
          <select
            id="base-run-select"
            value={selectedBaseRunId ?? ''}
            onChange={e => setSelectedBaseRunId(e.target.value || null)}
            className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a run</option>
            {comparableRuns.map(run => (
              <option
                key={run.run_id}
                value={run.run_id}
                disabled={run.run_id === selectedCompareRunId}
              >
                {formatRunLabel(run)}
              </option>
            ))}
          </select>
        </div>

        <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />

        <div className="min-w-[280px]">
          <label
            htmlFor="compare-run-select"
            className="block text-xs font-medium text-muted-foreground mb-1"
          >
            Compare Run (newer)
          </label>
          <select
            id="compare-run-select"
            value={selectedCompareRunId ?? ''}
            onChange={e => setSelectedCompareRunId(e.target.value || null)}
            className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a run</option>
            {comparableRuns.map(run => (
              <option
                key={run.run_id}
                value={run.run_id}
                disabled={run.run_id === selectedBaseRunId}
              >
                {formatRunLabel(run)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {comparableRuns.length === 0 && (
        <p className="text-sm text-muted-foreground mt-2">
          Load a report with history data to enable comparison.
        </p>
      )}
    </div>
  )
})
