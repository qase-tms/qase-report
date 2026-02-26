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
  const blocked = node.blockedCount || 0
  const invalid = node.invalidCount || 0
  const muted = node.mutedCount || 0

  const segments: ProgressSegment[] = []
  let cumulative = 0

  if (passed > 0) {
    cumulative += (passed / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-passed',
      label: `Passed: ${passed}`,
      count: passed,
    })
  }
  if (failed > 0) {
    cumulative += (failed / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-failed',
      label: `Failed: ${failed}`,
      count: failed,
    })
  }
  if (broken > 0) {
    cumulative += (broken / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-broken',
      label: `Broken: ${broken}`,
      count: broken,
    })
  }
  if (skipped > 0) {
    cumulative += (skipped / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-skipped',
      label: `Skipped: ${skipped}`,
      count: skipped,
    })
  }
  if (blocked > 0) {
    cumulative += (blocked / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-blocked',
      label: `Blocked: ${blocked}`,
      count: blocked,
    })
  }
  if (invalid > 0) {
    cumulative += (invalid / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-invalid',
      label: `Invalid: ${invalid}`,
      count: invalid,
    })
  }
  if (muted > 0) {
    cumulative += (muted / total) * 100
    segments.push({
      value: cumulative,
      color: 'bg-muted-status',
      label: `Muted: ${muted}`,
      count: muted,
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
 */
export const createColumns = (
  onSelectTest: (id: string) => void
): ColumnDef<TreeNode>[] => [
  // Column 1: ID (testops_id or "-")
  {
    id: 'id',
    header: () => <span className="pl-8">ID</span>,
    cell: ({ row }) => {
      if (row.original.type === 'header') {
        return <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider pl-8">ID</span>
      }

      if (row.original.type === 'suite') {
        // Suite: expand button + folder icon + name
        const canExpand = row.getCanExpand()
        const isExpanded = row.getIsExpanded()
        return (
          <div
            className="flex items-center"
            style={{ paddingLeft: `${row.depth * 1}rem` }}
          >
            {canExpand ? (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  row.toggleExpanded()
                }}
                className="mr-1 p-0.5 hover:bg-accent rounded shrink-0"
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
            <Folder className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
            <span className="font-medium">{row.original.suiteTitle}</span>
          </div>
        )
      }

      // Test: testops_id or "-" - aligned with header
      const testopsId = row.original.testData?.testops_ids?.[0]
      return (
        <span className="text-muted-foreground pl-8">
          {testopsId || '-'}
        </span>
      )
    },
    size: 90,
  },
  // Column 2: Status
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      if (row.original.type === 'header') {
        return <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Status</span>
      }
      if (row.original.type === 'suite') return null

      const status = row.original.testData?.execution.status
      if (!status) return null

      return <Badge variant={status} className="capitalize">{status}</Badge>
    },
    size: 80,
  },
  // Column 3: Title (flexible width)
  {
    id: 'title',
    header: 'Title',
    cell: ({ row }) => {
      if (row.original.type === 'header') {
        return <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Title</span>
      }
      if (row.original.type === 'suite') return null

      const params = row.original.testData?.params
      const hasParams = params && Object.keys(params).length > 0
      if (!hasParams) {
        return <span className="truncate">{row.original.testData?.title}</span>
      }
      const paramsText = Object.entries(params)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
      return (
        <div className="min-w-0">
          <span className="truncate block">{row.original.testData?.title}</span>
          <span className="truncate block text-xs text-muted-foreground">{paramsText}</span>
        </div>
      )
    },
  },
  // Column 4: Duration (right-aligned)
  {
    id: 'duration',
    header: () => <div className="text-right">Duration</div>,
    cell: ({ row }) => {
      if (row.original.type === 'header') {
        return <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider text-right">Duration</div>
      }

      if (row.original.type === 'suite') {
        // Suite: duration + progress bar
        const duration = row.original.totalDuration || 0
        return (
          <div className="flex items-center justify-end gap-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="text-xs w-12 text-right">{formatDuration(duration)}</span>
            </div>
            <MultiSegmentProgress
              segments={buildProgressSegments(row.original)}
              duration={duration}
              thin
              showDurationInTooltip={false}
              className="w-24"
            />
          </div>
        )
      }

      // Test: show duration (right-aligned, fixed width for alignment)
      const duration = row.original.testData?.execution.duration
      if (duration === undefined || duration === null) return null

      return (
        <div className="flex items-center justify-end gap-1 text-muted-foreground">
          <Clock className="h-3 w-3 flex-shrink-0" />
          <span className="text-xs w-12 text-right">{formatDuration(duration)}</span>
        </div>
      )
    },
    size: 180,
  },
]
