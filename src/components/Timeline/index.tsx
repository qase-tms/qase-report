import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Clock, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
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
  const [zoom, setZoom] = useState(1)

  const zoomIn = () => setZoom((z) => Math.min(z + 0.5, 5))
  const zoomOut = () => setZoom((z) => Math.max(z - 0.5, 1))
  const resetZoom = () => setZoom(1)

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
  const runStartTime = reportStore.runData.execution.start_time

  // Transform tests: use run start_time as fallback, calculate end_time from duration if needed
  const testsWithTiming = tests.map((test) => {
    const startTime = typeof test.execution.start_time === 'number'
      ? test.execution.start_time
      : runStartTime
    const endTime = typeof test.execution.end_time === 'number'
      ? test.execution.end_time
      : startTime + (test.execution.duration || 0)

    return {
      ...test,
      execution: {
        ...test.execution,
        start_time: startTime,
        end_time: endTime,
      },
    }
  })

  // Calculate timeline bounds
  const minTime = Math.min(...testsWithTiming.map((t) => t.execution.start_time))
  const maxTime = Math.max(...testsWithTiming.map((t) => t.execution.end_time))
  const totalDuration = maxTime - minTime

  // Empty state: No duration (all tests instant)
  if (totalDuration === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <Clock className="w-16 h-16 mb-4 opacity-50" />
        <p>No test timing data available</p>
      </div>
    )
  }

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
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Test Execution Timeline
            </CardTitle>
            <CardDescription>
              {testsWithTiming.length} tests across {threadCount} thread{threadCount !== 1 ? 's' : ''} • Total duration: {formattedTotalDuration}
            </CardDescription>
          </div>
          {/* Legend and zoom controls - top right */}
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5 flex-wrap">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                Passed
              </Badge>
              <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                Failed
              </Badge>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs">
                Broken
              </Badge>
              <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20 text-xs">
                Skipped
              </Badge>
            </div>
            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={zoomOut} disabled={zoom <= 1}>
                <ZoomOut className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground w-8 text-center">{zoom}x</span>
              <Button variant="outline" size="icon" className="h-7 w-7" onClick={zoomIn} disabled={zoom >= 5}>
                <ZoomIn className="h-3.5 w-3.5" />
              </Button>
              {zoom !== 1 && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetZoom}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Scrollable container for zoom */}
        <div className="overflow-x-auto">
          <div style={{ width: `${zoom * 100}%`, minWidth: '100%' }} className="space-y-4">
            {/* Time Axis */}
            <TimelineAxis minTime={minTime} maxTime={maxTime} />

            {/* Swimlanes */}
            <div className="space-y-3">
              {Object.entries(groupedByThread).map(([thread, threadTests]) => (
                <div key={thread} className="border-l-2 border-muted pl-3">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Thread: {thread}
                  </div>
                  <div className="relative h-6 bg-muted/20 rounded overflow-hidden">
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
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
