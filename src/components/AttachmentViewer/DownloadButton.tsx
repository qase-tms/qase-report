import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import type { Attachment } from '../../schemas/Attachment.schema'
import { useRootStore } from '../../store'
import { cn } from '../../lib/utils'

interface DownloadButtonProps {
  attachment: Attachment
  variant?: 'text' | 'outlined' | 'contained'
}

/**
 * Download button with blob URL creation and cleanup.
 * Supports base64 content, blob URLs from store, and file paths.
 */
export const DownloadButton = ({
  attachment,
  variant = 'outlined',
}: DownloadButtonProps) => {
  const { attachmentsStore } = useRootStore()
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    // Priority 1: Create blob from base64 content
    if (attachment.content) {
      try {
        const binary = atob(attachment.content)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i)
        }

        const blob = new Blob([bytes], { type: attachment.mime_type })
        const url = URL.createObjectURL(blob)
        setDownloadUrl(url)

        return () => {
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error('Failed to create download URL:', error)
      }
    }

    // Priority 2: Use blob URL from store (created when loading report)
    const blobUrl = attachmentsStore.getAttachmentUrl(attachment.id)
    if (blobUrl) {
      setDownloadUrl(blobUrl)
      return
    }

    // Priority 3: Fall back to file_path (won't work with file:// protocol)
    setDownloadUrl(attachment.file_path)
  }, [attachment, attachmentsStore])

  if (!downloadUrl) return null

  const variantClasses = {
    text: 'hover:bg-accent',
    outlined: 'border hover:bg-accent',
    contained: 'bg-primary text-primary-foreground hover:bg-primary/90',
  }

  return (
    <a
      href={downloadUrl}
      download={attachment.file_name}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors',
        variantClasses[variant]
      )}
    >
      <Download className="h-4 w-4" />
      Download
    </a>
  )
}
