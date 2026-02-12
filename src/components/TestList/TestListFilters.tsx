import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { cn } from '../../lib/utils'

const statuses = [
  { value: 'passed', label: 'Passed', activeClass: 'bg-passed text-white border-passed' },
  { value: 'failed', label: 'Failed', activeClass: 'bg-failed text-white border-failed' },
  { value: 'broken', label: 'Broken', activeClass: 'bg-broken text-white border-broken' },
  { value: 'skipped', label: 'Skipped', activeClass: 'bg-skipped text-white border-skipped' },
  { value: 'blocked', label: 'Blocked', activeClass: 'bg-brand text-white border-brand' },
  { value: 'invalid', label: 'Invalid', activeClass: 'bg-warning text-white border-warning' },
  { value: 'muted', label: 'Muted', activeClass: 'bg-[var(--palette-charcoal-50)] text-white border-[var(--palette-charcoal-50)]' },
]

export const TestListFilters = observer(() => {
  const { testResultsStore } = useRootStore()
  const { statusFilters, toggleStatusFilter } = testResultsStore

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Status filters */}
      {statuses.map((status) => (
        <button
          key={status.value}
          onClick={() => toggleStatusFilter(status.value)}
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
            statusFilters.has(status.value)
              ? status.activeClass
              : 'bg-transparent text-foreground border-border hover:bg-accent'
          )}
        >
          {status.label}
        </button>
      ))}
    </div>
  )
})
