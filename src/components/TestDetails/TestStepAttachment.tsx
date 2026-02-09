import { useState, useEffect } from 'react'
import { Box, Chip } from '@mui/material'
import {
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
  Description as TextIcon,
} from '@mui/icons-material'
import { Highlight, themes } from 'prism-react-renderer'
import type { Attachment } from '../../schemas/Attachment.schema'
import { useRootStore } from '../../store'
import { DownloadButton } from '../AttachmentViewer/DownloadButton'
import { detectLanguage } from '../../utils/detectLanguage'

const MAX_PREVIEW_LINES = 8

interface TestStepAttachmentProps {
  attachment: Attachment
}

export const TestStepAttachment = ({ attachment }: TestStepAttachmentProps) => {
  const { attachmentViewerStore } = useRootStore()
  const isImage = attachment.mime_type?.startsWith('image/')
  const isText = attachment.mime_type?.startsWith('text/')
  const [imageError, setImageError] = useState(false)
  const [textContent, setTextContent] = useState<string | null>(null)

  const isViewable = isImage || isText

  // Decode text content for preview
  useEffect(() => {
    if (!isText) {
      setTextContent(null)
      return
    }

    const processText = (text: string) => {
      const lines = text.split('\n')
      return lines.length > MAX_PREVIEW_LINES
        ? lines.slice(0, MAX_PREVIEW_LINES).join('\n') + '\n...'
        : text
    }

    // If base64 content exists, decode it
    if (attachment.content) {
      try {
        const decoded = atob(attachment.content)
        setTextContent(processText(decoded))
      } catch {
        setTextContent(null)
      }
      return
    }

    // If file_path exists, try to fetch it
    if (attachment.file_path) {
      fetch(attachment.file_path)
        .then((response) => {
          if (!response.ok) throw new Error()
          return response.text()
        })
        .then((text) => setTextContent(processText(text)))
        .catch(() => setTextContent(null))
      return
    }

    setTextContent(null)
  }, [attachment, isText])

  return (
    <Box sx={{ ml: 4, mt: 0.5 }}>
      {/* Attachment file chip - clickable if viewable */}
      <Chip
        icon={
          isImage ? (
            <ImageIcon fontSize="small" />
          ) : isText ? (
            <TextIcon fontSize="small" />
          ) : (
            <FileIcon fontSize="small" />
          )
        }
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

      {/* Inline text preview with syntax highlighting - clickable to open viewer */}
      {isText && textContent && (
        <Box
          sx={{ mt: 1, maxWidth: 500, cursor: 'pointer' }}
          onClick={() => attachmentViewerStore.openViewer(attachment)}
        >
          <Highlight
            theme={themes.github}
            code={textContent}
            language={detectLanguage(attachment.file_name)}
          >
            {({ style, tokens, getLineProps, getTokenProps }) => (
              <pre
                style={{
                  ...style,
                  padding: 12,
                  borderRadius: 4,
                  overflow: 'auto',
                  maxHeight: 200,
                  margin: 0,
                  fontSize: 12,
                  border: '1px solid #eee',
                }}
              >
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })}>
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        </Box>
      )}
    </Box>
  )
}
