import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { cn } from '../../lib/utils'

const statuses = [
  { value: 'passed', label: 'Passed', activeClass: 'bg-green-500 text-white border-green-500' },
  { value: 'failed', label: 'Failed', activeClass: 'bg-red-500 text-white border-red-500' },
  { value: 'broken', label: 'Broken', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 'skipped', label: 'Skipped', activeClass: 'bg-muted text-muted-foreground border-muted' },
  { value: 'blocked', label: 'Blocked', activeClass: 'bg-blue-500 text-white border-blue-500' },
  { value: 'invalid', label: 'Invalid', activeClass: 'bg-orange-500 text-white border-orange-500' },
  { value: 'muted', label: 'Muted', activeClass: 'bg-purple-500 text-white border-purple-500' },
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
