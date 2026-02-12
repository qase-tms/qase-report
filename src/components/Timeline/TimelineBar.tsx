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

  // Status color classes
  const statusColors: Record<string, string> = {
    passed: 'bg-green-500 hover:bg-green-600',
    failed: 'bg-red-500 hover:bg-red-600',
    broken: 'bg-yellow-500 hover:bg-yellow-600',
    skipped: 'bg-gray-500 hover:bg-gray-600',
    blocked: 'bg-blue-500 hover:bg-blue-600',
    invalid: 'bg-orange-500 hover:bg-orange-600',
    muted: 'bg-purple-500 hover:bg-purple-600',
  }

  const colorClass = statusColors[test.execution.status] || 'bg-gray-500 hover:bg-gray-600'
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
