import { Chip, Tooltip } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LoopIcon from '@mui/icons-material/Loop'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
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
      color: 'warning' as const,
      icon: <LoopIcon />,
      label: 'Flaky',
      tooltip: `Flaky in ${result.statusChanges} of ${result.totalRuns} runs (${result.flakinessPercent}%)`,
    },
    stable: {
      color: 'success' as const,
      icon: <CheckCircleIcon />,
      label: 'Stable',
      tooltip: `Stable across ${result.totalRuns} runs`,
    },
    new_failure: {
      color: 'error' as const,
      icon: <NewReleasesIcon />,
      label: 'New Failure',
      tooltip: `Started failing after ${result.totalRuns - 1} stable runs`,
    },
  }

  const config = badgeConfig[result.status]

  return (
    <Tooltip title={config.tooltip} arrow>
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        sx={{ ml: 1, height: 20 }}
      />
    </Tooltip>
  )
}
