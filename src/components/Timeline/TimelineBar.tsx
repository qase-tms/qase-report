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
  const width = Math.max(0.5, (test.execution.duration / totalDuration) * 100) // Minimum 0.5% for visibility

  // Status color classes
  const statusColors = {
    passed: 'bg-green-500 hover:bg-green-600',
    failed: 'bg-red-500 hover:bg-red-600',
    broken: 'bg-yellow-500 hover:bg-yellow-600',
    skipped: 'bg-gray-500 hover:bg-gray-600',
  }

  const colorClass = statusColors[test.execution.status]
  const formattedDuration = formatDuration(test.execution.duration)

  return (
    <div
      className={`absolute h-10 rounded flex items-center px-2 text-xs text-white cursor-pointer transition-colors truncate ${colorClass}`}
      style={{ left: `${startOffset}%`, width: `${width}%` }}
      onClick={() => selectTest(test.id)}
      title={`${test.title} (${formattedDuration})`}
    >
      {test.title}
    </div>
  )
})
