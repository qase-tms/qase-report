import { useMemo } from 'react'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { TestListFilters } from './TestListFilters'
import { TestListSearch } from './TestListSearch'
import { DataTable } from './DataTable'
import { createColumns } from './columns'

export const TestList = observer(() => {
  const { testResultsStore, selectTest } = useRootStore()
  const { filteredResults, resultsList, activeFilterCount } = testResultsStore

  // Early return if no tests loaded
  if (resultsList.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tests loaded. Load a report to view tests.
      </p>
    )
  }

  // Memoize data to prevent table re-initialization on every render
  // MobX observer ensures re-render when filteredResults changes
  const data = useMemo(
    () => filteredResults,
    [filteredResults]
  )

  // Memoize columns with selectTest callback
  const columns = useMemo(
    () => createColumns(selectTest),
    [selectTest]
  )

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
      {filteredResults.length === 0 && resultsList.length > 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No tests match current filters.
        </p>
      ) : (
        /* Data table */
        <div className="h-[calc(100vh-400px)] min-h-[300px]">
          <DataTable
            columns={columns}
            data={data}
            onRowClick={(test) => selectTest(test.id)}
          />
        </div>
      )}
    </div>
  )
})
