import { useState, useEffect } from 'react'
import { Search as SearchIcon, Loader2 } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { MainLayout } from './layout/MainLayout'
import { ThemeProvider } from './components/ThemeProvider'
import { ThemeToggle } from './components/ThemeToggle'
import { SearchModal } from './components/SearchModal'
import { DownloadButton } from './components/DownloadButton'
import { RunInfoSidebar } from './components/RunInfoSidebar'
import { LoadReportButton } from './components/LoadReportButton'
import { useRootStore } from './store'
import { observer } from 'mobx-react-lite'
import { isServerMode, isStaticMode } from './services/ApiDataService'

const App = observer(() => {
  const [isSearchOpen, setSearchOpen] = useState(false)
  const rootStore = useRootStore()
  const { reportStore, isApiLoading, apiError } = rootStore

  // Auto-load data when running in server or static mode (via CLI)
  useEffect(() => {
    if (reportStore.runData || isApiLoading) return

    if (isStaticMode()) {
      rootStore.loadFromEmbedded().catch((error) => {
        console.error('Failed to load embedded report:', error)
      })
    } else if (isServerMode()) {
      rootStore.loadFromApi().catch((error) => {
        console.error('Failed to load report from API:', error)
      })
    }
  }, [rootStore, reportStore.runData, isApiLoading])

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

  // Show loading state when loading from API
  if (isApiLoading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading report...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Show error state if API loading failed
  if (apiError) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md p-6">
            <p className="text-destructive mb-4">Failed to load report</p>
            <p className="text-muted-foreground text-sm">{apiError}</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen grid grid-rows-[auto_1fr] bg-background">
        {/* AppBar - Fixed header */}
        <header className="bg-card border-b">
          <div className="flex items-center h-12 px-4">
            {/* Left: Title */}
            <div className="flex items-center">
              <h6 className="text-lg font-semibold truncate max-w-md">
                {reportStore.runData?.title || 'Qase | Report'}
              </h6>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <LoadReportButton variant="header" />
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search tests (Cmd+K)"
                className="p-2 rounded-md hover:bg-accent"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
              <DownloadButton />
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main layout with sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] overflow-hidden">
          <main className="overflow-y-auto">
            <MainLayout />
          </main>
          <aside className="hidden lg:block border-l bg-card overflow-y-auto">
            <div className="p-4">
              <RunInfoSidebar />
            </div>
          </aside>
        </div>

        <SearchModal open={isSearchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </ThemeProvider>
  )
})

export default App
