import { useRef, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../store'
import { cn } from '../lib/utils'

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
    <div className="p-4">
      <h6 className="text-lg font-semibold mb-4">
        Load Qase Report
      </h6>

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
      <button
        onClick={() => directoryInputRef.current?.click()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors mb-4"
      >
        Select Report Directory
      </button>

      {/* Single file upload for history */}
      <p className="mt-4 mb-2 text-sm">
        Or load history file separately:
      </p>
      <input
        ref={historyInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleHistorySelect}
      />
      <button
        onClick={() => historyInputRef.current?.click()}
        className="px-4 py-2 border rounded-md hover:bg-accent transition-colors"
      >
        Select test-history.json
      </button>

      {/* Status alerts */}
      {reportStore.runData && (
        <div className="mt-4 p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
          Report loaded: {reportStore.runData.title || 'Untitled run'}
        </div>
      )}

      {historyStore.isHistoryLoaded && (
        <div className="mt-4 p-3 rounded-md bg-green-500/10 border border-green-500/20 text-green-400">
          History loaded: {historyStore.totalRuns} runs available
        </div>
      )}

      {(historyStore.historyError || localError) && (
        <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-400">
          {historyStore.historyError || localError}
        </div>
      )}
    </div>
  )
})
