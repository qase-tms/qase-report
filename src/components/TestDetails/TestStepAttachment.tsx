import { useState } from 'react'
import { Image, FileText, File } from 'lucide-react'
import type { Attachment } from '../../schemas/Attachment.schema'
import { useRootStore } from '../../store'
import { DownloadButton } from '../AttachmentViewer/DownloadButton'

interface TestStepAttachmentProps {
  attachment: Attachment
}

export const TestStepAttachment = ({ attachment }: TestStepAttachmentProps) => {
  const { attachmentViewerStore, attachmentsStore } = useRootStore()
  const isImage = attachment.mime_type?.startsWith('image/')
  const isText = attachment.mime_type?.startsWith('text/')
  const isJson = attachment.mime_type === 'application/json'
  const isTextLike = isText || isJson
  const [imageError, setImageError] = useState(false)

  const isViewable = isImage || isTextLike

  // Get blob URL from store (created when loading report)
  const blobUrl = attachmentsStore.getAttachmentUrl(attachment.id)

  return (
    <div className="ml-8 mt-1">
      {/* Attachment file chip - clickable if viewable */}
      <button
        onClick={isViewable ? () => attachmentViewerStore.openViewer(attachment) : undefined}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border rounded-full ${
          isViewable ? 'cursor-pointer hover:bg-accent' : 'cursor-default'
        } transition-colors`}
      >
        {isImage ? (
          <Image className="h-3.5 w-3.5" />
        ) : isTextLike ? (
          <FileText className="h-3.5 w-3.5" />
        ) : (
          <File className="h-3.5 w-3.5" />
        )}
        {attachment.file_name}
      </button>

      {/* Download button for all attachment types */}
      <span className="inline-block ml-2">
        <DownloadButton attachment={attachment} variant="text" />
      </span>

      {/* Inline image preview for base64 content - clickable to open viewer */}
      {isImage && attachment.content && !imageError && (
        <div
          className="mt-2 max-w-[300px] cursor-pointer"
          onClick={() => attachmentViewerStore.openViewer(attachment)}
        >
          <img
            src={`data:${attachment.mime_type};base64,${attachment.content}`}
            alt={attachment.file_name}
            className="max-w-full rounded border"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {/* Inline image preview for blob URL - clickable to open viewer */}
      {isImage && blobUrl && !attachment.content && !imageError && (
        <div
          className="mt-2 max-w-[300px] cursor-pointer"
          onClick={() => attachmentViewerStore.openViewer(attachment)}
        >
          <img
            src={blobUrl}
            alt={attachment.file_name}
            className="max-w-full rounded border"
            onError={() => setImageError(true)}
          />
        </div>
      )}
    </div>
  )
}
