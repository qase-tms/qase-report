import { Box, Typography, Stack } from '@mui/material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'

interface TestErrorProps {
  test: QaseTestResult
}

export const TestError = ({ test }: TestErrorProps) => {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Error Details</Typography>
      {test.message && (
        <Typography variant="body2" color="error">
          {test.message}
        </Typography>
      )}
      {test.execution.stacktrace && (
        <Box
          sx={{
            bgcolor: 'grey.100',
            p: 2,
            borderRadius: 1,
            maxHeight: 400,
            overflow: 'auto',
          }}
        >
          <Typography
            component="pre"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              margin: 0,
            }}
          >
            {test.execution.stacktrace}
          </Typography>
        </Box>
      )}
    </Stack>
  )
}
