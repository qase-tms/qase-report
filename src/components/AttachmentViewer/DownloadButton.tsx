import { useState, useEffect } from 'react'
import { Download } from 'lucide-react'
import type { Attachment } from '../../schemas/Attachment.schema'
import { useRootStore } from '../../store'
import { cn } from '../../lib/utils'

interface DownloadButtonProps {
  attachment: Attachment
  variant?: 'text' | 'outlined' | 'contained' | 'icon'
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
    text: 'hover:bg-accent px-3 py-1.5',
    outlined: 'border hover:bg-accent px-3 py-1.5',
    contained: 'bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5',
    icon: 'hover:bg-accent p-1.5 rounded-full',
  }

  const isIconOnly = variant === 'icon'

  return (
    <a
      href={downloadUrl}
      download={attachment.file_name}
      title="Download"
      className={cn(
        'inline-flex items-center gap-1.5 text-sm rounded-md transition-colors text-muted-foreground hover:text-foreground',
        variantClasses[variant]
      )}
    >
      <Download className={isIconOnly ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      {!isIconOnly && 'Download'}
    </a>
  )
}
