import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { LoadReportButton } from '../../components/LoadReportButton'
import { Dashboard } from '../../components/Dashboard'
import { TestList } from '../../components/TestList'
import { AttachmentViewer } from '../../components/AttachmentViewer'
import { FailureClusters } from '../../components/FailureClusters'
import { Gallery } from '../../components/Gallery'
import { Comparison } from '../../components/Comparison'
import { TestDetailsModal } from '../../components/TestDetailsModal'
import { TabNavigation } from '../../components/TabNavigation'

export const MainLayout = observer(() => {
  const { reportStore, activeView } = useRootStore()

  const renderView = () => {
    if (activeView === 'dashboard') {
      return <Dashboard />
    }

    if (activeView === 'tests') {
      return reportStore.runData ? (
        <TestList />
      ) : (
        <div className="flex justify-center items-center h-[50vh] text-muted-foreground">
          No report loaded
        </div>
      )
    }

    if (activeView === 'failure-clusters') {
      return <FailureClusters />
    }

    if (activeView === 'gallery') {
      return <Gallery />
    }

    if (activeView === 'comparison') {
      return <Comparison />
    }

    return null
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <TabNavigation />
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex gap-4 mb-4">
            <LoadReportButton />
          </div>
          {renderView()}
        </div>
      </div>
      <TestDetailsModal />
      {/* Global attachment viewer */}
      <AttachmentViewer />
    </>
  )
})
