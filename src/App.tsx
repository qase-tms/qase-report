import { useState } from 'react'
import { AppBar, Toolbar, Box, Typography, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  FormatListBulleted,
  ErrorOutline,
  Collections,
  CompareArrows,
  BubbleChart,
} from '@mui/icons-material'
import { useHotkeys } from 'react-hotkeys-hook'
import { MainLayout } from './layout/MainLayout'
import { ThemeRegistry } from './theme/ThemeRegistry'
import { ThemeToggle } from './components/ThemeToggle'
import { NavigationDrawer } from './components/NavigationDrawer'
import { SearchModal } from './components/SearchModal'
import { ExportButton } from './components/ExportButton'
import { RunDateDisplay } from './components/RunDateDisplay'
import { useRootStore } from './store'

const App = () => {
  const [isSearchOpen, setSearchOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const { activeView, setActiveView } = useRootStore()
  const open = Boolean(anchorEl)

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
            {/* Hamburger menu */}
            <IconButton
              color="inherit"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-label="Open navigation menu"
              aria-controls={open ? 'navigation-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>

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
        <Menu
          id="navigation-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          MenuListProps={{
            'aria-labelledby': 'navigation-button',
          }}
        >
          <MenuItem
            selected={activeView === 'dashboard'}
            onClick={() => {
              setActiveView('dashboard')
              setAnchorEl(null)
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </MenuItem>
          <MenuItem
            selected={activeView === 'tests'}
            onClick={() => {
              setActiveView('tests')
              setAnchorEl(null)
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <FormatListBulleted />
            </ListItemIcon>
            <ListItemText primary="Tests" />
          </MenuItem>
          <MenuItem
            selected={activeView === 'failure-clusters'}
            onClick={() => {
              setActiveView('failure-clusters')
              setAnchorEl(null)
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <ErrorOutline />
            </ListItemIcon>
            <ListItemText primary="Failure Clusters" />
          </MenuItem>
          <MenuItem
            selected={activeView === 'gallery'}
            onClick={() => {
              setActiveView('gallery')
              setAnchorEl(null)
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Collections />
            </ListItemIcon>
            <ListItemText primary="Gallery" />
          </MenuItem>
          <MenuItem
            selected={activeView === 'comparison'}
            onClick={() => {
              setActiveView('comparison')
              setAnchorEl(null)
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <CompareArrows />
            </ListItemIcon>
            <ListItemText primary="Comparison" />
          </MenuItem>
          <MenuItem
            selected={activeView === 'analytics'}
            onClick={() => {
              setActiveView('analytics')
              setAnchorEl(null)
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <BubbleChart />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </MenuItem>
        </Menu>
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
