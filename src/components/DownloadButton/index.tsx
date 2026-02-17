import { observer } from 'mobx-react-lite'
import { useState, useEffect } from 'react'
import { Download, FileText, History, Archive } from 'lucide-react'
import { useRootStore } from '../../store'
import { isServerMode } from '../../services/ApiDataService'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu'

/**
 * Triggers a file download via window.location.
 * The server returns Content-Disposition: attachment, so the browser downloads
 * the file without navigating away from the page.
 */
const triggerDownload = (url: string) => {
  window.location.href = url
}

export const DownloadButton = observer(() => {
  const root = useRootStore()
  const [historyAvailable, setHistoryAvailable] = useState<boolean | null>(null)

  // Check history availability via HEAD request when in server mode
  useEffect(() => {
    if (!isServerMode() || !root.reportStore.runData) return

    fetch('/api/download/history', { method: 'HEAD' })
      .then(response => {
        setHistoryAvailable(response.ok)
      })
      .catch(() => {
        setHistoryAvailable(false)
      })
  }, [root.reportStore.runData])

  // Static/file mode: direct JSON export (same behavior as old ExportButton)
  if (!isServerMode()) {
    const handleExport = () => {
      if (!root.reportStore.runData) return

      const exportData = {
        run: root.reportStore.runData,
        results: root.testResultsStore.resultsList,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `qase-report-${Date.now()}.json`
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)

      setTimeout(() => URL.revokeObjectURL(url), 100)
    }

    return (
      <button
        onClick={handleExport}
        disabled={!root.reportStore.runData}
        aria-label="Download"
        className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="h-5 w-5" />
      </button>
    )
  }

  // Server mode: dropdown with three download options
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={!root.reportStore.runData}
          aria-label="Download"
          className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => triggerDownload('/api/download/html')}>
          <FileText />
          Download HTML
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={historyAvailable !== true}
          onSelect={() => triggerDownload('/api/download/history')}
        >
          <History />
          Download History
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => triggerDownload('/api/download/zip')}>
          <Archive />
          Download ZIP
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
