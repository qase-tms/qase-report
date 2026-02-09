import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Box, Collapse, IconButton, Typography } from '@mui/material'
import { ExpandMore, ChevronRight } from '@mui/icons-material'
import { getStatusIcon } from '../TestList/statusIcon'
import { formatDuration } from '../../utils/formatDuration'
import type { Step } from '../../schemas/Step.schema'
import type { Attachment } from '../../schemas/Attachment.schema'
import { TestStepAttachment } from './TestStepAttachment'

interface TestStepProps {
  step: Step
  depth: number
}

export const TestStep = observer(({ step, depth }: TestStepProps) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = step.steps && step.steps.length > 0
  const hasAttachments =
    step.execution.attachments && step.execution.attachments.length > 0

  return (
    <Box sx={{ ml: Math.min(depth * 3, 24), py: 0.5 }}>
      {/* Step row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Expand/collapse button or spacer */}
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'collapse' : 'expand'}
          >
            {isExpanded ? <ExpandMore /> : <ChevronRight />}
          </IconButton>
        ) : (
          <Box sx={{ width: 28 }} />
        )}

        {/* Status icon */}
        {getStatusIcon(step.execution.status)}

        {/* Step action/title */}
        <Typography variant="body2" sx={{ flex: 1 }}>
          {step.data?.action || step.id}
        </Typography>

        {/* Duration */}
        <Typography variant="caption" color="text.secondary">
          {formatDuration(step.execution.duration)}
        </Typography>
      </Box>

      {/* Expanded content: attachments and nested steps */}
      <Collapse in={isExpanded}>
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
      </Collapse>
    </Box>
  )
})
