import { observer } from 'mobx-react-lite'
import { Box, Typography, Paper } from '@mui/material'
import { useRootStore } from '../../store'
import { RunSelector } from './RunSelector'
import { ComparisonSummary } from './ComparisonSummary'
import { DiffList } from './DiffList'

export const Comparison = observer(() => {
  const { analyticsStore, reportStore, historyStore } = useRootStore()

  // No report loaded
  if (!reportStore.runData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          color: 'text.secondary',
        }}
      >
        No report loaded
      </Box>
    )
  }

  // No history data
  if (!historyStore.isHistoryLoaded || analyticsStore.comparableRuns.length < 2) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Comparison
        </Typography>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            At least 2 runs are required for comparison. Load a report with history data containing multiple runs.
          </Typography>
        </Paper>
      </Box>
    )
  }

  const comparison = analyticsStore.comparison

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Compare two test runs to see status changes, added/removed tests, and duration differences.
        </Typography>
      </Box>

      <RunSelector />

      {comparison ? (
        <>
          <ComparisonSummary comparison={comparison} />
          <DiffList comparison={comparison} />
        </>
      ) : (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Select two runs above to see the comparison.
          </Typography>
        </Paper>
      )}
    </Box>
  )
})
