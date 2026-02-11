import { observer } from 'mobx-react-lite'
import { Grid, Box } from '@mui/material'
import { useRootStore } from '../../store'
import { Sidebar } from '../../components/Sidebar'
import { LoadReportButton } from '../../components/LoadReportButton'
import { Dashboard } from '../../components/Dashboard'
import { TestList } from '../../components/TestList'
import { TestDetails } from '../../components/TestDetails'
import { AttachmentViewer } from '../../components/AttachmentViewer'
import { FailureClusters } from '../../components/FailureClusters'
import { Gallery } from '../../components/Gallery'
import { Comparison } from '../../components/Comparison'

export const MainLayout = observer(() => {
  const { isDockOpen, closeDock, reportStore, activeView } = useRootStore()

  const renderView = () => {
    if (activeView === 'dashboard') {
      return (
        <>
          <Dashboard />
          {/* Show TestList only when report is loaded */}
          {reportStore.runData && (
            <Box sx={{ mt: 3 }}>
              <TestList />
            </Box>
          )}
        </>
      )
    }

    if (activeView === 'tests') {
      return reportStore.runData ? (
        <TestList />
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            color: 'text.secondary',
          }}
        >
          No report loaded
        </Box>
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

    if (activeView === 'analytics') {
      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh',
            color: 'text.secondary',
          }}
        >
          Analytics - Coming Soon
        </Box>
      )
    }

    return null
  }

  return (
    <>
      <Grid
        container
        spacing={2}
        component={'main'}
        sx={{ height: 'calc(100vh - 48px)', width: '100%', p: 2 }}
      >
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <LoadReportButton />
          </Box>
          {renderView()}
        </Grid>
        <Sidebar isOpen={isDockOpen} onClose={closeDock}>
          <TestDetails />
        </Sidebar>
      </Grid>
      {/* Global attachment viewer */}
      <AttachmentViewer />
    </>
  )
})
