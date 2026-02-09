import { Box, Typography, Stack } from '@mui/material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestFieldsProps {
  test: QaseTestResult
}

export const TestFields = ({ test }: TestFieldsProps) => {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Custom Fields</Typography>
      <Box>
        {Object.entries(test.fields).map(([key, value]) => (
          <Box key={key} sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 120 }}>
              {key}:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {value ?? 'N/A'}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  )
}
