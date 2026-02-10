import { Box, Chip, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import type { StabilityGrade } from '../../types/stability'

const statuses = [
  { value: 'passed', label: 'Passed', color: 'success' as const },
  { value: 'failed', label: 'Failed', color: 'error' as const },
  { value: 'broken', label: 'Broken', color: 'warning' as const },
  { value: 'skipped', label: 'Skipped', color: 'default' as const },
]

const gradeOptions: {
  value: StabilityGrade
  color: 'success' | 'info' | 'warning' | 'error'
}[] = [
  { value: 'A+', color: 'success' },
  { value: 'A', color: 'success' },
  { value: 'B', color: 'info' },
  { value: 'C', color: 'warning' },
  { value: 'D', color: 'warning' },
  { value: 'F', color: 'error' },
]

export const SidebarFilters = observer(() => {
  const { testResultsStore } = useRootStore()
  const {
    statusFilters,
    toggleStatusFilter,
    stabilityGradeFilters,
    toggleStabilityGradeFilter,
  } = testResultsStore

  return (
    <Box sx={{ px: 2, py: 1 }}>
      {/* Status Filter Section */}
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          gutterBottom
          sx={{ display: 'block' }}
        >
          Status
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
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
      </Box>

      {/* Grade Filter Section */}
      <Box sx={{ mt: 1.5 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          gutterBottom
          sx={{ display: 'block' }}
        >
          Grade
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {gradeOptions.map((option) => (
            <Chip
              key={option.value}
              label={option.value}
              color={option.color}
              variant={
                stabilityGradeFilters.has(option.value) ? 'filled' : 'outlined'
              }
              onClick={() => toggleStabilityGradeFilter(option.value)}
              size="small"
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
})
