import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRootStore } from '../../store'

export const LoadReportButton = observer(() => {
  const { reportStore, testResultsStore, historyStore, loadReport } = useRootStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const isLoading = reportStore.isLoading || testResultsStore.isLoading
  const error = reportStore.error || testResultsStore.error

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files
    if (!files || files.length === 0) {
      return
    }

    try {
      await loadReport(files)
      console.log('Run loaded:', reportStore.runData)
      console.log(
        'Test results loaded:',
        testResultsStore.resultsList.length
      )
    } catch (err) {
      // Error state is handled by stores
      console.error('Failed to load report:', err)
    }
  }

  const getButtonText = (): string => {
    if (testResultsStore.isLoading && testResultsStore.loadingProgress) {
      const { current, total } = testResultsStore.loadingProgress
      return `Loading ${current}/${total}...`
    }
    if (isLoading) {
      return 'Loading...'
    }
    return 'Load Report Directory'
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        // @ts-expect-error webkitdirectory is not standard but widely supported
        webkitdirectory="true"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <Button
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
      >
        {getButtonText()}
      </Button>
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {historyStore.isHistoryLoaded && (
        <Alert className="mt-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            History loaded: {historyStore.totalRuns} run(s) available
          </AlertDescription>
        </Alert>
      )}
      {historyStore.historyError && (
        <Alert variant="default" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            History error: {historyStore.historyError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
})
