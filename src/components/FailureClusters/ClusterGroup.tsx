import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react'
import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { TestListItem } from '../TestList/TestListItem'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface ClusterGroupProps {
  errorPattern: string
  tests: QaseTestResult[]
  isExpanded: boolean
  onToggle: () => void
  onSelectTest: (id: string) => void
}

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
    : errorPattern.length > 80
      ? errorPattern.slice(0, 80) + '...'
      : errorPattern

  return (
    <>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-3 mb-1 rounded bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <div className="min-w-[36px]">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-mono">
            {displayPattern}
          </p>
          <p className="text-xs opacity-80">
            {tests.length} test{tests.length !== 1 ? 's' : ''} affected
          </p>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5" />
        ) : (
          <ChevronDown className="h-5 w-5" />
        )}
      </button>
      {isExpanded && (
        <div
          id={contentId}
          className={prefersReducedMotion ? '' : 'transition-all duration-300'}
        >
          <div className="pl-4 py-2">
            {tests.map(test => (
              <TestListItem
                key={test.id}
                test={test}
                onSelect={onSelectTest}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )
})
