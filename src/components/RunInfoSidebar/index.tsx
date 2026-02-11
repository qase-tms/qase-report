import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

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

  // Color logic for pass rate ring (from StatusBarPill)
  const getColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-500'
    if (rate >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const ringColor = getColor(passRate)

  // Format run date
  const startTime = reportStore.runData.execution.start_time
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(startTime))

  // Calculate SVG strokeDasharray for completion ring
  // Circumference = 2 * PI * radius = 2 * PI * 40 = 251.2
  const circumference = 251.2
  const strokeDasharray = `${(passRate / 100) * circumference} ${circumference}`

  return (
    <div className="flex flex-col gap-6">
      {/* Completion rate ring - larger for sidebar (96px) */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative inline-flex">
          {/* SVG with 96px dimensions (w-24 h-24) */}
          <svg className="w-24 h-24">
            {/* Background circle (track) */}
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted opacity-30"
            />
            {/* Foreground circle (progress) */}
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              transform="rotate(-90 48 48)"
              className={ringColor}
            />
          </svg>
          {/* Centered percentage label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">
              {Math.round(passRate)}%
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Pass Rate</p>
      </div>

      {/* Statistics section */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Passed</span>
          <span className="font-medium text-green-500">{stats.passed}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Failed</span>
          <span className="font-medium text-red-500">{stats.failed}</span>
        </div>
        {stats.skipped > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Skipped</span>
            <span className="font-medium">{stats.skipped}</span>
          </div>
        )}
        {flakyCount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Flaky</span>
            <span className="font-medium text-yellow-500">~{flakyCount}</span>
          </div>
        )}
      </div>

      {/* Metadata section with border separator */}
      <div className="pt-4 border-t space-y-2">
        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="text-sm">{formattedDate}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Duration</p>
          <p className="text-sm">{reportStore.formattedDuration}</p>
        </div>
        {reportStore.runData.environment && (
          <div>
            <p className="text-xs text-muted-foreground">Environment</p>
            <p className="text-sm">{reportStore.runData.environment}</p>
          </div>
        )}
      </div>
    </div>
  )
})
