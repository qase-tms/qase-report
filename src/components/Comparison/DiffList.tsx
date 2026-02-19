import { useState, useCallback } from 'react'
import {
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Plus,
  Minus,
  Gauge,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import type { ComparisonResult, StatusChange, DurationChange } from '../../types/comparison'
import { useRootStore } from '../../store'

interface DiffListProps {
  comparison: ComparisonResult
}

type DiffSection = 'regressions' | 'fixed' | 'added' | 'removed' | 'duration'

export const DiffList = ({ comparison }: DiffListProps) => {
  const { selectTest, testResultsStore } = useRootStore()
  const [expanded, setExpanded] = useState<Set<DiffSection>>(new Set(['regressions']))

  const toggleSection = useCallback((section: DiffSection) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }, [])

  const handleTestClick = useCallback((signature: string) => {
    // Find test ID by signature in current results
    const test = testResultsStore.resultsList.find(t => t.signature === signature)
    if (test) {
      selectTest(test.id)
    }
  }, [selectTest, testResultsStore.resultsList])

  const { diff } = comparison
  const regressions = diff.statusChanged.filter(c => c.changeType === 'regression')
  const fixed = diff.statusChanged.filter(c => c.changeType === 'fixed')

  const renderStatusChangeItem = (item: StatusChange) => (
    <button
      key={item.signature}
      onClick={() => handleTestClick(item.signature)}
      className="w-full p-3 pl-8 text-left hover:bg-accent transition-colors"
    >
      <p className="text-sm">{item.title}</p>
      <p className="text-xs text-muted-foreground">
        {item.oldStatus} → {item.newStatus}
      </p>
    </button>
  )

  const renderDurationItem = (item: DurationChange) => {
    const isFaster = item.difference < 0
    return (
      <button
        key={item.signature}
        onClick={() => handleTestClick(item.signature)}
        className="w-full flex items-start gap-2 p-3 pl-8 text-left hover:bg-accent transition-colors"
      >
        <div className="mt-0.5">
          {isFaster ? (
            <ArrowDown className="h-4 w-4 text-passed" />
          ) : (
            <ArrowUp className="h-4 w-4 text-destructive" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.oldDuration}ms → {item.newDuration}ms ({item.percentChange > 0 ? '+' : ''}{Math.round(item.percentChange)}%)
          </p>
        </div>
      </button>
    )
  }

  const renderAddedRemovedItem = (item: typeof diff.added[0]) => (
    <button
      key={item.signature}
      onClick={() => handleTestClick(item.signature)}
      className="w-full p-3 pl-8 text-left hover:bg-accent transition-colors"
    >
      <p className="text-sm">{item.title}</p>
      <p className="text-xs text-muted-foreground">
        {item.status} ({item.duration}ms)
      </p>
    </button>
  )

  const sections = [
    {
      id: 'regressions' as const,
      label: 'Regressions',
      icon: <AlertCircle className="h-5 w-5 text-destructive" />,
      count: regressions.length,
      items: regressions,
      render: renderStatusChangeItem,
    },
    {
      id: 'fixed' as const,
      label: 'Fixed',
      icon: <CheckCircle className="h-5 w-5 text-passed" />,
      count: fixed.length,
      items: fixed,
      render: renderStatusChangeItem,
    },
    {
      id: 'added' as const,
      label: 'Added Tests',
      icon: <Plus className="h-5 w-5 text-blocked" />,
      count: diff.added.length,
      items: diff.added,
      render: renderAddedRemovedItem,
    },
    {
      id: 'removed' as const,
      label: 'Removed Tests',
      icon: <Minus className="h-5 w-5 text-broken" />,
      count: diff.removed.length,
      items: diff.removed,
      render: renderAddedRemovedItem,
    },
    {
      id: 'duration' as const,
      label: 'Duration Changes',
      icon: <Gauge className="h-5 w-5" />,
      count: diff.durationChanged.length,
      items: diff.durationChanged,
      render: renderDurationItem,
    },
  ]

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div>
        {sections.map(section => {
          if (section.count === 0) return null

          return (
            <div key={section.id}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-accent transition-colors"
              >
                <div className="min-w-[20px]">{section.icon}</div>
                <p className="flex-1 text-left text-sm font-medium">{section.label}</p>
                <span className="px-2 py-1 rounded text-xs bg-secondary text-secondary-foreground">
                  {section.count}
                </span>
                {expanded.has(section.id) ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              {expanded.has(section.id) && (
                <div className="border-t">
                  {section.items.map((item: any) => section.render(item))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {sections.every(s => s.count === 0) && (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No differences found between selected runs.
          </p>
        </div>
      )}
    </div>
  )
}
