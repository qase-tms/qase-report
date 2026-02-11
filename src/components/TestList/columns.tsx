import { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight, ArrowUpDown, MoreHorizontal, FolderOpen, File } from 'lucide-react'
import type { TreeNode } from './buildSuiteTree'
import { getStatusIcon } from './statusIcon'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { MultiSegmentProgress, type ProgressSegment } from './MultiSegmentProgress'

/**
 * Column definitions for the test results table with suite hierarchy support.
 * Uses TreeNode type to handle both suite and test rows.
 */
export const createColumns = (
  onSelectTest: (id: string) => void
): ColumnDef<TreeNode>[] => [
  {
    id: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const canExpand = row.getCanExpand()
      const isExpanded = row.getIsExpanded()
      const isSuite = row.original.type === 'suite'

      return (
        <div
          className="flex items-center"
          style={{ paddingLeft: `${row.depth * 1.5}rem` }}
        >
          {/* Expand/collapse button for suites */}
          {canExpand ? (
            <button
              onClick={(e) => {
                e.stopPropagation()
                row.toggleExpanded()
              }}
              className="mr-2 p-1 hover:bg-accent rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          ) : (
            <span className="mr-2 w-6" />
          )}

          {/* Icon for row type */}
          {isSuite ? (
            <FolderOpen className="h-4 w-4 mr-2 text-muted-foreground" />
          ) : (
            <File className="h-4 w-4 mr-2 text-muted-foreground" />
          )}

          {/* Name */}
          <span className={isSuite ? 'font-medium' : ''}>
            {isSuite ? row.original.suiteTitle : row.original.testData?.title}
          </span>

          {/* Test count badge for suites */}
          {isSuite && (
            <span className="ml-2 text-xs text-muted-foreground">
              ({row.original.totalTests} test{row.original.totalTests !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      )
    },
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
      // Suites don't have status column (progress bar in Plan 02)
      if (row.original.type === 'suite') return null

      const status = row.original.testData?.execution.status
      if (!status) return null

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
    id: 'progress',
    header: 'Progress',
    cell: ({ row }) => {
      // Only show progress for suite rows
      if (row.original.type !== 'suite') return null

      const {
        totalTests = 0,
        passedCount = 0,
        failedCount = 0,
        skippedCount = 0,
        brokenCount = 0,
        totalDuration = 0,
      } = row.original

      // Handle empty suite
      if (totalTests === 0) {
        return <span className="text-xs text-muted-foreground">No tests</span>
      }

      // Calculate cumulative percentages
      // Order: passed -> failed -> skipped -> broken
      const passedPct = (passedCount / totalTests) * 100
      const failedPct = passedPct + (failedCount / totalTests) * 100
      const skippedPct = failedPct + (skippedCount / totalTests) * 100
      const brokenPct = skippedPct + (brokenCount / totalTests) * 100

      const segments: ProgressSegment[] = [
        {
          value: passedPct,
          color: 'bg-green-500',
          label: `Passed: ${passedCount}`,
          count: passedCount,
        },
        {
          value: failedPct,
          color: 'bg-red-500',
          label: `Failed: ${failedCount}`,
          count: failedCount,
        },
        {
          value: skippedPct,
          color: 'bg-yellow-500',
          label: `Skipped: ${skippedCount}`,
          count: skippedCount,
        },
        {
          value: brokenPct,
          color: 'bg-gray-500',
          label: `Broken: ${brokenCount}`,
          count: brokenCount,
        },
      ]

      return (
        <div className="w-32">
          <MultiSegmentProgress segments={segments} duration={totalDuration} />
        </div>
      )
    },
    size: 150,
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
      const duration = row.original.type === 'suite'
        ? row.original.totalDuration
        : row.original.testData?.execution.duration

      if (!duration) return null

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
      // No actions for suites
      if (row.original.type === 'suite') return null

      const test = row.original.testData
      if (!test) return null

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
