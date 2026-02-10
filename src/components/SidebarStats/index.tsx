import { Box, CircularProgress, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const SidebarStats = observer(() => {
  const { reportStore, analyticsStore } = useRootStore()

  // Guard: Return null if no data loaded
  if (!reportStore.runData) {
    return null
  }

  // Get pass rate and determine color
  const passRate = reportStore.passRate
  const getColor = (val: number): string => {
    if (val >= 80) return 'success.main'
    if (val >= 50) return 'warning.main'
    return 'error.main'
  }

  // Get quick stats
  const stats = reportStore.runData.stats
  const flakyCount = analyticsStore.flakyTestCount

  return (
    <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
      {/* Pass Rate Label */}
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Pass Rate
      </Typography>

      {/* Pass Rate Ring */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          {/* Background ring (track) */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={80}
            thickness={4}
            sx={{ color: 'action.hover' }}
          />
          {/* Foreground ring (progress) */}
          <CircularProgress
            variant="determinate"
            value={passRate}
            size={80}
            thickness={4}
            sx={{
              position: 'absolute',
              left: 0,
              color: getColor(passRate),
            }}
          />
          {/* Centered percentage label */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" component="div">
              {Math.round(passRate)}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Stats Row */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-around',
          pt: 1.5,
        }}
      >
        {/* Passed */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'success.main' }}>
            {stats.passed}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Passed
          </Typography>
        </Box>

        {/* Failed */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'error.main' }}>
            {stats.failed}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Failed
          </Typography>
        </Box>

        {/* Flaky */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ color: 'warning.main' }}>
            {flakyCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Flaky
          </Typography>
        </Box>
      </Box>
    </Box>
  )
})
