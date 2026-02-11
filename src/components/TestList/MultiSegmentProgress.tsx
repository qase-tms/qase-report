import * as ProgressPrimitive from '@radix-ui/react-progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip'
import { cn } from '../../lib/utils'

export type ProgressSegment = {
  value: number // Cumulative percentage (0-100)
  color: string // Tailwind class: bg-green-500, etc.
  label: string // For tooltip: "Passed: 10"
  count: number // Actual count
}

interface MultiSegmentProgressProps {
  segments: ProgressSegment[]
  duration: number
  className?: string
}

export function MultiSegmentProgress({
  segments,
  duration,
  className,
}: MultiSegmentProgressProps) {
  // Sort segments by value ascending for correct z-index stacking
  const sortedSegments = [...segments]
    .filter((s) => s.value > 0)
    .sort((a, b) => a.value - b.value)

  // Format duration helper
  const formatDuration = (ms: number): string => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
    return `${ms}ms`
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn('w-full', className)}
            role="progressbar"
            aria-label="Suite progress"
          >
            <ProgressPrimitive.Root className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              {sortedSegments.map((segment, index) => (
                <ProgressPrimitive.Indicator
                  key={index}
                  className={cn(segment.color, 'h-full transition-all')}
                  style={{
                    width: `${segment.value}%`,
                    left: '0%',
                    position: 'absolute',
                    // Higher z-index for smaller segments (they stack on top)
                    zIndex: sortedSegments.length - index,
                  }}
                />
              ))}
            </ProgressPrimitive.Root>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <div className="space-y-1">
            <div className="font-medium">
              Duration: {formatDuration(duration)}
            </div>
            <div className="border-t border-border pt-1 mt-1 space-y-0.5">
              {segments.map((seg, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn('w-2 h-2 rounded-full', seg.color)} />
                  <span>{seg.label}</span>
                </div>
              ))}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
