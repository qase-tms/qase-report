import { CheckCircle, RefreshCw, AlertCircle } from 'lucide-react'
import { cn } from '../../lib/utils'
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
      colorClass: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      icon: <RefreshCw className="h-3 w-3" />,
      label: 'Flaky',
      tooltip: `Flaky in ${result.statusChanges} of ${result.totalRuns} runs (${result.flakinessPercent}%)`,
    },
    stable: {
      colorClass: 'bg-green-500/10 text-green-500 border-green-500/20',
      icon: <CheckCircle className="h-3 w-3" />,
      label: 'Stable',
      tooltip: `Stable across ${result.totalRuns} runs`,
    },
    new_failure: {
      colorClass: 'bg-red-500/10 text-red-500 border-red-500/20',
      icon: <AlertCircle className="h-3 w-3" />,
      label: 'New Failure',
      tooltip: `Started failing after ${result.totalRuns - 1} stable runs`,
    },
  }

  const config = badgeConfig[result.status]

  return (
    <span
      title={config.tooltip}
      className={cn(
        'inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-xs font-medium border',
        config.colorClass
      )}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
