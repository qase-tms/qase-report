import { useState } from 'react'
import { Search as SearchIcon } from 'lucide-react'
import { useHotkeys } from 'react-hotkeys-hook'
import { MainLayout } from './layout/MainLayout'
import { ThemeProvider } from './components/ThemeProvider'
import { ThemeToggle } from './components/ThemeToggle'
import { SearchModal } from './components/SearchModal'
import { ExportButton } from './components/ExportButton'
import { RunInfoSidebar } from './components/RunInfoSidebar'
import { LoadReportButton } from './components/LoadReportButton'
import { useRootStore } from './store'
import { observer } from 'mobx-react-lite'

const App = observer(() => {
  const [isSearchOpen, setSearchOpen] = useState(false)
  const { reportStore } = useRootStore()

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
              <ExportButton />
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
