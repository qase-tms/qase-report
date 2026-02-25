import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  ChevronDown,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  MinusCircle,
  Ban,
  CircleDot,
} from 'lucide-react'
import { formatDuration } from '../../utils/formatDuration'
import type { Step } from '../../schemas/Step.schema'
import type { Attachment } from '../../schemas/Attachment.schema'
import { TestStepAttachment } from './TestStepAttachment'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { cn } from '../../lib/utils'

interface TestStepProps {
  step: Step
  depth: number
  stepNumber: string
}

// Status icon component
const StatusIcon = ({ status }: { status: string }) => {
  const iconProps = { className: 'h-4 w-4' }

  switch (status) {
    case 'passed':
      return <Check {...iconProps} className="h-4 w-4 text-passed" />
    case 'failed':
      return <X {...iconProps} className="h-4 w-4 text-failed" />
    case 'broken':
      return <AlertTriangle {...iconProps} className="h-4 w-4 text-broken" />
    case 'skipped':
      return <MinusCircle {...iconProps} className="h-4 w-4 text-skipped" />
    case 'blocked':
      return <Ban {...iconProps} className="h-4 w-4 text-blocked" />
    default:
      return <CircleDot {...iconProps} className="h-4 w-4 text-muted-foreground" />
  }
}

export const TestStep = observer(({ step, depth, stepNumber }: TestStepProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const prefersReducedMotion = usePrefersReducedMotion()
  const hasChildren = step.steps && step.steps.length > 0
  const hasAttachments =
    step.execution.attachments && step.execution.attachments.length > 0
  const marginLeft = Math.min(depth * 12, 96) // 12px per depth level, max 96px

  const hasInputData = step.data?.input_data
  const hasExpectedResult = step.data?.expected_result
  const hasStepDetails = hasInputData || hasExpectedResult

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="py-0.5">
      {/* Step row with hover effect */}
      <div className="flex items-center gap-2 py-1.5 px-2 -mx-2 rounded-md hover:bg-accent/50 transition-colors">
        {/* Expand/collapse button or spacer */}
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'collapse' : 'expand'}
            className="p-0.5 rounded hover:bg-accent transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* Step number */}
        <span className="text-sm font-medium text-muted-foreground min-w-[1.5rem]">
          {stepNumber}
        </span>

        {/* Status icon */}
        <StatusIcon status={step.execution.status} />

        {/* Step action/title */}
        <span className="text-sm flex-1 min-w-0">
          {step.data?.action ||
            step.step_type.charAt(0).toUpperCase() + step.step_type.slice(1)}
        </span>

        {/* Duration */}
        <span className="text-xs text-muted-foreground shrink-0">
          {formatDuration(step.execution.duration)}
        </span>
      </div>

      {/* Attachments row - left aligned matching step details indent */}
      {hasAttachments && (
        <div className="flex flex-wrap gap-2 ml-[3.25rem] pb-1">
          {step.execution.attachments.map((attachment: Attachment) => (
            <TestStepAttachment key={attachment.id} attachment={attachment} />
          ))}
        </div>
      )}

      {/* Step details: input_data and expected_result */}
      {hasStepDetails && (
        <div className="ml-[3.25rem] mb-1 text-xs space-y-1">
          {hasInputData && (
            <div className="flex gap-2">
              <span className="text-muted-foreground shrink-0 min-w-[4.5rem]">Input:</span>
              <span className="text-foreground/80">{step.data.input_data}</span>
            </div>
          )}
          {hasExpectedResult && (
            <div className="flex gap-2">
              <span className="text-muted-foreground shrink-0 min-w-[4.5rem]">Expected:</span>
              <span className="text-foreground/80">{step.data.expected_result}</span>
            </div>
          )}
        </div>
      )}

      {/* Expanded content with vertical line connector - only for nested steps */}
      {hasChildren && (
        <div
          className={cn(
            'overflow-hidden',
            prefersReducedMotion ? '' : 'transition-all duration-300',
            isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="ml-[1.35rem] pl-3 border-l-2 border-border">
            {step.steps.map((childStep: Step, index: number) => (
              <TestStep
                key={childStep.id}
                step={childStep}
                depth={depth + 1}
                stepNumber={`${stepNumber}.${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
})
