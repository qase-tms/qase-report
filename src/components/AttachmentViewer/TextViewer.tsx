import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import type { Attachment } from '../../schemas/Attachment.schema'
import { DownloadButton } from './DownloadButton'
import { detectLanguage } from '../../utils/detectLanguage'
import { useRootStore } from '../../store'

interface TextViewerProps {
  attachment: Attachment
  open: boolean
  onClose: () => void
}

/**
 * Text viewer with syntax highlighting.
 * Uses prism-react-renderer for lightweight React-optimized highlighting.
 */
export const TextViewer = ({ attachment, open, onClose }: TextViewerProps) => {
  const { attachmentsStore } = useRootStore()
  const [content, setContent] = useState<string>('')

  useEffect(() => {
    // If base64 content exists, decode it
    if (attachment.content) {
      try {
        const decoded = atob(attachment.content)
        setContent(decoded)
      } catch (error) {
        console.error('Failed to decode attachment content:', error)
        setContent('Error: Failed to decode content')
      }
      return
    }

    // Try to get blob URL from store (created when loading report)
    const blobUrl = attachmentsStore.getAttachmentUrl(attachment.id)
    if (blobUrl) {
      fetch(blobUrl)
        .then((response) => response.text())
        .then((text) => setContent(text))
        .catch((error) => {
          console.error('Failed to fetch from blob URL:', error)
          setContent(`Error: Could not load file (${error.message})`)
        })
      return
    }

    setContent('No content available')
  }, [attachment, attachmentsStore])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const language = detectLanguage(attachment.file_name)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-4xl bg-card rounded-lg border shadow-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{attachment.file_name}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <Highlight theme={themes.github} code={content} language={language}>
            {({ style, tokens, getLineProps, getTokenProps }) => (
              <pre
                style={{
                  ...style,
                  padding: 16,
                  borderRadius: 4,
                  overflow: 'auto',
                  maxHeight: '70vh',
                  margin: 0,
                  fontSize: 13,
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <DownloadButton attachment={attachment} />
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-md hover:bg-accent transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
