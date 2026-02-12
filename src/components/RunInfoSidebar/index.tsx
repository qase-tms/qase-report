import { observer } from 'mobx-react-lite'
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  FileText,
  Monitor,
  Cpu,
  Box,
  Code,
} from 'lucide-react'
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
  const passedCount = stats.passed
  const totalCount = stats.total

  // Color logic for pass rate ring (from StatusBarPill)
  const getColor = (rate: number): string => {
    if (rate >= 80) return 'text-green-500'
    if (rate >= 50) return 'text-yellow-500'
    return 'text-red-500'
  }

  const ringColor = getColor(passRate)

  // Run status determination
  const runStatus = stats.failed > 0 ? 'failed' : 'passed'
  const StatusIcon = runStatus === 'passed' ? CheckCircle : XCircle
  const statusColor = runStatus === 'passed' ? 'text-green-500' : 'text-red-500'

  // Format run timestamps
  const startTime = reportStore.runData.execution.start_time
  const endTime = reportStore.runData.execution.end_time
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  const formattedDate = dateFormatter.format(new Date(startTime))
  const formattedEndTime = dateFormatter.format(new Date(endTime))

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
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Finished at</p>
            <p className="text-sm">{formattedEndTime}</p>
          </div>
        </div>

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

      {/* Run Information section */}
      <div className="pt-4 border-t space-y-3">
        <h3 className="text-sm font-semibold">Run Information</h3>
        {/* Title field */}
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Title</p>
            <p className="text-sm">
              {reportStore.runData.title || 'Untitled Run'}
            </p>
          </div>
        </div>
      </div>

      {/* Host Information section (conditional) */}
      {reportStore.runData?.host_data && (
        <div className="pt-4 border-t space-y-3">
          <h3 className="text-sm font-semibold">Host Information</h3>

          {/* System field */}
          <div className="flex items-start gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">System</p>
              <p className="text-sm">{reportStore.runData.host_data.system}</p>
            </div>
          </div>

          {/* Machine field */}
          <div className="flex items-start gap-2">
            <Cpu className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Machine</p>
              <p className="text-sm">{reportStore.runData.host_data.machine}</p>
            </div>
          </div>

          {/* Node field */}
          <div className="flex items-start gap-2">
            <Box className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Node</p>
              <p className="text-sm">{reportStore.runData.host_data.node}</p>
            </div>
          </div>

          {/* Python field (conditional) */}
          {reportStore.runData.host_data.python && (
            <div className="flex items-start gap-2">
              <Code className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Python</p>
                <p className="text-sm">
                  {reportStore.runData.host_data.python}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
})
