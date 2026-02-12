import { Image, FileText, File } from 'lucide-react'
import type { Attachment } from '../../schemas/Attachment.schema'
import { useRootStore } from '../../store'
import { DownloadButton } from '../AttachmentViewer/DownloadButton'

interface TestStepAttachmentProps {
  attachment: Attachment
}

export const TestStepAttachment = ({ attachment }: TestStepAttachmentProps) => {
  const { attachmentViewerStore } = useRootStore()
  const isImage = attachment.mime_type?.startsWith('image/')
  const isText = attachment.mime_type?.startsWith('text/')
  const isJson = attachment.mime_type === 'application/json'
  const isTextLike = isText || isJson

  const isViewable = isImage || isTextLike

  return (
    <span className="inline-flex items-center">
      {/* Attachment file chip - clickable if viewable */}
      <button
        onClick={isViewable ? () => attachmentViewerStore.openViewer(attachment) : undefined}
        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs border rounded-full ${
          isViewable ? 'cursor-pointer hover:bg-accent' : 'cursor-default'
        } transition-colors`}
      >
        {isImage ? (
          <Image className="h-3 w-3" />
        ) : isTextLike ? (
          <FileText className="h-3 w-3" />
        ) : (
          <File className="h-3 w-3" />
        )}
        <span className="max-w-[150px] truncate">{attachment.file_name}</span>
      </button>

      {/* Download button */}
      <DownloadButton attachment={attachment} variant="icon" />
    </span>
  )
}
