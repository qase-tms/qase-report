# Phase 34: TanStack Table Migration - Research

**Researched:** 2026-02-11
**Domain:** Data table UI with virtualization and filtering
**Confidence:** HIGH

## Summary

Phase 34 requires migrating from react-window list-based virtualization to TanStack Table with table-based UI, while preserving virtual scrolling performance for 500+ tests, MobX integration, and command palette search with fuzzy matching.

TanStack Table v8 is a headless UI library (100% control over markup/styles) that pairs naturally with shadcn/ui (already integrated in v1.5). The recommended virtualization library is **@tanstack/react-virtual** (not react-window) from the same team, designed to work seamlessly with TanStack Table. For fuzzy search, TanStack provides **@tanstack/match-sorter-utils** specifically adapted for row-by-row filtering in tables.

The migration is UI-layer only - MobX state management remains unchanged (per v1.5 strategy). Current TestResultsStore provides reactive filtering/search; TanStack Table will consume this as controlled state while adding sorting, column definitions, and row actions.

**Primary recommendation:** Use TanStack Table v8 + @tanstack/react-virtual + @tanstack/match-sorter-utils with shadcn/ui data table pattern. This stack is proven (official examples handle 100k+ rows), TypeScript-first, and actively maintained (v8.21.3 released April 2025).

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @tanstack/react-table | v8.21.3 | Headless table logic | Industry standard for data tables (27.7k stars, 176k projects), framework-agnostic core, 100% customizable |
| @tanstack/react-virtual | Latest | Virtual scrolling | Official TanStack library, designed for TanStack Table integration, more responsive than react-window on low-end devices |
| @tanstack/match-sorter-utils | Latest | Fuzzy filtering | Forked from match-sorter specifically for TanStack Table's row-by-row filtering, official recommendation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn/ui Table | Latest | UI components | Already integrated in v1.5, official data table pattern documented |
| shadcn/ui DropdownMenu | Latest | Row actions | Standard pattern for table actions (view details, view history) |
| react-hotkeys-hook | v5.2.4 | Cmd+K binding | Already installed, no change needed |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tanstack/react-virtual | react-window | react-window is deprecated/unmaintained (last release 2022), lacks TanStack Table integration patterns |
| @tanstack/match-sorter-utils | fuse.js | Fuse.js designed for document search, not row-by-row table filtering; match-sorter-utils is TanStack-optimized |
| TanStack Table | MUI Data Grid | Requires keeping MUI (conflicts with v1.5 migration strategy), less flexible, opinionated styling |

**Installation:**
```bash
npm install @tanstack/react-table @tanstack/react-virtual @tanstack/match-sorter-utils
```

## Architecture Patterns

### Recommended Project Structure
```
src/components/TestList/
├── columns.tsx              # Column definitions (ID, Status, Title, Duration)
├── data-table.tsx           # Reusable DataTable component with virtualization
├── test-list-page.tsx       # Page component (replaces VirtualizedTestList.tsx)
├── TestListItem.tsx         # DELETE - no longer needed (cell rendering inline)
├── TestListFilters.tsx      # PRESERVE - filters work with MobX, not TanStack state
├── TestListSearch.tsx       # MIGRATE - integrate fuzzy filter with global filter
└── StabilityBadge.tsx       # PRESERVE - used in cell renderer
```

### Pattern 1: Column Definitions (Type-Safe)
**What:** Define table columns with TypeScript generic for QaseTestResult type
**When to use:** Required for TanStack Table setup

**Example:**
```typescript
// Source: Official shadcn/ui data table documentation
// https://ui.shadcn.com/docs/components/radix/data-table
"use client" // Not needed for Vite, but shown in docs

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QaseTestResult } from "@/schemas/QaseTestResult.schema"
import { getStatusIcon } from "./statusIcon"

export const columns: ColumnDef<QaseTestResult>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 100,
  },
  {
    accessorKey: "execution.status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {getStatusIcon(row.original.execution.status)}
        <span>{row.original.execution.status}</span>
      </div>
    ),
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "execution.duration",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Duration
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const duration = row.original.execution.duration
      return duration >= 1000
        ? `${(duration / 1000).toFixed(1)}s`
        : `${duration}ms`
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const test = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSelectTest(test.id)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewHistory(test.signature)}>
              View history
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
```

### Pattern 2: Virtualized Data Table Component
**What:** useReactTable + useVirtualizer integration with controlled state
**When to use:** Required for performance with 500+ rows

**Example:**
```typescript
// Source: TanStack Virtual + Table official examples
// https://tanstack.com/table/latest/docs/framework/react/examples/virtualized-rows
// https://tanstack.com/virtual/latest/docs/framework/react/examples/table

import { useRef, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const tableContainerRef = useRef<HTMLDivElement>(null)
  const { rows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 72, // Match current TestListItem height
    overscan: 2, // Match current overscanCount
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <div
      ref={tableContainerRef}
      className="overflow-auto rounded-md border"
      style={{ height: '600px' }} // Make configurable
    >
      <Table>
        <TableHeader className="sticky top-0 bg-background z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: header.getSize() }}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
          {virtualRows.length ? (
            virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              return (
                <TableRow
                  key={row.id}
                  data-index={virtualRow.index}
                  onClick={() => onRowClick?.(row.original)}
                  className="cursor-pointer hover:bg-accent"
                  style={{
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`,
                    width: '100%',
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

### Pattern 3: MobX Integration (Controlled State)
**What:** TanStack Table consumes MobX filteredResults, doesn't manage filter state
**When to use:** Preserve existing MobX state management (v1.5 requirement)

**Example:**
```typescript
// Source: TanStack Table state management guide
// https://tanstack.com/table/v8/docs/framework/react/guide/table-state

import { observer } from 'mobx-react-lite'
import { useRootStore } from '@/store'
import { DataTable } from './data-table'
import { columns } from './columns'

export const TestListPage = observer(() => {
  const { testResultsStore, selectTest } = useRootStore()

  // MobX provides filtered/searched data reactively
  // TanStack Table only handles sorting and UI
  const data = testResultsStore.filteredResults

  return (
    <div className="space-y-4">
      <TestListFilters /> {/* MobX-driven filters, unchanged */}
      <DataTable
        columns={columns}
        data={data}
        onRowClick={(test) => selectTest(test.id)}
      />
    </div>
  )
})
```

### Pattern 4: Fuzzy Search with Global Filter
**What:** Replace simple string matching with fuzzy matching in command palette
**When to use:** Cmd+K search requirement

**Example:**
```typescript
// Source: TanStack Table fuzzy filtering guide
// https://tanstack.com/table/v8/docs/guide/fuzzy-filtering

import { rankItem } from '@tanstack/match-sorter-utils'
import { FilterFn } from '@tanstack/react-table'

// Fuzzy filter function for global filtering
const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the ranking info in metadata
  addMeta({ itemRank })

  // Return if the item passed the ranking threshold
  return itemRank.passed
}

// In SearchModal component (replaces simple .includes())
const table = useReactTable({
  data: testResultsStore.resultsList,
  columns, // Define search columns (title, suite names)
  state: { globalFilter: query },
  onGlobalFilterChange: setQuery,
  globalFilterFn: fuzzyFilter,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})

const results = table.getRowModel().rows.slice(0, 10)
```

### Anti-Patterns to Avoid

- **Don't mutate data in place:** Always use stable references with useMemo for `data` and `columns` - in-place mutations cause infinite re-render loops
- **Don't skip memoization:** Defining columns/data directly in component body without useMemo triggers re-renders on every table state change
- **Don't use TanStack state for filters:** Keep MobX as source of truth for filters (statusFilters, searchQuery) - only use TanStack for sorting/column visibility
- **Don't render all rows:** Virtual scrolling is mandatory for 500+ tests - never use table.getRowModel().rows.map() without virtualization
- **Don't use flexRender without context:** Always pass getContext() to flexRender, not just the value - required for sorting handlers and cell metadata

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Virtual scrolling | Custom IntersectionObserver + position:absolute | @tanstack/react-virtual | Handles dynamic heights, scroll restoration, overscan optimization, mobile touch events - 100+ edge cases |
| Fuzzy matching | Levenshtein distance algorithm | @tanstack/match-sorter-utils | Optimized for table filtering (row-by-row), handles diacritics, maintains ranking metadata for sorting |
| Sorting logic | Array.sort() with custom comparators | getSortedRowModel() | Multi-column sorting, type-aware comparisons (numbers vs strings), stable sort, memoization |
| Column resizing | Mouse event handlers + state | TanStack Table column sizing APIs | Handles touch events, min/max constraints, column groups, persists widths |
| Row selection | Set<string> + onChange handlers | TanStack Table row selection feature | Sub-row selection, select-all logic, keyboard navigation, accessibility |

**Key insight:** TanStack Table's headless architecture means you control UI completely, but core data operations (sorting, filtering, pagination) are solved problems. Don't rebuild what's provided - focus on presentation layer.

## Common Pitfalls

### Pitfall 1: Unstable References Causing Infinite Loops
**What goes wrong:** Component re-renders infinitely, browser freezes, React DevTools shows constant updates
**Why it happens:** Defining `columns` or `data` inline without useMemo creates new references on every render, triggering table re-initialization
**How to avoid:**
```typescript
// BAD - creates new array on every render
const columns = [{ accessorKey: 'title', header: 'Title' }]

// GOOD - stable reference
const columns = useMemo<ColumnDef<QaseTestResult>[]>(
  () => [{ accessorKey: 'title', header: 'Title' }],
  []
)

// GOOD - depends on MobX observable
const data = useMemo(
  () => testResultsStore.filteredResults,
  [testResultsStore.filteredResults]
)
```
**Warning signs:** CPU usage spikes, browser tab becomes unresponsive, console shows thousands of logs

### Pitfall 2: Virtual Scrolling Performance Degradation
**What goes wrong:** Scrolling becomes janky, frame drops below 60fps, white space flashing
**Why it happens:** Not using `position: absolute` for rows, incorrect height estimation, missing overscan
**How to avoid:**
- Use `estimateSize` matching actual row height (72px from current implementation)
- Set `overscan` to render extra rows above/below viewport (2-5 recommended)
- Apply `position: absolute` and `transform: translateY()` to virtualized rows
- Don't use `height: auto` on virtualized rows (breaks layout calculations)
**Warning signs:** Scrollbar jumps during scroll, empty gaps appear, scroll position resets

### Pitfall 3: MobX Reactivity Breaking with TanStack State
**What goes wrong:** Filters don't update table, table shows stale data after MobX changes
**Why it happens:** TanStack Table doesn't know about MobX observables - needs React state updates
**How to avoid:**
```typescript
// BAD - TanStack doesn't track MobX changes
const table = useReactTable({
  data: testResultsStore.filteredResults, // Not reactive!
})

// GOOD - MobX observer + useMemo dependency
const data = useMemo(
  () => testResultsStore.filteredResults,
  [testResultsStore.filteredResults] // Re-runs when observable changes
)
const table = useReactTable({ data })

// Component must be observer()
export const TestListPage = observer(() => { /* ... */ })
```
**Warning signs:** Table doesn't update when filters change, manual refresh needed, data appears frozen

### Pitfall 4: Sorting State Conflicts with MobX Filtering
**What goes wrong:** Sorting resets when filters change, or filtering breaks sorted order
**Why it happens:** TanStack sorting runs on filtered data, but MobX filtering doesn't preserve sort order
**How to avoid:**
- Let TanStack handle sorting state completely (don't store in MobX)
- MobX provides filtered data, TanStack sorts it: `filteredResults` → `getSortedRowModel()`
- Don't implement custom sorting in MobX store for table data
- Use controlled sorting state: `state: { sorting }`, `onSortingChange: setSorting`
**Warning signs:** Table jumps to first page on filter, sort indicator disappears, sorted column resets

### Pitfall 5: Row Actions Closure Issues
**What goes wrong:** Row actions (view details, view history) always use first row's data or stale data
**Why it happens:** Closure captures outdated values, or event handler defined outside cell renderer
**How to avoid:**
```typescript
// BAD - captures stale onSelectTest reference
{
  id: "actions",
  cell: ({ row }) => {
    const handleClick = () => onSelectTest(row.original.id) // Closure!
    return <Button onClick={handleClick}>View</Button>
  }
}

// GOOD - inline arrow function or row.original
{
  id: "actions",
  cell: ({ row }) => (
    <Button onClick={() => onSelectTest(row.original.id)}>
      View
    </Button>
  )
}
```
**Warning signs:** All rows trigger same action, clicking bottom row shows top row details, IDs mismatch

### Pitfall 6: flexRender Type Errors
**What goes wrong:** TypeScript errors: "Type 'unknown' is not assignable to type 'ReactNode'"
**Why it happens:** flexRender infers generic types from context, needs explicit context argument
**How to avoid:**
```typescript
// BAD - missing context
flexRender(header.column.columnDef.header)

// GOOD - pass context
flexRender(header.column.columnDef.header, header.getContext())
flexRender(cell.column.columnDef.cell, cell.getContext())
```
**Warning signs:** TypeScript errors in JSX, headers/cells don't render, blank table

## Code Examples

Verified patterns from official sources:

### Basic Table Setup (No Virtualization)
```typescript
// Source: shadcn/ui data table documentation
// https://ui.shadcn.com/docs/components/radix/data-table

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
```

### Sorting Implementation
```typescript
// Source: shadcn/ui data table sorting
// https://ui.shadcn.com/docs/components/radix/data-table

import {
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table"

// In DataTable component
const [sorting, setSorting] = useState<SortingState>([])

const table = useReactTable({
  data,
  columns,
  state: { sorting },
  onSortingChange: setSorting,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
})

// In column definition
{
  accessorKey: "title",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Title
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
}
```

### Virtual Scrolling Integration
```typescript
// Source: TanStack Table virtualized rows example
// https://tanstack.com/table/latest/docs/framework/react/examples/virtualized-rows

import { useVirtualizer } from '@tanstack/react-virtual'

const tableContainerRef = useRef<HTMLDivElement>(null)
const { rows } = table.getRowModel()

const rowVirtualizer = useVirtualizer({
  count: rows.length,
  getScrollElement: () => tableContainerRef.current,
  estimateSize: () => 72,
  overscan: 2,
})

const virtualRows = rowVirtualizer.getVirtualItems()

return (
  <div ref={tableContainerRef} style={{ height: '600px', overflow: 'auto' }}>
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        {/* Headers */}
      </TableHeader>
      <TableBody style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {virtualRows.map((virtualRow) => {
          const row = rows[virtualRow.index]
          return (
            <TableRow
              key={row.id}
              style={{
                position: 'absolute',
                transform: `translateY(${virtualRow.start}px)`,
                width: '100%',
              }}
            >
              {/* Cells */}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  </div>
)
```

### Fuzzy Filter Function
```typescript
// Source: TanStack Table fuzzy filtering guide
// https://tanstack.com/table/v8/docs/guide/fuzzy-filtering

import { rankItem } from '@tanstack/match-sorter-utils'
import { FilterFn } from '@tanstack/react-table'

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// Usage in table
const table = useReactTable({
  data,
  columns,
  filterFns: {
    fuzzy: fuzzyFilter,
  },
  state: { globalFilter },
  onGlobalFilterChange: setGlobalFilter,
  globalFilterFn: 'fuzzy',
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-window | @tanstack/react-virtual | 2024-2025 | react-window unmaintained (last release 2022), TanStack Virtual designed for modern frameworks, better performance on low-end devices |
| react-table v7 | @tanstack/react-table v8 | 2022 (v8 release) | New package scope, renamed hooks (useTable → useReactTable), improved TypeScript support, feature plugins replaced with feature functions |
| match-sorter | @tanstack/match-sorter-utils | 2023 | Forked specifically for TanStack Table row-by-row filtering, maintains original API with TanStack optimizations |
| MUI Data Grid | Headless alternatives (TanStack Table) | 2024-2025 | Trend toward headless UI for full control, better bundle size, framework-agnostic |

**Deprecated/outdated:**
- **react-table v7:** Use @tanstack/react-table v8 - different package name, breaking API changes
- **react-window:** Use @tanstack/react-virtual - original maintainer no longer active, lacks modern features
- **Global filter with simple includes():** Use fuzzy filtering with match-sorter-utils - better UX, handles typos

## Open Questions

1. **Suite grouping with virtualization**
   - What we know: Current implementation groups tests by suite with expand/collapse headers (VirtualizedTestList.tsx uses VariableSizeList with suite-header and test-item types)
   - What's unclear: TanStack Table has grouping/expanding APIs, but examples focus on tree data, not flat data with visual grouping
   - Recommendation: Phase 34 should implement flat table without suite grouping initially (success criteria don't mention grouping). Consider suite grouping as separate phase or use TanStack Table's grouping feature (getGroupedRowModel, getExpandedRowModel) if needed.

2. **Command palette integration strategy**
   - What we know: Current SearchModal uses simple string matching, success criteria require "fuzzy matching"
   - What's unclear: Should command palette use same fuzzy filter as table global filter, or independent fuzzy logic?
   - Recommendation: Implement fuzzy filter in SearchModal independently (doesn't need full table instance, just fuzzy matching on resultsList). Can share fuzzy filter function between SearchModal and DataTable if global filter is added later.

3. **Sticky header with virtual scrolling**
   - What we know: Table headers need to stay visible when scrolling rows
   - What's unclear: Does `position: sticky` work reliably with `position: absolute` virtualized rows across browsers?
   - Recommendation: Official examples use `sticky top-0` on TableHeader - test in target browsers (Chrome, Firefox, Safari). Fallback: fixed positioning or non-virtualized header.

4. **Row height consistency**
   - What we know: Current rows are 72px fixed height (suite headers + test items)
   - What's unclear: Will table rows (with borders, padding) match 72px exactly, or need adjustment?
   - Recommendation: Measure actual rendered row height with DevTools, adjust estimateSize in useVirtualizer to match. Fixed heights are simpler than dynamic heights (no measureElement needed).

## Sources

### Primary (HIGH confidence)
- [TanStack Table GitHub Repository](https://github.com/TanStack/table) - v8.21.3 release info, features, installation
- [shadcn/ui Data Table Documentation](https://ui.shadcn.com/docs/components/radix/data-table) - Official integration pattern with TanStack Table, column definitions, sorting, row actions
- [TanStack Table Fuzzy Filtering Guide](https://tanstack.com/table/v8/docs/guide/fuzzy-filtering) - Official fuzzy filter implementation with match-sorter-utils
- [TanStack Table Virtualization Guide](https://tanstack.com/table/latest/docs/guide/virtualization) - Integration with react-virtual and react-window
- [TanStack Table React Virtualized Rows Example](https://tanstack.com/table/latest/docs/framework/react/examples/virtualized-rows) - Official working example with @tanstack/react-virtual

### Secondary (MEDIUM confidence)
- [TanStack Table Sorting APIs](https://tanstack.com/table/v8/docs/api/features/sorting) - Sorting function signatures, TypeScript examples
- [React Virtualization Showdown: TanStack Virtualizer vs React-Window](https://mashuktamim.medium.com/react-virtualization-showdown-tanstack-virtualizer-vs-react-window-for-sticky-table-grids-69b738b36a83) - Performance comparison (2025)
- [Building a Performant Virtualized Table with @tanstack/react-table and @tanstack/react-virtual](https://medium.com/codex/building-a-performant-virtualized-table-with-tanstack-react-table-and-tanstack-react-virtual-f267d84fbca7) - Community implementation guide
- [TanStack Table MobX Discussion #5802](https://github.com/TanStack/table/discussions/5802) - Official discussion on MobX integration patterns
- [TanStack Table FAQ](https://tanstack.com/table/latest/docs/faq) - Common mistakes (memoization, infinite loops)

### Tertiary (LOW confidence)
- [npm trends: @tanstack/react-virtual vs react-window](https://npmtrends.com/@tanstack/react-virtual-vs-react-window) - Download statistics (used for adoption trends, not technical decisions)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official releases (v8.21.3), official docs, verified download statistics (27.7k stars)
- Architecture: HIGH - Patterns from official shadcn/ui docs + TanStack examples, cross-verified with community implementations
- Pitfalls: HIGH - Documented in official FAQ + GitHub discussions with maintainer responses
- MobX integration: MEDIUM - No official MobX adapter, based on community discussion (#5802) and state management guide
- Virtual scrolling: HIGH - Official examples with @tanstack/react-virtual, performance claims verified by independent comparison

**Research date:** 2026-02-11
**Valid until:** 2026-03-11 (30 days - stable ecosystem, v8 mature since 2022)
