import { useState } from 'react'
import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { useHotkeys } from 'react-hotkeys-hook'
import { MainLayout } from './layout/MainLayout'
import { ThemeRegistry } from './theme/ThemeRegistry'
import { ThemeToggle } from './components/ThemeToggle'
import { NavigationDrawer } from './components/NavigationDrawer'
import { SearchModal } from './components/SearchModal'
import { ExportButton } from './components/ExportButton'
import { RunDateDisplay } from './components/RunDateDisplay'

const App = () => {
  const [isSearchOpen, setSearchOpen] = useState(false)

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault()
      setSearchOpen(true)
    },
    {
      enableOnFormTags: false,
      preventDefault: true,
    }
  )

  return (
    <ThemeRegistry>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar
          position="fixed"
          sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}
        >
          <Toolbar variant="dense">
            {/* Left: Title */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" component="div">
                Qase | Report
              </Typography>
            </Box>

            {/* Center: Run Date (pushed by flexGrow) */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
              <RunDateDisplay />
            </Box>

            {/* Right: Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <IconButton
                color="inherit"
                onClick={() => setSearchOpen(true)}
                aria-label="Search tests (Cmd+K)"
              >
                <SearchIcon />
              </IconButton>
              <ExportButton />
              <ThemeToggle />
            </Box>
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
        <SearchModal open={isSearchOpen} onClose={() => setSearchOpen(false)} />
      </Box>
    </ThemeRegistry>
  )
}

export default App
