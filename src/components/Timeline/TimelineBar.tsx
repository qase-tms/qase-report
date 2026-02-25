import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TimelineBarProps {
  test: QaseTestResult
  minTime: number
  totalDuration: number
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
}

export const TimelineBar = observer(({ test, minTime, totalDuration }: TimelineBarProps) => {
  const { selectTest } = useRootStore()

  // Calculate positioning as percentage
  const startOffset = ((test.execution.start_time - minTime) / totalDuration) * 100
  const rawWidth = (test.execution.duration / totalDuration) * 100
  // Clamp width: minimum 0.5% for visibility, maximum to not exceed container
  const width = Math.max(0.5, Math.min(rawWidth, 100 - startOffset))

  // Status color classes (Qase TMS palette)
  const statusColors: Record<string, string> = {
    passed: 'bg-passed hover:opacity-80',
    failed: 'bg-failed hover:opacity-80',
    broken: 'bg-broken hover:opacity-80',
    skipped: 'bg-skipped hover:opacity-80',
    blocked: 'bg-blocked hover:opacity-80',
    invalid: 'bg-invalid hover:opacity-80',
    muted: 'bg-muted-status hover:opacity-80',
  }

  const colorClass = statusColors[test.execution.status] || 'bg-skipped hover:opacity-80'
  const formattedDuration = formatDuration(test.execution.duration)

  return (
    <div
      className={`absolute h-5 top-0.5 rounded cursor-pointer transition-colors ring-1 ring-background ${colorClass}`}
      style={{ left: `${startOffset}%`, width: `${width}%` }}
      onClick={() => selectTest(test.id)}
      title={`${test.title} (${formattedDuration})`}
    />
  )
})
