import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Clock } from 'lucide-react'
import { TimelineBar } from './TimelineBar'
import { TimelineAxis } from './TimelineAxis'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
  if (minutes > 0) {
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${seconds}s`
}

export const Timeline = observer(() => {
  const { testResultsStore, reportStore } = useRootStore()

  // Empty state: No report loaded
  if (!reportStore.runData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <Clock className="w-16 h-16 mb-4 opacity-50" />
        <p>No report loaded</p>
      </div>
    )
  }

  const tests = Array.from(testResultsStore.testResults.values())

  // Filter tests that have timing data
  const testsWithTiming = tests.filter(
    (test) => test.execution.start_time && test.execution.end_time
  )

  // Empty state: No tests with timing data
  if (testsWithTiming.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <Clock className="w-16 h-16 mb-4 opacity-50" />
        <p>No test timing data available</p>
      </div>
    )
  }

  // Calculate timeline bounds
  const minTime = Math.min(...testsWithTiming.map((t) => t.execution.start_time))
  const maxTime = Math.max(...testsWithTiming.map((t) => t.execution.end_time))
  const totalDuration = maxTime - minTime

  // Group tests by thread
  const groupedByThread = testsWithTiming.reduce<Record<string, QaseTestResult[]>>(
    (acc, test) => {
      const thread = test.execution.thread || 'main'
      if (!acc[thread]) {
        acc[thread] = []
      }
      acc[thread].push(test)
      return acc
    },
    {}
  )

  const threadCount = Object.keys(groupedByThread).length
  const formattedTotalDuration = formatDuration(totalDuration)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Test Execution Timeline
        </CardTitle>
        <CardDescription>
          {testsWithTiming.length} tests across {threadCount} thread{threadCount !== 1 ? 's' : ''} • Total duration: {formattedTotalDuration}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Passed
          </Badge>
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Failed
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Broken
          </Badge>
          <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">
            Skipped
          </Badge>
        </div>

        {/* Time Axis */}
        <TimelineAxis minTime={minTime} maxTime={maxTime} />

        {/* Swimlanes */}
        <div className="space-y-4">
          {Object.entries(groupedByThread).map(([thread, threadTests]) => (
            <div key={thread} className="border-l-2 border-muted pl-4">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Thread: {thread}
              </div>
              <div className="relative h-12 bg-muted/20 rounded">
                {threadTests.map((test) => (
                  <TimelineBar
                    key={test.id}
                    test={test}
                    minTime={minTime}
                    totalDuration={totalDuration}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
})
