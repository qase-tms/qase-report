import { Box, Typography, Stack } from '@mui/material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestParamsProps {
  test: QaseTestResult
}

export const TestParams = ({ test }: TestParamsProps) => {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Parameters</Typography>
      <Box>
        {Object.entries(test.params).map(([key, value]) => (
          <Box key={key} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>
              {key}:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  )
}
