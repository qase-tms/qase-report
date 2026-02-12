import { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight, Settings, Clock } from 'lucide-react'
import type { TreeNode } from './buildSuiteTree'
import { Badge } from '../ui/badge'

/**
 * Column definitions for the test results table with suite hierarchy support.
 * Uses TreeNode type to handle both suite and test rows.
 */
export const createColumns = (
  onSelectTest: (id: string) => void
): ColumnDef<TreeNode>[] => [
  {
    id: 'id',
    header: 'ID',
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

          {/* Gear icon */}
          <Settings className="h-4 w-4 mr-2 text-muted-foreground" />

          {/* ID or Suite Title */}
          {isSuite ? (
            <span className="font-medium">{row.original.suiteTitle}</span>
          ) : (
            <span>
              {row.original.testData?.testops_ids?.[0] || row.original.testData?.id.substring(0, 8)}
            </span>
          )}
        </div>
      )
    },
    size: 150,
  },
  {
    accessorKey: 'execution.status',
    header: 'Status',
    cell: ({ row }) => {
      const isSuite = row.original.type === 'suite'

      // Suite header label
      if (isSuite) {
        return <span className="text-xs text-muted-foreground uppercase tracking-wide">Status</span>
      }

      // Test status badge
      const status = row.original.testData?.execution.status
      if (!status) return null

      return <Badge variant={status} className="capitalize">{status}</Badge>
    },
    size: 100,
  },
  {
    id: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const isSuite = row.original.type === 'suite'

      if (isSuite) {
        const testCount = row.original.totalTests || 0
        return (
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Title ({testCount} test{testCount !== 1 ? 's' : ''})
          </span>
        )
      }

      return <span>{row.original.testData?.title}</span>
    },
  },
  {
    accessorKey: 'execution.duration',
    header: 'Duration',
    cell: ({ row }) => {
      const isSuite = row.original.type === 'suite'

      // Suite header label with clock icon
      if (isSuite) {
        return (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Duration</span>
          </div>
        )
      }

      // Test duration with clock icon
      const duration = row.original.testData?.execution.duration
      if (!duration) return null

      const durationText =
        duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`

      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{durationText}</span>
        </div>
      )
    },
    size: 120,
  },
]
