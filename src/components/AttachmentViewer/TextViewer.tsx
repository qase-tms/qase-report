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

/**
 * Map file extensions to Prism language identifiers.
 */
const detectLanguage = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const languageMap: Record<string, string> = {
    log: 'markup',
    txt: 'markup',
    json: 'json',
    xml: 'xml',
    html: 'markup',
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    java: 'java',
    sh: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
  }
  return languageMap[ext || ''] || 'markup'
}

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
    if (!attachment.content) {
      setContent('No content available')
      return
    }

    try {
      const decoded = atob(attachment.content)
      setContent(decoded)
    } catch (error) {
      console.error('Failed to decode attachment content:', error)
      setContent('Error: Failed to decode content')
    }
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
