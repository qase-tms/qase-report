import { observer } from 'mobx-react-lite'
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Stack,
} from '@mui/material'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { useRootStore } from '../../store'

/**
 * SuiteHealthCard component displays pass rates for test suites.
 *
 * Shows:
 * - Suite names with progress bars
 * - Color-coded pass rates (green 90%+, warning 70-89%, error <70%)
 * - Count format: "X/Y (Z%)"
 * - Top 5 worst-performing suites
 *
 * Handles empty state when no suite data available.
 */
export const SuiteHealthCard = observer(() => {
  const { reportStore } = useRootStore()
  const { suitePassRates } = reportStore

  // Empty state
  if (suitePassRates.length === 0) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountTreeIcon color="action" />
              <Typography variant="h6">Suite Health</Typography>
            </Box>
          }
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No suite data available
          </Typography>
        </CardContent>
      </Card>
    )
  }

  /**
   * Returns color based on pass rate threshold
   */
  const getPassRateColor = (
    passRate: number
  ): 'success' | 'warning' | 'error' => {
    if (passRate >= 90) return 'success'
    if (passRate >= 70) return 'warning'
    return 'error'
  }

  // Show top 5 worst-performing suites (already sorted by passRate ascending)
  const displayedSuites = suitePassRates.slice(0, 5)

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountTreeIcon color="primary" />
            <Typography variant="h6">Suite Health</Typography>
          </Box>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Stack spacing={2}>
          {displayedSuites.map((suite) => {
            const color = getPassRateColor(suite.passRate)
            return (
              <Box key={suite.suite}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '60%',
                    }}
                  >
                    {suite.suite}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {suite.passed}/{suite.total} ({suite.passRate.toFixed(0)}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={suite.passRate}
                  color={color}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            )
          })}
        </Stack>

        {suitePassRates.length > 5 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, display: 'block' }}
          >
            +{suitePassRates.length - 5} more suites
          </Typography>
        )}
      </CardContent>
    </Card>
  )
})
