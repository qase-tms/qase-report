import { Box, Paper, Typography, Chip } from '@mui/material'
import {
  TrendingUp as RegressionIcon,
  TrendingDown as FixedIcon,
  Add as AddedIcon,
  Remove as RemovedIcon,
  Speed as DurationIcon,
} from '@mui/icons-material'
import type { ComparisonResult } from '../../types/comparison'

interface ComparisonSummaryProps {
  comparison: ComparisonResult
}

export const ComparisonSummary = ({ comparison }: ComparisonSummaryProps) => {
  const { summary, baseRun, compareRun } = comparison

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Comparing {formatDate(baseRun.start_time)} to {formatDate(compareRun.start_time)}
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {summary.regressionCount > 0 && (
          <Chip
            icon={<RegressionIcon />}
            label={`${summary.regressionCount} regression${summary.regressionCount !== 1 ? 's' : ''}`}
            color="error"
            size="small"
          />
        )}
        {summary.fixedCount > 0 && (
          <Chip
            icon={<FixedIcon />}
            label={`${summary.fixedCount} fixed`}
            color="success"
            size="small"
          />
        )}
        {summary.addedCount > 0 && (
          <Chip
            icon={<AddedIcon />}
            label={`${summary.addedCount} added`}
            color="info"
            size="small"
          />
        )}
        {summary.removedCount > 0 && (
          <Chip
            icon={<RemovedIcon />}
            label={`${summary.removedCount} removed`}
            color="warning"
            size="small"
          />
        )}
        {summary.durationChangedCount > 0 && (
          <Chip
            icon={<DurationIcon />}
            label={`${summary.durationChangedCount} duration change${summary.durationChangedCount !== 1 ? 's' : ''}`}
            size="small"
          />
        )}
        <Chip
          label={`${comparison.diff.unchangedCount} unchanged`}
          variant="outlined"
          size="small"
        />
      </Box>
    </Paper>
  )
}
