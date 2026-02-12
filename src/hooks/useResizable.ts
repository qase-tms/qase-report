import { useState, useCallback, useEffect } from 'react'

interface UseResizableOptions {
  initialWidth: number
  minWidth: number
  maxWidth: number
  direction: 'left' | 'right'
}

export const useResizable = ({
  initialWidth,
  minWidth,
  maxWidth,
  direction,
}: UseResizableOptions) => {
  const [width, setWidth] = useState(initialWidth)
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  const stopResizing = useCallback(() => {
    setIsResizing(false)
  }, [])

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return

      let newWidth: number
      if (direction === 'left') {
        // For right-side panel, calculate from right edge
        newWidth = window.innerWidth - e.clientX
      } else {
        newWidth = e.clientX
      }

      // Clamp to min/max
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
      setWidth(newWidth)
    },
    [isResizing, direction, minWidth, maxWidth]
  )

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', resize)
      document.addEventListener('mouseup', stopResizing)
      // Prevent text selection while resizing
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    }

    return () => {
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResizing)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isResizing, resize, stopResizing])

  return {
    width,
    isResizing,
    startResizing,
  }
}
