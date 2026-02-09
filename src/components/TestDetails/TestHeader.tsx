import { Box, Stack, Typography, Chip } from '@mui/material'
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
    <Stack spacing={2}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {getStatusIcon(test.execution.status)}
        <Typography variant="h6" sx={{ flex: 1 }}>
          {test.title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Duration: {formattedDuration}
        </Typography>
        {test.muted && (
          <Chip size="small" label="Muted" color="default" />
        )}
      </Box>
    </Stack>
  )
}
