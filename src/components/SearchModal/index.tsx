import { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export const SearchModal = observer(({ open, onClose }: SearchModalProps) => {
  const root = useRootStore()
  const [query, setQuery] = useState('')

  // Filter results by title (case-insensitive)
  const results = root.testResultsStore.resultsList.filter((test) =>
    test.title.toLowerCase().includes(query.toLowerCase())
  )

  // Limit to first 10 results for performance
  const displayedResults = results.slice(0, 10)

  const handleResultClick = (testId: string) => {
    root.selectTest(testId)
    onClose()
    setQuery('') // Clear search on close
  }

  const handleClose = () => {
    onClose()
    setQuery('') // Clear search on close
  }

  const getSuiteName = (test: (typeof results)[0]) => {
    if (!test.relations?.suite?.data?.length) {
      return 'No suite'
    }
    return test.relations.suite.data.map((s) => s.title).join(' > ')
  }

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-card rounded-lg border shadow-lg">
        {/* Search input */}
        <div className="p-4">
          <input
            autoFocus
            type="text"
            className="w-full px-3 py-2 text-sm bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            placeholder="Search tests..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Results list */}
        <div className="max-h-[400px] overflow-auto px-2 pb-2">
          {query.trim() === '' ? (
            <div className="px-3 py-2">
              <span className="text-sm text-muted-foreground">
                Type to search tests...
              </span>
            </div>
          ) : displayedResults.length === 0 ? (
            <div className="px-3 py-2">
              <span className="text-sm text-muted-foreground">
                No results found
              </span>
            </div>
          ) : (
            displayedResults.map((test) => (
              <button
                key={test.id}
                onClick={() => handleResultClick(test.id)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <div className="text-sm">{test.title}</div>
                <div className="text-xs text-muted-foreground">
                  {test.execution.status} • {getSuiteName(test)}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
})
