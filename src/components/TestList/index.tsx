import { useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { useSuiteExpandState } from '../../hooks/useSuiteExpandState'
import { useScrollPosition } from '../../hooks/useScrollPosition'
import { TestListFilters } from './TestListFilters'
import { TestListSearch } from './TestListSearch'
import { VirtualizedTestList } from './VirtualizedTestList'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

// Group tests by top-level suite
const groupBySuite = (tests: QaseTestResult[]) => {
  const grouped = new Map<string, QaseTestResult[]>()

  for (const test of tests) {
    const suiteTitle = test.relations?.suite?.data?.[0]?.title || 'Uncategorized'

    if (!grouped.has(suiteTitle)) {
      grouped.set(suiteTitle, [])
    }
    grouped.get(suiteTitle)!.push(test)
  }

  return grouped
}

export const TestList = observer(() => {
  const { testResultsStore, selectTest } = useRootStore()
  const { filteredResults, resultsList, activeFilterCount } = testResultsStore
  const { expandedSuites, toggleSuite } = useSuiteExpandState()
  const containerRef = useRef<HTMLDivElement>(null)

  useScrollPosition('test-list', containerRef)

  // Early return if no tests loaded
  if (resultsList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tests loaded. Load a report to view tests.
      </p>
    )
  }

  const grouped = groupBySuite(filteredResults)

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4">
      <h6 className="text-lg font-semibold mb-4">Tests</h6>

      {/* Filters and search */}
      <div className="mb-4 flex flex-col gap-4">
        <TestListSearch />
        <TestListFilters />
      </div>

      {/* Filter summary */}
      <p className="text-sm text-muted-foreground mb-2">
        Showing {filteredResults.length} of {resultsList.length} tests
        {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active)`}
      </p>

      {/* Empty state when filters match nothing */}
      {filteredResults.length === 0 && resultsList.length > 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No tests match current filters.
        </p>
      )}

      {/* Virtualized test list */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-400px)] min-h-[300px]"
      >
        <VirtualizedTestList
          grouped={grouped}
          expandedSuites={expandedSuites}
          toggleSuite={toggleSuite}
          onSelectTest={selectTest}
          height={containerRef.current?.offsetHeight || 400}
        />
      </div>
    </div>
  )
})
