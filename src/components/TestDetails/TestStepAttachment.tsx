import { useState } from 'react'
import { Box, Chip } from '@mui/material'
import { Image as ImageIcon, InsertDriveFile as FileIcon } from '@mui/icons-material'
import type { Attachment } from '../../schemas/Attachment.schema'

interface TestStepAttachmentProps {
  attachment: Attachment
}

export const TestStepAttachment = ({ attachment }: TestStepAttachmentProps) => {
  const isImage = attachment.mime_type?.startsWith('image/')
  const [imageError, setImageError] = useState(false)

  return (
    <Box sx={{ ml: 4, mt: 0.5 }}>
      {/* Attachment file chip */}
      <Chip
        icon={isImage ? <ImageIcon fontSize="small" /> : <FileIcon fontSize="small" />}
        label={attachment.file_name}
        size="small"
        variant="outlined"
      />

      {/* Inline image preview for base64 content */}
      {isImage && attachment.content && !imageError && (
        <Box sx={{ mt: 1, maxWidth: 300 }}>
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

      {/* Inline image preview for external file path */}
      {isImage && attachment.file_path && !attachment.content && !imageError && (
        <Box sx={{ mt: 1, maxWidth: 300 }}>
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
