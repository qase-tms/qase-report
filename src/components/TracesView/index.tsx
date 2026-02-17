import { observer } from 'mobx-react-lite'
import { FileSearch, ExternalLink } from 'lucide-react'
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

export const TracesView = observer(() => {
  const { traceStore, testResultsStore } = useRootStore()

  const traceFiles = traceStore.traceFiles

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
