import { useState, useRef } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ExpandedState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
  height?: number // Default: 600
  // Expanding support
  getSubRows?: (originalRow: TData) => TData[] | undefined
  getRowId?: (originalRow: TData) => string
  expanded?: ExpandedState
  onExpandedChange?: (updater: ExpandedState | ((old: ExpandedState) => ExpandedState)) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  height = 600,
  getSubRows,
  getRowId,
  expanded,
  onExpandedChange,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({})
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Use controlled state pattern for expansion
  const expandedState = expanded ?? internalExpanded

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      expanded: expandedState,
    },
    onSortingChange: setSorting,
    onExpandedChange: onExpandedChange ?? setInternalExpanded,
    getRowId: getRowId,
    getSubRows: getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  // Get sorted rows from table
  const { rows } = table.getRowModel()

  // Configure virtualizer
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 40, // Compact row height
    overscan: 2, // Match current overscanCount
  })

  const virtualRows = rowVirtualizer.getVirtualItems()

  return (
    <div
      ref={tableContainerRef}
      className="rounded-md border overflow-auto"
      style={{ height: `${height}px` }}
    >
      <Table className="w-full">
        <TableHeader className="sticky top-0 bg-background z-10">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isFlexColumn = header.id === 'title'
                const width = header.getSize()
                return (
                  <TableHead
                    key={header.id}
                    className={isFlexColumn ? 'w-full' : ''}
                    style={isFlexColumn ? undefined : { width: `${width}px`, minWidth: `${width}px` }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
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
                    height: '40px', // Compact row height
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isFlexColumn = cell.column.id === 'title'
                    const width = cell.column.getSize()
                    return (
                      <TableCell
                        key={cell.id}
                        className={isFlexColumn ? 'w-full' : ''}
                        style={isFlexColumn ? undefined : { width: `${width}px`, minWidth: `${width}px` }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
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
