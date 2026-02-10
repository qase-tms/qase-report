import { Box, Chip } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { StabilityGradeFilter } from './StabilityGradeFilter'

const statuses = [
  { value: 'passed', label: 'Passed', color: 'success' as const },
  { value: 'failed', label: 'Failed', color: 'error' as const },
  { value: 'broken', label: 'Broken', color: 'warning' as const },
  { value: 'skipped', label: 'Skipped', color: 'default' as const },
]

export const TestListFilters = observer(() => {
  const { testResultsStore } = useRootStore()
  const { statusFilters, toggleStatusFilter } = testResultsStore

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Status filters */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {statuses.map((status) => (
          <Chip
            key={status.value}
            label={status.label}
            color={status.color}
            variant={statusFilters.has(status.value) ? 'filled' : 'outlined'}
            onClick={() => toggleStatusFilter(status.value)}
            size="small"
          />
        ))}
      </Box>

      {/* Grade filters */}
      <StabilityGradeFilter />
    </Box>
  )
})
