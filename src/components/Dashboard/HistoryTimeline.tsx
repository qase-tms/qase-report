import { observer } from 'mobx-react-lite'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useRootStore } from '../../store'
import type { HistoricalRun } from '../../schemas/QaseHistory.schema'

/**
 * Determines status color based on run statistics.
 * Failed tests = error (red), skipped/broken = warning (yellow), all passed = success (green)
 */
const getRunStatusColor = (
  run: HistoricalRun
): string => {
  if (run.stats.failed > 0) return 'text-red-500'
  if (run.stats.skipped > 0 || (run.stats.broken ?? 0) > 0) return 'text-yellow-500'
  return 'text-green-500'
}

/**
 * Determines status icon based on run statistics.
 */
const getRunStatusIcon = (run: HistoricalRun) => {
  const colorClass = getRunStatusColor(run)
  if (run.stats.failed > 0) return <XCircle className={`w-6 h-6 ${colorClass}`} />
  if (run.stats.skipped > 0 || (run.stats.broken ?? 0) > 0) return <AlertTriangle className={`w-6 h-6 ${colorClass}`} />
  return <CheckCircle className={`w-6 h-6 ${colorClass}`} />
}

/**
 * Formats duration from milliseconds to human-readable string.
 * Displays milliseconds, seconds, or minutes/seconds based on magnitude.
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
}

/**
 * Timeline visualization of recent test runs.
 * Shows chronological history with status indicators, statistics, and duration.
 * Most recent runs appear at the top.
 */
export const HistoryTimeline = observer(() => {
  const { historyStore } = useRootStore()

  // Don't render if no history data
  if (historyStore.recentRuns.length === 0) {
    return null
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4">
      <h6 className="text-lg font-semibold mb-4">Recent Runs</h6>

      {/* Custom Timeline */}
      <div className="space-y-4">
        {historyStore.recentRuns.map((run, index) => (
          <div key={run.run_id} className="flex gap-4">
            {/* Left: Date/Time */}
            <div className="flex-shrink-0 w-32 text-right">
              <p className="text-sm text-muted-foreground">
                {new Date(run.start_time).toLocaleDateString()}
              </p>
              <span className="text-xs text-muted-foreground">
                {new Date(run.start_time).toLocaleTimeString()}
              </span>
            </div>

            {/* Center: Icon + Connector */}
            <div className="flex flex-col items-center">
              <div className="flex-shrink-0">
                {getRunStatusIcon(run)}
              </div>
              {index < historyStore.recentRuns.length - 1 && (
                <div className="flex-grow w-px bg-border min-h-[40px] my-2" />
              )}
            </div>

            {/* Right: Content */}
            <div className="flex-grow pb-4">
              <p className="text-sm font-medium mb-1">
                {run.title || `Run ${run.run_id}`}
              </p>
              <div className="flex flex-wrap gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-500">
                  {run.stats.passed} passed
                </span>
                {run.stats.failed > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-500">
                    {run.stats.failed} failed
                  </span>
                )}
                {run.stats.skipped > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-500">
                    {run.stats.skipped} skipped
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDuration(run.duration)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
})
