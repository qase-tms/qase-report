interface TimelineAxisProps {
  minTime: number
  maxTime: number
}

export const TimelineAxis = ({ minTime, maxTime }: TimelineAxisProps) => {
  const totalDuration = maxTime - minTime

  // Create 5 time markers at 0%, 25%, 50%, 75%, 100%
  const markers = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
    const time = minTime + totalDuration * ratio
    const position = ratio * 100

    return {
      position,
      time: new Date(time),
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
            {marker.time.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
          <div className="h-2 w-px bg-border" />
        </div>
      ))}
    </div>
  )
}
