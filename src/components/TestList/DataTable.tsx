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
  /** Custom row height based on row data. Overrides default 40px for data rows and 32px for headers. */
  getRowHeight?: (row: TData) => number
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
  getRowHeight,
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
    estimateSize: (index) => {
      const row = rows[index]
      if ((row?.original as Record<string, unknown>)?.type === 'header') return 32
      if (getRowHeight && row?.original) return getRowHeight(row.original)
      return 40
    },
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
        <TableBody
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: 'relative',
          }}
        >
          {virtualRows.length ? (
            virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index]
              const isHeader = (row.original as Record<string, unknown>).type === 'header'
              return (
                <TableRow
                  key={row.id}
                  data-index={virtualRow.index}
                  onClick={isHeader ? undefined : () => onRowClick?.(row.original)}
                  className={isHeader
                    ? 'border-b border-border/50 bg-muted/30'
                    : 'cursor-pointer hover:bg-accent'
                  }
                  style={{
                    position: 'absolute',
                    transform: `translateY(${virtualRow.start}px)`,
                    width: '100%',
                    height: isHeader ? '32px' : (getRowHeight ? `${getRowHeight(row.original)}px` : '40px'),
                  }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const isFlexColumn = cell.column.id === 'title'
                    const width = cell.column.getSize()
                    return (
                      <TableCell
                        key={cell.id}
                        className={isFlexColumn ? 'w-full overflow-hidden' : ''}
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
