import { observer } from 'mobx-react-lite'
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Toolbar,
  Box,
  Divider,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  FormatListBulleted as TestsIcon,
  ErrorOutline as FailureClustersIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  BubbleChart as AnalyticsIcon,
  Collections as GalleryIcon,
} from '@mui/icons-material'
import { useRootStore } from '../../store'
import { SidebarStats } from '../SidebarStats'
import { SidebarFilters } from '../SidebarFilters'

const DRAWER_WIDTH_EXPANDED = 240
const DRAWER_WIDTH_COLLAPSED = 64

export const NavigationDrawer = observer(() => {
  const { isNavigationCollapsed, activeView, toggleNavigation, setActiveView } =
    useRootStore()

  const drawerWidth = isNavigationCollapsed
    ? DRAWER_WIDTH_COLLAPSED
    : DRAWER_WIDTH_EXPANDED

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      id: 'tests' as const,
      label: 'Tests',
      icon: <TestsIcon />,
    },
    {
      id: 'failure-clusters' as const,
      label: 'Failure Clusters',
      icon: <FailureClustersIcon />,
    },
    {
      id: 'gallery' as const,
      label: 'Gallery',
      icon: <GalleryIcon />,
    },
    {
      id: 'analytics' as const,
      label: 'Analytics',
      icon: <AnalyticsIcon />,
    },
  ]

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      aria-label="main navigation"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          transition: theme =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
      }}
    >
      <Toolbar variant="dense" />
      {!isNavigationCollapsed && <SidebarStats />}
      {!isNavigationCollapsed && <Divider />}
      <List>
        {navItems.map(item => (
          <ListItemButton
            key={item.id}
            selected={activeView === item.id}
            onClick={() => setActiveView(item.id)}
            aria-current={activeView === item.id ? 'page' : undefined}
            sx={{
              minHeight: 48,
              justifyContent: isNavigationCollapsed ? 'center' : 'initial',
              px: 2.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: isNavigationCollapsed ? 'auto' : 3,
                justifyContent: 'center',
              }}
            >
              {item.icon}
            </ListItemIcon>
            {!isNavigationCollapsed && <ListItemText primary={item.label} />}
          </ListItemButton>
        ))}
      </List>
      {!isNavigationCollapsed && <Divider />}
      {!isNavigationCollapsed && <SidebarFilters />}
      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2 }}>
        <IconButton onClick={toggleNavigation} aria-label="toggle navigation">
          {isNavigationCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
    </Drawer>
  )
})
