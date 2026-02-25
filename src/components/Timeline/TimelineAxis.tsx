interface TimelineAxisProps {
  minTime: number
  maxTime: number
}

const formatRelativeTime = (ms: number): string => {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  const seconds = ms / 1000
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}m ${remainingSeconds}s`
}

export const TimelineAxis = ({ minTime, maxTime }: TimelineAxisProps) => {
  const totalDuration = maxTime - minTime

  // Create 5 time markers at 0%, 25%, 50%, 75%, 100%
  const markers = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const relativeTime = totalDuration * ratio
    const position = ratio * 100

    return {
      position,
      relativeTime,
    }
  })

  return (
    <div className="relative h-12 border-b border-border mb-4">
      {markers.map((marker, index) => (
        <div
          key={index}
          className="absolute flex flex-col items-center -translate-x-1/2"
          style={{ left: `${marker.position}%` }}
        >
          <span className="text-xs text-muted-foreground mb-1">
            {formatRelativeTime(marker.relativeTime)}
          </span>
          <div className="h-2 w-px bg-border" />
        </div>
      ))}
    </div>
  )
}
