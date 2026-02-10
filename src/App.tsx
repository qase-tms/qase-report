import { AppBar, Toolbar, Box } from '@mui/material'
import { MainLayout } from './layout/MainLayout'
import { ThemeRegistry } from './theme/ThemeRegistry'
import { ThemeToggle } from './components/ThemeToggle'
import { NavigationDrawer } from './components/NavigationDrawer'

const App = () => {
  return (
    <ThemeRegistry>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
        >
          <Toolbar variant={'dense'}>
            <Box sx={{ flexGrow: 1 }}>Qase | Report</Box>
            <ThemeToggle />
          </Toolbar>
        </AppBar>
        <NavigationDrawer />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <Toolbar variant={'dense'} />
          <MainLayout />
        </Box>
      </Box>
    </ThemeRegistry>
  )
}

export default App
