import { observer } from 'mobx-react-lite'
import { Button, Grid, Box } from '@mui/material'
import { useRootStore } from '../../store'
import { Sidebar } from '../../components/Sidebar'
import { LoadReportButton } from '../../components/LoadReportButton'
import { Dashboard } from '../../components/Dashboard'
import { TestList } from '../../components/TestList'

export const MainLayout = observer(() => {
  const { isDockOpen, closeDock, openDock, reportStore } = useRootStore()
  return (
    <Grid
      container
      spacing={2}
      component={'main'}
      sx={{ height: 'calc(100vh - 48px)', width: '100vw', p: 2 }}
    >
      <Grid item xs={10}>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <LoadReportButton />
          <Button type={'button'} onClick={openDock}>
            Open sidebar
          </Button>
        </Box>
        <Dashboard />
        {/* Show TestList only when report is loaded */}
        {reportStore.runData && (
          <Box sx={{ mt: 3 }}>
            <TestList />
          </Box>
        )}
      </Grid>
      <Grid item xs={2}></Grid>
      <Sidebar isOpen={isDockOpen} onClose={closeDock}>
        Hello from sidebar
      </Sidebar>
    </Grid>
  )
})
