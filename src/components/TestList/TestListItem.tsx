import { observer } from 'mobx-react-lite'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { getStatusIcon } from './statusIcon'
import { useRootStore } from '../../store'
import { StabilityBadge } from './StabilityBadge'
import { cn } from '../../lib/utils'
import type { StabilityGrade } from '../../types/stability'

interface TestListItemProps {
  test: QaseTestResult
  onSelect: (id: string) => void
}

const getGradeClass = (grade: StabilityGrade): string => {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'bg-green-500/10 text-green-500 border-green-500/20'
    case 'B':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    case 'C':
    case 'D':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
    case 'F':
      return 'bg-red-500/10 text-red-500 border-red-500/20'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export const TestListItem = observer(({ test, onSelect }: TestListItemProps) => {
  const handleClick = () => onSelect(test.id)
  const { analyticsStore } = useRootStore()

  // Format duration: if > 1000ms show as seconds
  const duration = test.execution.duration
  const durationText = duration >= 1000
    ? `${(duration / 1000).toFixed(1)}s`
    : `${duration}ms`

  // Get flakiness result if test has signature
  const flakinessResult = test.signature
    ? analyticsStore.getFlakinessScore(test.signature)
    : null

  // Get stability score if test has signature
  const stabilityResult = test.signature
    ? analyticsStore.getStabilityScore(test.signature)
    : null

  return (
    <button
      onClick={handleClick}
      className="w-full flex items-center px-4 py-3 hover:bg-accent transition-all hover:translate-x-1 text-left"
    >
      <div className="flex-shrink-0 mr-3">
        {getStatusIcon(test.execution.status)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{test.title}</div>
        <div className="text-xs text-muted-foreground">{durationText}</div>
      </div>
      {stabilityResult && stabilityResult.grade !== 'N/A' && (
        <span
          title={`Score: ${Math.round(stabilityResult.score)} (Pass: ${Math.round(stabilityResult.passRate)}%, Flaky: ${Math.round(stabilityResult.flakinessPercent)}%, CV: ${Math.round(stabilityResult.durationCV)}%)`}
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ml-2',
            getGradeClass(stabilityResult.grade)
          )}
        >
          {stabilityResult.grade}
        </span>
      )}
      {flakinessResult && <StabilityBadge result={flakinessResult} />}
    </button>
  )
})
