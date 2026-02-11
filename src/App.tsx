import { useState } from 'react'
import {
  Search as SearchIcon,
  Menu as MenuIcon,
  LayoutDashboard as DashboardIcon,
  List as FormatListBulleted,
  AlertCircle as ErrorOutline,
  Images as Collections,
  ArrowLeftRight as CompareArrows,
  Activity as BubbleChart,
} from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { MainLayout } from './layout/MainLayout'
import { ThemeProvider } from './components/ThemeProvider'
import { ThemeToggle } from './components/ThemeToggle'
import { SearchModal } from './components/SearchModal'
import { ExportButton } from './components/ExportButton'
import { StatusBarPill } from './components/StatusBarPill'
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

  const closeMenu = () => setAnchorEl(null)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'tests', label: 'Tests', icon: FormatListBulleted },
    { id: 'failure-clusters', label: 'Failure Clusters', icon: ErrorOutline },
    { id: 'gallery', label: 'Gallery', icon: Collections },
    { id: 'comparison', label: 'Comparison', icon: CompareArrows },
    { id: 'analytics', label: 'Analytics', icon: BubbleChart },
  ]

  return (
    <ThemeProvider>
      <div className="flex min-h-screen bg-background">
        {/* AppBar - Fixed header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b">
          <div className="flex items-center h-12 px-4">
            {/* Hamburger menu */}
            <button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              aria-label="Open navigation menu"
              aria-controls={open ? 'navigation-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              className="p-2 mr-2 rounded-md hover:bg-accent"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            {/* Left: Title */}
            <div className="flex items-center">
              <h6 className="text-lg font-semibold">Qase | Report</h6>
            </div>

            {/* Center: Status Bar (pushed by flex-grow) */}
            <div className="flex-grow flex justify-center">
              <StatusBarPill />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search tests (Cmd+K)"
                className="p-2 rounded-md hover:bg-accent"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <ExportButton />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Navigation Menu - Dropdown */}
        {open && (
          <div className="fixed inset-0 z-40" onClick={closeMenu}>
            <div
              className="absolute left-4 top-14 bg-card border rounded-md shadow-lg min-w-[200px]"
              onClick={(e) => e.stopPropagation()}
            >
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as any)
                      closeMenu()
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-accent ${
                      activeView === item.id ? 'bg-accent' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-grow min-w-0">
          {/* Spacer for fixed header */}
          <div className="h-12" />
          <MainLayout />
        </main>

        <SearchModal open={isSearchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </ThemeProvider>
  )
}

export default App
