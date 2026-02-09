import { observer } from 'mobx-react-lite'
import { Button, Grid } from '@mui/material'
import { useRootStore } from '../../store'
import { Sidebar } from '../../components/Sidebar'
import { LoadReportButton } from '../../components/LoadReportButton'
import { Dashboard } from '../../components/Dashboard'

export const MainLayout = observer(() => {
  const { isDockOpen, closeDock, openDock } = useRootStore()
  return (
    <Grid
      container
      spacing={2}
      component={'main'}
      sx={{ height: 'calc(100vh - 48px)', width: '100vw' }}
    >
      <Grid item xs={10}>
        <LoadReportButton />
        <Button type={'button'} onClick={openDock}>
          Open sidebar
        </Button>
        <Dashboard />
      </Grid>
      <Grid item xs={2}></Grid>
      <Sidebar isOpen={isDockOpen} onClose={closeDock}>
        Hello from sidebar
      </Sidebar>
    </Grid>
  )
})
