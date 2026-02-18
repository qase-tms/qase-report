import { observer } from 'mobx-react-lite'
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Timer,
  Monitor,
} from 'lucide-react'
import { useRootStore } from '../../store'

// Helper to create SVG arc path for donut segment
const createArcPath = (
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  // Convert angles from degrees to radians
  const startRad = ((startAngle - 90) * Math.PI) / 180
  const endRad = ((endAngle - 90) * Math.PI) / 180

  const x1 = centerX + radius * Math.cos(startRad)
  const y1 = centerY + radius * Math.sin(startRad)
  const x2 = centerX + radius * Math.cos(endRad)
  const y2 = centerY + radius * Math.sin(endRad)

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`
}

export const RunInfoSidebar = observer(() => {
  const { reportStore, analyticsStore } = useRootStore()

  // Guard: return early if no report loaded
  if (!reportStore.runData) {
    return (
      <div className="text-sm text-muted-foreground">No report loaded</div>
    )
  }

  const { stats } = reportStore.runData
  const passRate = reportStore.passRate
  const flakyCount = analyticsStore.flakyTestCount
  const passedCount = stats.passed
  const totalCount = stats.total

  // Run status determination
  const runStatus = stats.failed > 0 ? 'failed' : 'passed'
  const StatusIcon = runStatus === 'passed' ? CheckCircle : XCircle
  const statusColor = runStatus === 'passed' ? 'text-passed' : 'text-failed'

  // Format run timestamps
  const startTime = reportStore.runData.execution.start_time
  const endTime = reportStore.runData.execution.end_time
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const formattedDate = dateFormatter.format(new Date(startTime))
  const formattedEndTime = endTime
    ? dateFormatter.format(new Date(endTime))
    : null

  // Calculate and format elapsed time (wall clock time)
  const elapsedMs = endTime ? endTime - startTime : null
  const formatElapsed = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      const remainingMinutes = minutes % 60
      const remainingSeconds = seconds % 60
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`
    }
    if (minutes > 0) {
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }
  const formattedElapsed = elapsedMs !== null ? formatElapsed(elapsedMs) : null

  // Build donut segments data
  const segments = [
    { key: 'passed', value: stats.passed, color: 'var(--status-passed)' },
    { key: 'failed', value: stats.failed, color: 'var(--status-failed)' },
    { key: 'broken', value: stats.broken ?? 0, color: 'var(--status-broken)' },
    { key: 'skipped', value: stats.skipped, color: 'var(--status-skipped)' },
    { key: 'blocked', value: stats.blocked ?? 0, color: 'var(--status-blocked)' },
    { key: 'invalid', value: stats.invalid ?? 0, color: 'var(--status-invalid)' },
    { key: 'muted', value: stats.muted ?? 0, color: 'var(--status-muted)' },
  ].filter(s => s.value > 0)

  // Calculate angles for each segment
  let currentAngle = 0
  const segmentPaths = segments.map(segment => {
    const segmentAngle = (segment.value / totalCount) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + segmentAngle
    currentAngle = endAngle

    // Add small gap between segments (1 degree)
    const gap = segments.length > 1 ? 1 : 0
    const adjustedEndAngle = Math.max(startAngle + 1, endAngle - gap)

    return {
      ...segment,
      path: createArcPath(48, 48, 40, startAngle, adjustedEndAngle),
    }
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Multi-segment donut chart */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative inline-flex">
          <svg className="w-24 h-24" viewBox="0 0 96 96">
            {/* Background circle (track) */}
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted opacity-20"
            />
            {/* Donut segments */}
            {segmentPaths.map(segment => (
              <path
                key={segment.key}
                d={segment.path}
                fill="none"
                stroke={segment.color}
                strokeWidth="8"
                strokeLinecap="round"
              />
            ))}
          </svg>
          {/* Centered percentage label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {Math.round(passRate)}%
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Pass Rate</p>
          <p className="text-xs text-muted-foreground">
            {passedCount} of {totalCount} tests
          </p>
        </div>
      </div>

      {/* Statistics section */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Passed</span>
          <span className="font-medium text-passed">{stats.passed}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Failed</span>
          <span className="font-medium text-failed">{stats.failed}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Skipped</span>
          <span className="font-medium text-skipped">{stats.skipped}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Broken</span>
          <span className="font-medium text-broken">{stats.broken ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Blocked</span>
          <span className="font-medium text-blocked">{stats.blocked ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Invalid</span>
          <span className="font-medium text-invalid">{stats.invalid ?? 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Muted</span>
          <span className="font-medium text-muted-status">{stats.muted ?? 0}</span>
        </div>
        {flakyCount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Flaky</span>
            <span className="font-medium text-broken">~{flakyCount}</span>
          </div>
        )}
      </div>

      {/* Run information section with icons */}
      <div className="pt-4 border-t space-y-3">
        {/* Status field */}
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-4 h-4 ${statusColor}`} />
          <span className="text-xs text-muted-foreground">Status</span>
          <span className={`ml-auto font-medium ${statusColor}`}>
            {runStatus === 'passed' ? 'Passed' : 'Failed'}
          </span>
        </div>

        {/* Started at field */}
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Started at</p>
            <p className="text-sm">{formattedDate}</p>
          </div>
        </div>

        {/* Total Time field */}
        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total Time</p>
            <p className="text-sm">{reportStore.formattedDuration}</p>
          </div>
        </div>

        {/* Finished at field */}
        {formattedEndTime && (
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Finished at</p>
              <p className="text-sm">{formattedEndTime}</p>
            </div>
          </div>
        )}

        {/* Elapsed Time field */}
        {formattedElapsed && (
          <div className="flex items-start gap-2">
            <Timer className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Elapsed Time</p>
              <p className="text-sm">{formattedElapsed}</p>
            </div>
          </div>
        )}

        {/* Environment (conditional, keep existing logic) */}
        {reportStore.runData.environment && (
          <div className="flex items-start gap-2">
            <div className="w-4" /> {/* Spacer for alignment */}
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Environment</p>
              <p className="text-sm">{reportStore.runData.environment}</p>
            </div>
          </div>
        )}
      </div>

      {/* Host Information section (conditional) - show all host_data fields */}
      {reportStore.runData?.host_data && Object.keys(reportStore.runData.host_data).length > 0 && (
        <div className="pt-4 border-t space-y-3">
          <h3 className="text-sm font-semibold">Host Information</h3>

          {Object.entries(reportStore.runData.host_data).map(([key, value]) => {
            if (value === null || value === undefined || value === '') return null

            // Format key: capitalize first letter, replace underscores with spaces
            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')

            return (
              <div key={key} className="flex items-start gap-2">
                <Monitor className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm break-all">{String(value)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})
