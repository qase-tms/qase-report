import { CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'
import type { FlakinessResult } from '../../types/flakiness'

interface StabilityBadgeProps {
  result: FlakinessResult
}

export const StabilityBadge = ({ result }: StabilityBadgeProps) => {
  // Hide badge when insufficient data (< 5 runs)
  if (result.status === 'insufficient_data') {
    return null
  }

  // Badge configuration by status
  const badgeConfig = {
    flaky: {
      style: { color: 'var(--grade-warning-bg)', backgroundColor: 'var(--grade-warning-fill)', borderColor: 'var(--grade-warning-fill)' },
      icon: <RefreshCw className="h-3 w-3" />,
      label: 'Flaky',
      tooltip: `Flaky in ${result.statusChanges} of ${result.totalRuns} runs (${result.flakinessPercent}%)`,
    },
    stable: {
      style: { color: 'var(--grade-excellent-bg)', backgroundColor: 'var(--grade-excellent-fill)', borderColor: 'var(--grade-excellent-fill)' },
      icon: <CheckCircle className="h-3 w-3" />,
      label: 'Stable',
      tooltip: `Stable across ${result.totalRuns} runs`,
    },
    new_failure: {
      style: { color: 'var(--grade-critical-bg)', backgroundColor: 'var(--grade-critical-fill)', borderColor: 'var(--grade-critical-fill)' },
      icon: <AlertCircle className="h-3 w-3" />,
      label: 'New Failure',
      tooltip: `Started failing after ${result.totalRuns - 1} stable runs`,
    },
  }

  const config = badgeConfig[result.status]

  return (
    <span
      title={config.tooltip}
      className="inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-xs font-medium border"
      style={config.style}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
