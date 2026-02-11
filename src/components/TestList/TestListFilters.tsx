import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { StabilityGradeFilter } from './StabilityGradeFilter'
import { cn } from '../../lib/utils'

const statuses = [
  { value: 'passed', label: 'Passed', activeClass: 'bg-green-500 text-white border-green-500' },
  { value: 'failed', label: 'Failed', activeClass: 'bg-red-500 text-white border-red-500' },
  { value: 'broken', label: 'Broken', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 'skipped', label: 'Skipped', activeClass: 'bg-muted text-muted-foreground border-muted' },
]

export const TestListFilters = observer(() => {
  const { testResultsStore } = useRootStore()
  const { statusFilters, toggleStatusFilter } = testResultsStore

  return (
    <div className="flex flex-col gap-4">
      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Grade filters */}
      <StabilityGradeFilter />
    </div>
  )
})
