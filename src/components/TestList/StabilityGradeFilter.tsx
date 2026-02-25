import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { cn } from '../../lib/utils'
import type { StabilityGrade } from '../../types/stability'

const gradeOptions: { value: StabilityGrade; activeClass: string }[] = [
  { value: 'A+', activeClass: 'bg-passed text-white border-passed' },
  { value: 'A', activeClass: 'bg-passed text-white border-passed' },
  { value: 'B', activeClass: 'bg-brand text-white border-brand' },
  { value: 'C', activeClass: 'bg-broken text-text-black border-broken' },
  { value: 'D', activeClass: 'bg-broken text-text-black border-broken' },
  { value: 'F', activeClass: 'bg-failed text-white border-failed' },
]

export const StabilityGradeFilter = observer(() => {
  const { testResultsStore } = useRootStore()
  const { stabilityGradeFilters, toggleStabilityGradeFilter } = testResultsStore

  return (
    <div className="flex gap-2 items-center">
      <span className="text-sm text-muted-foreground">
        Grade:
      </span>
      {gradeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => toggleStabilityGradeFilter(option.value)}
          className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
            stabilityGradeFilters.has(option.value)
              ? option.activeClass
              : 'bg-transparent text-foreground border-border hover:bg-accent'
          )}
        >
          {option.value}
        </button>
      ))}
    </div>
  )
})
