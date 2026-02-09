import { useState } from 'react'
import { Box, Chip } from '@mui/material'
import { Image as ImageIcon, InsertDriveFile as FileIcon } from '@mui/icons-material'
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
  const [imageError, setImageError] = useState(false)

  const isViewable = isImage || isText

  return (
    <Box sx={{ ml: 4, mt: 0.5 }}>
      {/* Attachment file chip - clickable if viewable */}
      <Chip
        icon={isImage ? <ImageIcon fontSize="small" /> : <FileIcon fontSize="small" />}
        label={attachment.file_name}
        size="small"
        variant="outlined"
        onClick={isViewable ? () => attachmentViewerStore.openViewer(attachment) : undefined}
        sx={{ cursor: isViewable ? 'pointer' : 'default' }}
      />

      {/* Download button for all attachment types */}
      <Box sx={{ display: 'inline-block', ml: 1 }}>
        <DownloadButton attachment={attachment} variant="text" />
      </Box>

      {/* Inline image preview for base64 content - clickable to open viewer */}
      {isImage && attachment.content && !imageError && (
        <Box
          sx={{ mt: 1, maxWidth: 300, cursor: 'pointer' }}
          onClick={() => attachmentViewerStore.openViewer(attachment)}
        >
          <img
            src={`data:${attachment.mime_type};base64,${attachment.content}`}
            alt={attachment.file_name}
            style={{
              maxWidth: '100%',
              borderRadius: 4,
              border: '1px solid #eee',
            }}
            onError={() => setImageError(true)}
          />
        </Box>
      )}

      {/* Inline image preview for external file path - clickable to open viewer */}
      {isImage && attachment.file_path && !attachment.content && !imageError && (
        <Box
          sx={{ mt: 1, maxWidth: 300, cursor: 'pointer' }}
          onClick={() => attachmentViewerStore.openViewer(attachment)}
        >
          <img
            src={attachment.file_path}
            alt={attachment.file_name}
            style={{
              maxWidth: '100%',
              borderRadius: 4,
              border: '1px solid #eee',
            }}
            onError={() => setImageError(true)}
          />
        </Box>
      )}
    </Box>
  )
}
