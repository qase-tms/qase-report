import { useEffect, useState } from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import type { Attachment } from '../../schemas/Attachment.schema'
import { DownloadButton } from './DownloadButton'
import { detectLanguage } from '../../utils/detectLanguage'
import { useRootStore } from '../../store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface TextViewerProps {
  attachment: Attachment
  open: boolean
  onClose: () => void
}

/**
 * Text viewer with syntax highlighting.
 * Uses prism-react-renderer for lightweight React-optimized highlighting.
 * Rendered via portal with high z-index to appear above Sheet.
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

  const language = detectLanguage(attachment.file_name)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="!max-w-6xl !w-[90vw] max-h-[90vh] flex flex-col z-[100]"
        overlayClassName="z-[100]"
      >
        <DialogHeader>
          <DialogTitle>{attachment.file_name}</DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-0">
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
        <DialogFooter>
          <DownloadButton attachment={attachment} />
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
