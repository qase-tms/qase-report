import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal } from 'lucide-react'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { getStatusIcon } from './statusIcon'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

/**
 * Column definitions for the test results table.
 * Exported as a constant to prevent infinite re-renders (see TanStack Table best practices).
 */
export const createColumns = (
  onSelectTest: (id: string) => void
): ColumnDef<QaseTestResult>[] => [
  {
    accessorKey: 'id',
    header: 'ID',
    size: 100,
    cell: ({ row }) => (
      <div className="font-mono text-xs text-muted-foreground">
        {row.original.id.slice(0, 8)}
      </div>
    ),
  },
  {
    accessorKey: 'execution.status',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = row.original.execution.status
      return (
        <div className="flex items-center gap-2">
          {getStatusIcon(status)}
          <span className="capitalize">{status}</span>
        </div>
      )
    },
    size: 120,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="truncate max-w-[600px]" title={row.original.title}>
          {row.original.title}
        </div>
      )
    },
  },
  {
    accessorKey: 'execution.duration',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="h-8 px-2"
        >
          Duration
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const duration = row.original.execution.duration
      const durationText =
        duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`
      return <div className="text-right">{durationText}</div>
    },
    size: 120,
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const test = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSelectTest(test.id)}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              View history
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    size: 60,
  },
]
