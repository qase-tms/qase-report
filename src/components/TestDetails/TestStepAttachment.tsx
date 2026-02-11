import { useState, useEffect } from 'react'
import { Image, FileText, File } from 'lucide-react'
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

      {/* Inline text/JSON preview with syntax highlighting - clickable to open viewer */}
      {isTextLike && textContent && (
        <div
          className="mt-2 max-w-[500px] cursor-pointer"
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
                  border: '1px solid hsl(var(--border))',
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
        </div>
      )}
    </div>
  )
}
