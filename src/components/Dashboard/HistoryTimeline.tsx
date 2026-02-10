import { observer } from 'mobx-react-lite'
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'
import { useRootStore } from '../../store'
import type { HistoricalRun } from '../../schemas/QaseHistory.schema'

/**
 * Determines status color based on run statistics.
 * Failed tests = error (red), skipped/broken = warning (yellow), all passed = success (green)
 */
const getRunStatusColor = (
  run: HistoricalRun
): 'success' | 'error' | 'warning' => {
  if (run.stats.failed > 0) return 'error'
  if (run.stats.skipped > 0 || (run.stats.broken ?? 0) > 0) return 'warning'
  return 'success'
}

/**
 * Determines status icon based on run statistics.
 * Maps to Material-UI status icons for visual consistency.
 */
const getRunStatusIcon = (run: HistoricalRun) => {
  if (run.stats.failed > 0) return <ErrorIcon />
  if (run.stats.skipped > 0 || (run.stats.broken ?? 0) > 0) return <WarningIcon />
  return <CheckCircleIcon />
}

/**
 * Formats duration from milliseconds to human-readable string.
 * Displays milliseconds, seconds, or minutes/seconds based on magnitude.
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`
}

/**
 * Timeline visualization of recent test runs.
 * Shows chronological history with status indicators, statistics, and duration.
 * Most recent runs appear at the top.
 */
export const HistoryTimeline = observer(() => {
  const { historyStore } = useRootStore()

  // Don't render if no history data
  if (historyStore.recentRuns.length === 0) {
    return null
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Runs
        </Typography>
        <Timeline position="right">
          {historyStore.recentRuns.map((run, index) => (
            <TimelineItem key={run.run_id}>
              <TimelineOppositeContent sx={{ flex: 0.3 }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(run.start_time).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(run.start_time).toLocaleTimeString()}
                </Typography>
              </TimelineOppositeContent>
              <TimelineSeparator>
                <TimelineDot color={getRunStatusColor(run)}>
                  {getRunStatusIcon(run)}
                </TimelineDot>
                {index < historyStore.recentRuns.length - 1 && (
                  <TimelineConnector />
                )}
              </TimelineSeparator>
              <TimelineContent>
                <Typography variant="body2" fontWeight="medium">
                  {run.title || `Run ${run.run_id}`}
                </Typography>
                <Stack
                  direction="row"
                  spacing={0.5}
                  flexWrap="wrap"
                  sx={{ mt: 0.5 }}
                >
                  <Chip
                    label={`${run.stats.passed} passed`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                  {run.stats.failed > 0 && (
                    <Chip
                      label={`${run.stats.failed} failed`}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  )}
                  {run.stats.skipped > 0 && (
                    <Chip
                      label={`${run.stats.skipped} skipped`}
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(run.duration)}
                </Typography>
              </TimelineContent>
            </TimelineItem>
          ))}
        </Timeline>
      </CardContent>
    </Card>
  )
})
