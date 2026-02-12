import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Badge } from '../ui/badge'
import { formatDuration } from '../../utils/formatDuration'
import type { Step } from '../../schemas/Step.schema'
import type { Attachment } from '../../schemas/Attachment.schema'
import { TestStepAttachment } from './TestStepAttachment'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { cn } from '../../lib/utils'

interface TestStepProps {
  step: Step
  depth: number
}

export const TestStep = observer(({ step, depth }: TestStepProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasChildren = step.steps && step.steps.length > 0
  const hasAttachments =
    step.execution.attachments && step.execution.attachments.length > 0

  const marginLeft = Math.min(depth * 12, 96) // 12px per depth level, max 96px

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="py-1">
      {/* Step row */}
      <div className="flex items-center gap-2">
        {/* Expand/collapse button or spacer */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'collapse' : 'expand'}
            className="p-1 rounded hover:bg-accent transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-6" />
        )}

        {/* Status badge */}
        <Badge variant={step.execution.status} className="capitalize shrink-0">
          {step.execution.status}
        </Badge>

        {/* Step action/title */}
        <span className="text-sm flex-1">
          {step.data?.action ||
            step.step_type.charAt(0).toUpperCase() + step.step_type.slice(1)}
        </span>

        {/* Duration */}
        <span className="text-xs text-muted-foreground">
          {formatDuration(step.execution.duration)}
        </span>
      </div>

      {/* Expanded content: attachments and nested steps */}
      <div
        className={cn(
          'overflow-hidden',
          prefersReducedMotion ? '' : 'transition-all duration-300',
          isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        {/* Attachments */}
        {hasAttachments &&
          step.execution.attachments.map((attachment: Attachment) => (
            <TestStepAttachment key={attachment.id} attachment={attachment} />
          ))}

        {/* Nested steps */}
        {hasChildren &&
          step.steps.map((childStep: Step) => (
            <TestStep key={childStep.id} step={childStep} depth={depth + 1} />
          ))}
      </div>
    </div>
  )
})
