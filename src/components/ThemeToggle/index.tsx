import { useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../ThemeProvider'

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleModeChange = (newMode: 'light' | 'dark' | 'system') => {
    setTheme(newMode)
    handleMenuClose()
  }

  const getCurrentIcon = () => {
    if (theme === 'dark') return <Moon className="h-5 w-5" />
    if (theme === 'light') return <Sun className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }

  return (
    <>
      <button
        onClick={handleMenuOpen}
        className="p-2 rounded-md hover:bg-accent"
        aria-label="theme settings"
      >
        {getCurrentIcon()}
      </button>

      {anchorEl && (
        <div className="fixed inset-0 z-40" onClick={handleMenuClose}>
          <div
            className="absolute right-4 top-14 bg-card border rounded-md shadow-lg min-w-[150px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handleModeChange('light')}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent"
            >
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => handleModeChange('dark')}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent"
            >
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </button>
            <button
              onClick={() => handleModeChange('system')}
              className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent"
            >
              <Monitor className="h-4 w-4" />
              <span>System</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
