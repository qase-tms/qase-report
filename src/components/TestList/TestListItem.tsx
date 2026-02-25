import { observer } from 'mobx-react-lite'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { Badge } from '../ui/badge'
import { useRootStore } from '../../store'
import { StabilityBadge } from './StabilityBadge'

interface TestListItemProps {
  test: QaseTestResult
  onSelect: (id: string) => void
}

const gradeStyles: Record<string, { color: string; bg: string; border: string }> = {
  'A+': { color: 'var(--text-white)', bg: 'var(--grade-excellent-fg)', border: 'var(--grade-excellent-fg)' },
  'A': { color: 'var(--text-white)', bg: 'var(--grade-good-fg)', border: 'var(--grade-good-fg)' },
  'B': { color: 'var(--text-white)', bg: 'var(--grade-fair-fg)', border: 'var(--grade-fair-fg)' },
  'C': { color: 'var(--text-black)', bg: 'var(--grade-warning-fg)', border: 'var(--grade-warning-fg)' },
  'D': { color: 'var(--text-white)', bg: 'var(--grade-poor-fg)', border: 'var(--grade-poor-fg)' },
  'F': { color: 'var(--text-white)', bg: 'var(--grade-critical-fg)', border: 'var(--grade-critical-fg)' },
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
      <Badge variant={test.execution.status} className="capitalize shrink-0 mr-3">
        {test.execution.status}
      </Badge>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{test.title}</div>
        {Object.keys(test.params).length > 0 && (
          <div className="text-xs text-muted-foreground truncate">
            {Object.entries(test.params)
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')}
          </div>
        )}
        <div className="text-xs text-muted-foreground">{durationText}</div>
      </div>
      {stabilityResult && stabilityResult.grade !== 'N/A' && (() => {
        const gs = gradeStyles[stabilityResult.grade]
        return gs ? (
          <span
            title={`Score: ${Math.round(stabilityResult.score)} (Pass: ${Math.round(stabilityResult.passRate)}%, Flaky: ${Math.round(stabilityResult.flakinessPercent)}%, CV: ${Math.round(stabilityResult.durationCV)}%)`}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ml-2"
            style={{ color: gs.color, backgroundColor: gs.bg, borderColor: gs.border }}
          >
            {stabilityResult.grade}
          </span>
        ) : null
      })()}
      {flakinessResult && <StabilityBadge result={flakinessResult} />}
    </button>
  )
})
