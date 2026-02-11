import { observer } from 'mobx-react-lite'
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
} from '@mui/material'
import { CompareArrows as CompareIcon } from '@mui/icons-material'
import { useRootStore } from '../../store'

export const RunSelector = observer(() => {
  const { analyticsStore } = useRootStore()
  const {
    comparableRuns,
    selectedBaseRunId,
    selectedCompareRunId,
    setSelectedBaseRunId,
    setSelectedCompareRunId,
  } = analyticsStore

  const formatRunDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  const formatRunLabel = (run: typeof comparableRuns[0]): string => {
    const date = formatRunDate(run.start_time)
    const passRate = run.stats.total > 0
      ? Math.round((run.stats.passed / run.stats.total) * 100)
      : 0
    return `${date} (${passRate}% pass)`
  }

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <FormControl sx={{ minWidth: 280 }} size="small">
          <InputLabel id="base-run-label">Base Run (older)</InputLabel>
          <Select
            labelId="base-run-label"
            id="base-run-select"
            value={selectedBaseRunId ?? ''}
            label="Base Run (older)"
            onChange={e => setSelectedBaseRunId(e.target.value || null)}
          >
            <MenuItem value="">
              <em>Select a run</em>
            </MenuItem>
            {comparableRuns.map(run => (
              <MenuItem
                key={run.run_id}
                value={run.run_id}
                disabled={run.run_id === selectedCompareRunId}
              >
                {formatRunLabel(run)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <CompareIcon sx={{ color: 'text.secondary' }} />

        <FormControl sx={{ minWidth: 280 }} size="small">
          <InputLabel id="compare-run-label">Compare Run (newer)</InputLabel>
          <Select
            labelId="compare-run-label"
            id="compare-run-select"
            value={selectedCompareRunId ?? ''}
            label="Compare Run (newer)"
            onChange={e => setSelectedCompareRunId(e.target.value || null)}
          >
            <MenuItem value="">
              <em>Select a run</em>
            </MenuItem>
            {comparableRuns.map(run => (
              <MenuItem
                key={run.run_id}
                value={run.run_id}
                disabled={run.run_id === selectedBaseRunId}
              >
                {formatRunLabel(run)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {comparableRuns.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Load a report with history data to enable comparison.
        </Typography>
      )}
    </Paper>
  )
})
