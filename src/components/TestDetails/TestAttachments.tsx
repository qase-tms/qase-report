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
    <div>
      <h5 className="text-base font-semibold mb-2">
        Attachments
      </h5>
      {attachments.map((attachment) => (
        <TestStepAttachment key={attachment.id} attachment={attachment} />
      ))}
    </div>
  )
}
