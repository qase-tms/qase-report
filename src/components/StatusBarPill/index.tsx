import { observer } from 'mobx-react-lite'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useRootStore } from '../../store'

export const StatusBarPill = observer(() => {
  const { reportStore, analyticsStore } = useRootStore()

  // Guard: return null if no report loaded
  if (!reportStore.runData) {
    return null
  }

  const { stats } = reportStore.runData
  const passRate = reportStore.passRate
  const flakyCount = analyticsStore.flakyTestCount

  // Color logic for pass rate ring
  const getColor = (rate: number): string => {
    if (rate >= 80) return 'success.main'
    if (rate >= 50) return 'warning.main'
    return 'error.main'
  }

  // Format run date
  const startTime = reportStore.runData.execution.start_time
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(startTime))

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {/* Compact pass rate ring (40px) */}
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        {/* Background ring (track) */}
        <CircularProgress
          variant="determinate"
          value={100}
          size={40}
          thickness={4}
          sx={{ color: 'action.hover' }}
        />
        {/* Foreground ring (progress) */}
        <CircularProgress
          variant="determinate"
          value={passRate}
          size={40}
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
          <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600 }}>
            {Math.round(passRate)}%
          </Typography>
        </Box>
      </Box>

      {/* Quick stats section - hidden on mobile */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 500 }}>
          {stats.passed} passed
        </Typography>
        <Typography variant="body2" color="text.secondary">
          •
        </Typography>
        <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 500 }}>
          {stats.failed} failed
        </Typography>
        {stats.skipped > 0 && (
          <>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {stats.skipped} skipped
            </Typography>
          </>
        )}
        {flakyCount > 0 && (
          <>
            <Typography variant="body2" color="text.secondary">
              •
            </Typography>
            <Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 500 }}>
              ~{flakyCount} flaky
            </Typography>
          </>
        )}
      </Box>

      {/* Run metadata - hidden on small screens */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {formattedDate} • {reportStore.formattedDuration}
      </Typography>
    </Box>
  )
})
