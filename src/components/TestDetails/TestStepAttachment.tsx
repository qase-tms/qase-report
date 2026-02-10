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
  const { attachmentViewerStore, attachmentsStore } = useRootStore()
  const isImage = attachment.mime_type?.startsWith('image/')
  const isText = attachment.mime_type?.startsWith('text/')
  const isJson = attachment.mime_type === 'application/json'
  const isTextLike = isText || isJson
  const [imageError, setImageError] = useState(false)
  const [textContent, setTextContent] = useState<string | null>(null)

  const isViewable = isImage || isTextLike

  // Get blob URL from store (created when loading report)
  const blobUrl = attachmentsStore.getAttachmentUrl(attachment.id)

  // Decode text content for preview (text and JSON files)
  useEffect(() => {
    if (!isTextLike) {
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

    // Try to fetch from blob URL (created when loading report)
    if (blobUrl) {
      fetch(blobUrl)
        .then((response) => response.text())
        .then((text) => setTextContent(processText(text)))
        .catch(() => setTextContent(null))
      return
    }

    setTextContent(null)
  }, [attachment, isTextLike, blobUrl])

  return (
    <Box sx={{ ml: 4, mt: 0.5 }}>
      {/* Attachment file chip - clickable if viewable */}
      <Chip
        icon={
          isImage ? (
            <ImageIcon fontSize="small" />
          ) : isTextLike ? (
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

      {/* Inline image preview for blob URL - clickable to open viewer */}
      {isImage && blobUrl && !attachment.content && !imageError && (
        <Box
          sx={{ mt: 1, maxWidth: 300, cursor: 'pointer' }}
          onClick={() => attachmentViewerStore.openViewer(attachment)}
        >
          <img
            src={blobUrl}
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

      {/* Inline text/JSON preview with syntax highlighting - clickable to open viewer */}
      {isTextLike && textContent && (
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
