import { ColumnDef } from '@tanstack/react-table'
import { ChevronDown, ChevronRight, Clock, Folder } from 'lucide-react'
import type { TreeNode } from './buildSuiteTree'
import { Badge } from '../ui/badge'
import { MultiSegmentProgress, ProgressSegment } from './MultiSegmentProgress'

/**
 * Build progress segments from suite test counts
 */
function buildProgressSegments(node: TreeNode): ProgressSegment[] {
  const total = node.totalTests || 0
  if (total === 0) return []

  const passed = node.passedCount || 0
  const failed = node.failedCount || 0
  const skipped = node.skippedCount || 0
  const broken = node.brokenCount || 0

  const segments: ProgressSegment[] = []
  let cumulative = 0

  if (passed > 0) {
    cumulative += (passed / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-green-500',
      label: `Passed: ${passed}`,
      count: passed,
    })
  }
  if (failed > 0) {
    cumulative += (failed / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-red-500',
      label: `Failed: ${failed}`,
      count: failed,
    })
  }
  if (skipped > 0) {
    cumulative += (skipped / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-yellow-500',
      label: `Skipped: ${skipped}`,
      count: skipped,
    })
  }
  if (broken > 0) {
    cumulative += (broken / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-gray-500',
      label: `Broken: ${broken}`,
      count: broken,
    })
  }

  return segments
}

/**
 * Format duration for display
 */
const formatDuration = (ms: number): string => {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

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

      if (isSuite) {
        // Suite row: expand + folder + title (compact, single line)
        return (
          <div
            className="flex items-center"
            style={{ paddingLeft: `${row.depth * 1.5}rem` }}
          >
            {/* Expand button */}
            {canExpand ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  row.toggleExpanded()
                }}
                className="mr-1 p-0.5 hover:bg-accent rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="mr-1 w-5" />
            )}

            {/* Folder icon for suite */}
            <Folder className="h-4 w-4 mr-2 text-muted-foreground" />

            {/* Suite title */}
            <span className="font-medium">{row.original.suiteTitle}</span>
          </div>
        )
      }

      // Test row: show testops ID only (no icon), or empty
      const testopsId = row.original.testData?.testops_ids?.[0]
      return (
        <div
          className="flex items-center"
          style={{ paddingLeft: `${row.depth * 1.5}rem` }}
        >
          <span className="mr-1 w-5" />
          {testopsId && (
            <span className="text-xs text-muted-foreground">{testopsId}</span>
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

      // Suite rows show empty content
      if (isSuite) {
        return null
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

      // Suite rows show empty content (title is in ID column)
      if (isSuite) {
        return null
      }

      return <span>{row.original.testData?.title}</span>
    },
  },
  {
    accessorKey: 'execution.duration',
    header: 'Duration',
    cell: ({ row }) => {
      const isSuite = row.original.type === 'suite'

      // Suite rows show duration
      if (isSuite) {
        const duration = row.original.totalDuration || 0
        return (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{formatDuration(duration)}</span>
          </div>
        )
      }

      // Test duration with clock icon
      const duration = row.original.testData?.execution.duration
      if (!duration) return null

      return (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs">{formatDuration(duration)}</span>
        </div>
      )
    },
    size: 80,
  },
  {
    id: 'progress',
    header: '',
    cell: ({ row }) => {
      const isSuite = row.original.type === 'suite'

      // Only suites show progress bar
      if (!isSuite) {
        return null
      }

      return (
        <MultiSegmentProgress
          segments={buildProgressSegments(row.original)}
          duration={row.original.totalDuration || 0}
          thin
          showDurationInTooltip={false}
          className="w-32"
        />
      )
    },
    size: 140,
  },
]
