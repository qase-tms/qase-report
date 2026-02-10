import { useRef } from 'react'
import { Box, Typography, Paper } from '@mui/material'
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
      <Typography variant="body2" color="text.secondary">
        No tests loaded. Load a report to view tests.
      </Typography>
    )
  }

  const grouped = groupBySuite(filteredResults)

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Tests
      </Typography>

      {/* Filters and search */}
      <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TestListSearch />
        <TestListFilters />
      </Box>

      {/* Filter summary */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Showing {filteredResults.length} of {resultsList.length} tests
        {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active)`}
      </Typography>

      {/* Empty state when filters match nothing */}
      {filteredResults.length === 0 && resultsList.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No tests match current filters.
        </Typography>
      )}

      {/* Virtualized test list */}
      <Box
        ref={containerRef}
        sx={{ height: 'calc(100vh - 400px)', minHeight: 300 }}
      >
        <VirtualizedTestList
          grouped={grouped}
          expandedSuites={expandedSuites}
          toggleSuite={toggleSuite}
          onSelectTest={selectTest}
          height={containerRef.current?.offsetHeight || 400}
        />
      </Box>
    </Paper>
  )
})
