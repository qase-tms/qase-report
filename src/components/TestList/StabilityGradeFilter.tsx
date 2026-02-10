import { Box, Chip, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import type { StabilityGrade } from '../../types/stability'

const gradeOptions: { value: StabilityGrade; color: 'success' | 'info' | 'warning' | 'error' | 'default' }[] = [
  { value: 'A+', color: 'success' },
  { value: 'A', color: 'success' },
  { value: 'B', color: 'info' },
  { value: 'C', color: 'warning' },
  { value: 'D', color: 'warning' },
  { value: 'F', color: 'error' },
]

export const StabilityGradeFilter = observer(() => {
  const { testResultsStore } = useRootStore()
  const { stabilityGradeFilters, toggleStabilityGradeFilter } = testResultsStore

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        Grade:
      </Typography>
      {gradeOptions.map((option) => (
        <Chip
          key={option.value}
          label={option.value}
          color={option.color}
          variant={stabilityGradeFilters.has(option.value) ? 'filled' : 'outlined'}
          onClick={() => toggleStabilityGradeFilter(option.value)}
          size="small"
        />
      ))}
    </Box>
  )
})
