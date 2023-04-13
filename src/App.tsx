import { AppBar, createTheme, ThemeProvider, Toolbar } from '@mui/material'
import { MainLayout } from './layout/MainLayout'

function App() {
  const theme = createTheme()
  return (
    <ThemeProvider theme={theme}>
      <AppBar
        position="fixed"
        sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
      >
        <Toolbar variant={'dense'}>Qase | Report</Toolbar>
      </AppBar>
      <Toolbar variant={'dense'} />
      <MainLayout />
    </ThemeProvider>
  )
}

export default App
