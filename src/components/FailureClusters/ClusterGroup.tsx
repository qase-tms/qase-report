import { ChevronDown, ChevronRight, AlertCircle, ExternalLink } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { cn } from '../../lib/utils'

interface ClusterGroupProps {
  errorPattern: string
  tests: QaseTestResult[]
  isExpanded: boolean
  onToggle: () => void
  onSelectTest: (id: string) => void
}

/**
 * Format duration to human readable
 */
const formatDuration = (ms: number): string => {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`
  return `${ms}ms`
}

/**
 * Compact test item for cluster list
 */
const CompactTestItem = ({
  test,
  onSelect,
}: {
  test: QaseTestResult
  onSelect: (id: string) => void
}) => (
  <button
    onClick={() => onSelect(test.id)}
    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-accent/50 transition-colors text-left group rounded"
  >
    <span className="text-sm truncate flex-1">{test.title}</span>
    <span className="text-xs text-muted-foreground shrink-0">
      {formatDuration(test.execution.duration)}
    </span>
    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
  </button>
)

export const ClusterGroup = observer(({
  errorPattern,
  tests,
  isExpanded,
  onToggle,
  onSelectTest,
}: ClusterGroupProps) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const contentId = `cluster-${encodeURIComponent(errorPattern.slice(0, 20))}-content`

  // Display-friendly error pattern (truncate if too long)
  const displayPattern = errorPattern === '__no_error__'
    ? 'No error message'
    : errorPattern.length > 100
      ? errorPattern.slice(0, 100) + '...'
      : errorPattern

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted/50 transition-colors text-left"
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-mono truncate" title={errorPattern}>
            {displayPattern}
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive shrink-0">
          {tests.length} test{tests.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div
          id={contentId}
          className={cn(
            'border-t bg-muted/20',
            prefersReducedMotion ? '' : 'animate-in slide-in-from-top-2 duration-200'
          )}
        >
          <div className="py-1">
            {tests.map(test => (
              <CompactTestItem
                key={test.id}
                test={test}
                onSelect={onSelectTest}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
})
