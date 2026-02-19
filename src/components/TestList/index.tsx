import { useMemo, useCallback, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { type ExpandedState } from '@tanstack/react-table'
import { useRootStore } from '../../store'
import { TestListFilters } from './TestListFilters'
import { TestListSearch } from './TestListSearch'
import { DataTable } from './DataTable'
import { createColumns } from './columns'
import { buildSuiteTree, type TreeNode } from './buildSuiteTree'

const STORAGE_KEY = 'qase-report-expanded-suites'

// Load expanded state from sessionStorage (SSR-safe)
const loadExpandedState = (): ExpandedState => {
  if (typeof window === 'undefined') return {}
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

export const TestList = observer(() => {
  const { testResultsStore, selectTest } = useRootStore()
  const { filteredResults, resultsList, activeFilterCount } = testResultsStore

  // Expanded state with sessionStorage persistence
  const [expanded, setExpanded] = useState<ExpandedState>(loadExpandedState)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(expanded))
    }
  }, [expanded])

  // Transform flat test array to tree structure with suites
  // MobX observer ensures re-render when filteredResults changes
  // NOTE: Must be called before any early returns to comply with Rules of Hooks
  const data = useMemo(
    () => buildSuiteTree(filteredResults),
    [filteredResults]
  )

  // Memoize columns with selectTest callback
  const columns = useMemo(
    () => createColumns(selectTest),
    [selectTest]
  )

  // Row height: taller for tests with parameters
  const getRowHeight = useCallback((row: TreeNode) => {
    if (row.type === 'test' && row.testData?.params && Object.keys(row.testData.params).length > 0) {
      return 56
    }
    return 40
  }, [])

  // Early return if no tests loaded
  if (resultsList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tests loaded. Load a report to view tests.
      </p>
    )
  }

  // Calculate table height: viewport - header - filters - search - padding
  // This ensures table fills available space without causing page scrollbar
  const tableHeight = window.innerHeight - 300

  // Calculate total tests in tree for accurate summary
  const totalTestsInTree = data.reduce(
    (sum, suite) => sum + (suite.totalTests || 0),
    0
  )

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4">
      <h6 className="text-lg font-semibold mb-4">Tests</h6>

      {/* Search and filters on same line */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <TestListSearch />
        <TestListFilters />
      </div>

      {/* Filter summary */}
      <p className="text-sm text-muted-foreground mb-2">
        Showing {totalTestsInTree} of {resultsList.length} tests
        {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} active)`}
      </p>

      {/* Empty state when filters match nothing */}
      {totalTestsInTree === 0 && resultsList.length > 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No tests match current filters.
        </p>
      ) : (
        /* Data table */
        <DataTable
          columns={columns}
          data={data}
          onRowClick={(node) => {
            // Only open test details for test rows, not suite rows
            if (node.type === 'test' && node.testData) {
              selectTest(node.testData.id)
            }
          }}
          height={tableHeight}
          getSubRows={(row) => row.subRows}
          getRowId={(row) => row.id}
          expanded={expanded}
          onExpandedChange={setExpanded}
          getRowHeight={getRowHeight}
        />
      )}
    </div>
  )
})
