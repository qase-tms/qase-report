import { observer } from 'mobx-react-lite'
import { Button, Grid } from '@mui/material'
import { useRootStore } from '../../store'
import { Sidebar } from '../../components/Sidebar'

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
        Hello from bigger container
        <Button type={'button'} onClick={openDock}>
          Open sidebar
        </Button>
      </Grid>
      <Grid item xs={2}>
        Hello from smaller container
      </Grid>
      <Sidebar isOpen={isDockOpen} onClose={closeDock}>
        Hello from sidebar
      </Sidebar>
    </Grid>
  )
})
