import { observer } from 'mobx-react-lite'
import { Download } from 'lucide-react'
import { useRootStore } from '../../store'

export const ExportButton = observer(() => {
  const root = useRootStore()

  const handleExport = () => {
    // Return early if no run data loaded
    if (!root.reportStore.runData) {
      return
    }

    // Create export object with run data and all test results
    const exportData = {
      run: root.reportStore.runData,
      results: root.testResultsStore.resultsList,
    }

    // Create JSON blob
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })

    // Create download URL
    const url = URL.createObjectURL(blob)

    // Create anchor element and trigger download
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `qase-report-${Date.now()}.json`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)

    // Clean up blob URL to prevent memory leak
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  return (
    <button
      onClick={handleExport}
      disabled={!root.reportStore.runData}
      aria-label="Export report"
      className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Download className="h-5 w-5" />
    </button>
  )
})
