import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { Box, Button, Typography, Alert } from '@mui/material'
import { useRootStore } from '../store'

/**
 * File upload UI component for loading Qase Report data.
 * Supports directory upload (run.json + test-history.json) and
 * single file upload (test-history.json only).
 */
export const FileUploader = observer(() => {
  const store = useRootStore()
  const { historyStore, reportStore, loadReport } = store
  const directoryInputRef = useRef<HTMLInputElement>(null)
  const historyInputRef = useRef<HTMLInputElement>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  /**
   * Handles directory upload with run.json and optional test-history.json
   */
  const handleDirectorySelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files
    if (!files || files.length === 0) {
      return
    }

    setLocalError(null)
    try {
      await loadReport(files)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load report'
      setLocalError(message)
    }
  }

  /**
   * Handles single test-history.json file upload
   */
  const handleHistorySelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const files = e.target.files
    if (!files || files.length === 0) {
      return
    }

    setLocalError(null)
    try {
      await historyStore.loadHistoryFile(files[0])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load history'
      setLocalError(message)
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Load Qase Report
      </Typography>

      {/* Directory upload button */}
      <input
        ref={directoryInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is not standard but widely supported
        webkitdirectory="true"
        multiple
        style={{ display: 'none' }}
        onChange={handleDirectorySelect}
      />
      <Button
        variant="contained"
        onClick={() => directoryInputRef.current?.click()}
        sx={{ mb: 2 }}
      >
        Select Report Directory
      </Button>

      {/* Single file upload for history */}
      <Typography sx={{ mt: 2, mb: 1 }}>
        Or load history file separately:
      </Typography>
      <input
        ref={historyInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleHistorySelect}
      />
      <Button
        variant="outlined"
        onClick={() => historyInputRef.current?.click()}
      >
        Select test-history.json
      </Button>

      {/* Status alerts */}
      {reportStore.runData && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Report loaded: {reportStore.runData.title || 'Untitled run'}
        </Alert>
      )}

      {historyStore.isHistoryLoaded && (
        <Alert severity="success" sx={{ mt: 2 }}>
          History loaded: {historyStore.totalRuns} runs available
        </Alert>
      )}

      {(historyStore.historyError || localError) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {historyStore.historyError || localError}
        </Alert>
      )}
    </Box>
  )
})
