import { Box, Typography } from '@mui/material'
import type { Attachment } from '../../schemas/Attachment.schema'
import { TestStepAttachment } from './TestStepAttachment'

interface TestAttachmentsProps {
  attachments: Attachment[]
}

/**
 * Displays test-level attachments (not step attachments).
 * Reuses TestStepAttachment for individual attachment rendering.
 */
export const TestAttachments = ({ attachments }: TestAttachmentsProps) => {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Attachments
      </Typography>
      {attachments.map((attachment) => (
        <TestStepAttachment key={attachment.id} attachment={attachment} />
      ))}
    </Box>
  )
}
