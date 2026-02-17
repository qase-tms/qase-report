import { observer } from 'mobx-react-lite'
import { FileSearch, ExternalLink, ArrowLeft } from 'lucide-react'
import { useRootStore } from '../../store'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useState, useEffect } from 'react'
import { isServerMode } from '../../services/ApiDataService'

export const TracesView = observer(() => {
  const { traceStore, testResultsStore } = useRootStore()
  const [traceViewerAvailable, setTraceViewerAvailable] = useState<boolean | null>(null)

  const traceFiles = traceStore.traceFiles

  // Check trace viewer availability on mount (only in server mode)
  useEffect(() => {
    if (isServerMode()) {
      fetch('/api/trace-viewer-available')
        .then(res => res.json())
        .then(data => setTraceViewerAvailable(data.available))
        .catch(() => setTraceViewerAvailable(false))
    }
  }, [])

  // Empty state (defensive - shouldn't happen as tab is hidden when no traces)
  if (traceFiles.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileSearch className="h-6 w-6 text-primary" />
          <h5 className="text-xl font-semibold">Traces</h5>
        </div>
        <div className="bg-card rounded-lg border shadow-sm p-8 text-center">
          <FileSearch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No trace files found in this report.
          </p>
        </div>
      </div>
    )
  }

  // Trace viewer UI (server mode only)
  if (traceStore.selectedTrace && isServerMode()) {
    // State A: Loading availability check
    if (traceViewerAvailable === null) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-4 border-b bg-card">
            <button
              onClick={() => traceStore.clearSelectedTrace()}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to traces
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">
                Checking trace viewer availability...
              </p>
            </div>
          </div>
        </div>
      )
    }

    // State B: Trace viewer NOT available
    if (traceViewerAvailable === false) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-4 border-b bg-card">
            <button
              onClick={() => traceStore.clearSelectedTrace()}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to traces
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-2 max-w-md">
              <p className="text-muted-foreground">
                Trace viewer is not available. Install playwright-core to enable it:
              </p>
              <code className="block bg-muted px-4 py-2 rounded text-sm">
                npm install playwright-core
              </code>
            </div>
          </div>
        </div>
      )
    }

    // State C: Trace viewer available - render iframe
    const filename = traceStore.selectedTrace.attachment.file_path.split('/').pop() || ''
    const traceUrl = `/api/attachments/${encodeURIComponent(filename)}`
    const viewerUrl = `/trace-viewer/index.html?trace=${encodeURIComponent(traceUrl)}`

    return (
      <div className="flex flex-col h-full">
        {/* Header bar with back button */}
        <div className="flex items-center gap-3 p-4 border-b bg-card">
          <button
            onClick={() => traceStore.clearSelectedTrace()}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to traces
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium truncate">
            {traceStore.selectedTrace.testTitle}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {traceStore.selectedTrace.attachment.file_name}
          </span>
        </div>
        {/* Trace viewer iframe - takes full remaining height */}
        <iframe
          src={viewerUrl}
          className="flex-1 w-full border-0"
          title={`Trace: ${traceStore.selectedTrace.attachment.file_name}`}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    )
  }

  // Trace list view (default)
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <FileSearch className="h-6 w-6 text-primary" />
        <h5 className="text-xl font-semibold">Traces</h5>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        {traceFiles.length} trace {traceFiles.length === 1 ? 'file' : 'files'}{' '}
        available
      </p>

      {/* Trace list table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Test Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Trace File</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traceFiles.map((traceFile, index) => {
              // Look up test result to get execution status
              const testResult = testResultsStore.testResults.get(
                traceFile.testId
              )
              const status = testResult?.execution.status ?? 'skipped'

              return (
                <TableRow
                  key={`${traceFile.testId}-${index}`}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => traceStore.selectTrace(traceFile)}
                >
                  <TableCell className="font-medium">
                    {traceFile.testTitle}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono text-sm">
                    {traceFile.attachment.file_name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 text-muted-foreground">
                      <span className="text-xs">View</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
})
