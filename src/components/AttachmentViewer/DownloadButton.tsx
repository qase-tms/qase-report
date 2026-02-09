import { useState, useEffect } from 'react'
import { Button } from '@mui/material'
import { Download as DownloadIcon } from '@mui/icons-material'
import type { Attachment } from '../../schemas/Attachment.schema'

interface DownloadButtonProps {
  attachment: Attachment
  variant?: 'text' | 'outlined' | 'contained'
}

/**
 * Download button with blob URL creation and cleanup.
 * Supports both base64 content and file paths.
 */
export const DownloadButton = ({
  attachment,
  variant = 'outlined',
}: DownloadButtonProps) => {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!attachment.content) {
      // Use file path directly if no base64 content
      setDownloadUrl(attachment.file_path)
      return
    }

    // Create blob from base64 content
    try {
      const binary = atob(attachment.content)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
      }

      const blob = new Blob([bytes], { type: attachment.mime_type })
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)

      // CRITICAL: Cleanup to prevent memory leaks
      return () => {
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to create download URL:', error)
      setDownloadUrl(null)
    }
  }, [attachment])

  if (!downloadUrl) return null

  return (
    <Button
      variant={variant}
      startIcon={<DownloadIcon />}
      component="a"
      href={downloadUrl}
      download={attachment.file_name}
    >
      Download
    </Button>
  )
}
