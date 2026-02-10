import { useState } from 'react'
import { useColorScheme } from '@mui/material/styles'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  BrightnessAuto as BrightnessAutoIcon,
} from '@mui/icons-material'

export const ThemeToggle = () => {
  const { mode, setMode } = useColorScheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  // SSR safety guard
  if (!mode) return null

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setMode(newMode)
    handleMenuClose()
  }

  const getCurrentIcon = () => {
    if (mode === 'dark') return <Brightness4Icon />
    if (mode === 'light') return <Brightness7Icon />
    return <BrightnessAutoIcon />
  }

  return (
    <>
      <IconButton
        onClick={handleMenuOpen}
        color="inherit"
        aria-label="theme settings"
      >
        {getCurrentIcon()}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleModeChange('light')}>
          <ListItemIcon>
            <Brightness7Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Light</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleModeChange('dark')}>
          <ListItemIcon>
            <Brightness4Icon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dark</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleModeChange('system')}>
          <ListItemIcon>
            <BrightnessAutoIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>System</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
