import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { Highlight, themes } from 'prism-react-renderer'
import type { Attachment } from '../../schemas/Attachment.schema'
import { DownloadButton } from './DownloadButton'
import { detectLanguage } from '../../utils/detectLanguage'

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

    // If file_path exists, try to fetch it
    if (attachment.file_path) {
      fetch(attachment.file_path)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          return response.text()
        })
        .then((text) => setContent(text))
        .catch((error) => {
          console.error('Failed to fetch attachment:', error)
          setContent(`Error: Could not load file (${error.message})`)
        })
      return
    }

    setContent('No content available')
  }, [attachment])

  const language = detectLanguage(attachment.file_name)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>{attachment.file_name}</DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <DownloadButton attachment={attachment} />
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
