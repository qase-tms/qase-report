import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const StatusBarPill = observer(() => {
  const { reportStore, analyticsStore } = useRootStore()

  // Guard: return null if no report loaded
  if (!reportStore.runData) {
    return null
  }

  const { stats } = reportStore.runData
  const passRate = reportStore.passRate
  const flakyCount = analyticsStore.flakyTestCount

  // Color logic for pass rate ring (Qase TMS fill colors for SVG)
  const getColor = (rate: number): string => {
    if (rate >= 80) return 'var(--status-passed-fill)'
    if (rate >= 50) return 'var(--status-broken-fill)'
    return 'var(--status-failed-fill)'
  }

  // Format run date
  const startTime = reportStore.runData.execution.start_time
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(startTime))

  const ringColor = getColor(passRate)

  return (
    <div className="flex items-center gap-4">
      {/* Compact pass rate ring (40px) */}
      <div className="relative inline-flex">
        {/* Background ring (track) */}
        <svg className="w-10 h-10">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-muted opacity-30"
          />
          {/* Foreground ring (progress) */}
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={ringColor}
            strokeWidth="4"
            strokeDasharray={`${(passRate / 100) * 100.53} 100.53`}
            strokeLinecap="round"
            transform="rotate(-90 20 20)"
          />
        </svg>
        {/* Centered percentage label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold">
            {Math.round(passRate)}%
          </span>
        </div>
      </div>

      {/* Quick stats section - hidden on mobile */}
      <div className="hidden sm:flex items-center gap-2">
        <p className="text-sm text-passed font-medium">
          {stats.passed} passed
        </p>
        <p className="text-sm text-muted-foreground">•</p>
        <p className="text-sm text-failed font-medium">
          {stats.failed} failed
        </p>
        {stats.skipped > 0 && (
          <>
            <p className="text-sm text-muted-foreground">•</p>
            <p className="text-sm text-skipped">
              {stats.skipped} skipped
            </p>
          </>
        )}
        {flakyCount > 0 && (
          <>
            <p className="text-sm text-muted-foreground">•</p>
            <p className="text-sm text-broken font-medium">
              ~{flakyCount} flaky
            </p>
          </>
        )}
      </div>

      {/* Run metadata - hidden on small screens */}
      <p className="hidden md:block text-sm text-muted-foreground">
        {formattedDate} • {reportStore.formattedDuration}
      </p>
    </div>
  )
})
