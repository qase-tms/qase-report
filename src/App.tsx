import { AppBar, Toolbar, Box } from '@mui/material'
import { MainLayout } from './layout/MainLayout'
import { ThemeRegistry } from './theme/ThemeRegistry'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <ThemeRegistry>
      <AppBar
        position="fixed"
        sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <Toolbar variant={'dense'}>
          <Box sx={{ flexGrow: 1 }}>Qase | Report</Box>
          <ThemeToggle />
        </Toolbar>
      </AppBar>
      <Toolbar variant={'dense'} />
      <MainLayout />
    </ThemeRegistry>
  )
}

export default App
