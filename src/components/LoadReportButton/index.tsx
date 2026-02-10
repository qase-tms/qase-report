import { observer } from 'mobx-react-lite'
import { useRef } from 'react'
import { Button, Box, Alert } from '@mui/material'
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
    <Box>
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
        variant="contained"
        onClick={() => inputRef.current?.click()}
        disabled={isLoading}
      >
        {getButtonText()}
      </Button>
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {historyStore.isHistoryLoaded && (
        <Alert severity="success" sx={{ mt: 2 }}>
          History loaded: {historyStore.totalRuns} run(s) available
        </Alert>
      )}
      {historyStore.historyError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          History error: {historyStore.historyError}
        </Alert>
      )}
    </Box>
  )
})
