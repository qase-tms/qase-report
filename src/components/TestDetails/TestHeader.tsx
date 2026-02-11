import { Box, Typography, Chip } from '@mui/material'
import { getStatusIcon } from '../TestList/statusIcon'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestHeaderProps {
  test: QaseTestResult
}

export const TestHeader = ({ test }: TestHeaderProps) => {
  const duration = test.execution.duration
  const formattedDuration =
    duration >= 1000
      ? `${(duration / 1000).toFixed(1)}s`
      : `${duration}ms`

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {getStatusIcon(test.execution.status)}
        <Typography variant="body2" color="text.secondary">
          {test.execution.status}
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Duration: {formattedDuration}
      </Typography>
      {test.muted && <Chip size="small" label="Muted" color="default" />}
    </Box>
  )
}
