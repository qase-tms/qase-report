import { observer } from 'mobx-react-lite'
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { useRootStore } from '../../store'
import type { HistoricalRun } from '../../schemas/QaseHistory.schema'
import { HelpTooltip } from './HelpTooltip'

/**
 * Determines status color based on run statistics.
 * Failed tests = error (red), skipped/blocked = warning (yellow), all passed = success (green)
 */
const getRunStatusColor = (
  run: HistoricalRun
): string => {
  if (run.stats.failed > 0) return 'text-failed'
  if (run.stats.skipped > 0 || (run.stats.blocked ?? 0) > 0) return 'text-broken'
  return 'text-passed'
}

/**
 * Determines status icon based on run statistics.
 */
const getRunStatusIcon = (run: HistoricalRun) => {
  const colorClass = getRunStatusColor(run)
  if (run.stats.failed > 0) return <XCircle className={`w-6 h-6 ${colorClass}`} />
  if (run.stats.skipped > 0 || (run.stats.blocked ?? 0) > 0) return <AlertTriangle className={`w-6 h-6 ${colorClass}`} />
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
 * Horizontal scrollable visualization of recent test runs.
 * Shows chronological history with status indicators, statistics, and duration.
 * Runs display as compact cards with horizontal scroll capability.
 */
export const HistoryTimeline = observer(() => {
  const { historyStore } = useRootStore()

  // Don't render if no history data
  if (historyStore.recentRuns.length === 0) {
    return null
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h6 className="text-lg font-semibold">Recent Runs</h6>
        <HelpTooltip content="Timeline of recent test runs. Green = all passed, Yellow = has skipped/blocked, Red = has failures. Shows passed/failed/skipped counts and duration." />
      </div>

      {/* Horizontal scrollable container */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {historyStore.recentRuns.map((run) => (
          <div
            key={run.run_id}
            className="min-w-[200px] max-w-[220px] flex-shrink-0 bg-muted/50 rounded-lg p-3 border"
          >
            {/* Status icon centered at top */}
            <div className="flex justify-center mb-2">
              {getRunStatusIcon(run)}
            </div>

            {/* Title */}
            <p className="text-sm font-medium mb-1 truncate text-center">
              {run.title || `Run ${run.run_id}`}
            </p>

            {/* Date/Time */}
            <p className="text-xs text-muted-foreground text-center mb-2">
              {new Date(run.start_time).toLocaleDateString()}{' '}
              {new Date(run.start_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>

            {/* Stats badges */}
            <div className="flex flex-wrap gap-1 justify-center mb-1">
              <span className="px-2 py-0.5 rounded-full text-xs bg-passed text-white">
                {run.stats.passed}
              </span>
              {run.stats.failed > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-failed text-white">
                  {run.stats.failed}
                </span>
              )}
              {run.stats.skipped > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-broken text-text-black">
                  {run.stats.skipped}
                </span>
              )}
            </div>

            {/* Duration */}
            <p className="text-xs text-muted-foreground text-center">
              {formatDuration(run.duration)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
})
