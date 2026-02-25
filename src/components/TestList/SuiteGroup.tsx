import { ChevronDown, ChevronRight } from 'lucide-react'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { TestListItem } from './TestListItem'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { cn } from '../../lib/utils'

interface SuiteGroupProps {
  suiteTitle: string
  tests: QaseTestResult[]
  onSelectTest: (id: string) => void
  isExpanded: boolean
  onToggle: () => void
}

export const SuiteGroup = ({
  suiteTitle,
  tests,
  onSelectTest,
  isExpanded,
  onToggle,
}: SuiteGroupProps) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const contentId = `suite-${encodeURIComponent(suiteTitle)}-content`

  return (
    <>
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={contentId}
        className="w-full flex items-center justify-between px-4 py-3 bg-accent/50 hover:bg-accent transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{suiteTitle}</div>
          <div className="text-xs text-muted-foreground">
            {tests.length} test{tests.length !== 1 ? 's' : ''}
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 flex-shrink-0 ml-2" />
        ) : (
          <ChevronRight className="h-5 w-5 flex-shrink-0 ml-2" />
        )}
      </button>
      <div
        id={contentId}
        className={cn(
          'overflow-hidden',
          prefersReducedMotion ? '' : 'transition-all duration-300',
          isExpanded ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="pl-4">
          {tests.map((test) => (
            <TestListItem
              key={test.id}
              test={test}
              onSelect={onSelectTest}
            />
          ))}
        </div>
      </div>
    </>
  )
}
