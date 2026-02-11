import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { cn } from '../../lib/utils'
import type { StabilityGrade } from '../../types/stability'

const gradeOptions: { value: StabilityGrade; activeClass: string }[] = [
  { value: 'A+', activeClass: 'bg-green-500 text-white border-green-500' },
  { value: 'A', activeClass: 'bg-green-500 text-white border-green-500' },
  { value: 'B', activeClass: 'bg-blue-500 text-white border-blue-500' },
  { value: 'C', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 'D', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
  { value: 'F', activeClass: 'bg-red-500 text-white border-red-500' },
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
