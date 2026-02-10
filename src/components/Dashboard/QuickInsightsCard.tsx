import { observer } from 'mobx-react-lite'
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Divider,
} from '@mui/material'
import InsightsIcon from '@mui/icons-material/Insights'
import { useRootStore } from '../../store'

interface QuickInsightsCardProps {
  /** Callback when test is clicked - receives test ID for navigation */
  onTestClick: (testId: string) => void
}

/**
 * QuickInsightsCard component displays key test insights.
 *
 * Two sections:
 * 1. Top Failures - Failed tests sorted by historical failure count
 * 2. Slowest Tests - Passed/failed tests sorted by duration descending
 *
 * Each section shows top 3 tests.
 * Handles empty states per section.
 */
export const QuickInsightsCard = observer(
  ({ onTestClick }: QuickInsightsCardProps) => {
    const { testResultsStore, historyStore } = useRootStore()

    // Get failed tests for Top Failures section
    const failedTests = testResultsStore.resultsList.filter(
      (test) => test.execution.status === 'failed'
    )

    // Sort by historical failure count (from history)
    const topFailures = failedTests
      .map((test) => {
        if (!test.signature) return { test, failureCount: 0 }

        const history = historyStore.getTestHistory(test.signature)
        const failureCount = history.filter(
          (run) => run.status === 'failed'
        ).length

        return { test, failureCount }
      })
      .sort((a, b) => b.failureCount - a.failureCount)
      .slice(0, 3)

    // Get slowest tests (both passed and failed)
    const slowestTests = testResultsStore.resultsList
      .filter(
        (test) =>
          test.execution.status === 'passed' ||
          test.execution.status === 'failed'
      )
      .sort((a, b) => b.execution.duration - a.execution.duration)
      .slice(0, 3)

    /**
     * Formats duration in milliseconds to human-readable string
     */
    const formatDuration = (ms: number): string => {
      const seconds = Math.floor(ms / 1000)
      const minutes = Math.floor(seconds / 60)

      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`
      }
      return `${seconds}s`
    }

    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InsightsIcon color="primary" />
              <Typography variant="h6">Quick Insights</Typography>
            </Box>
          }
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ pt: 1 }}>
          <Stack spacing={2} divider={<Divider />}>
            {/* Top Failures Section */}
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                Top Failures
              </Typography>

              {topFailures.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No failures to report
                </Typography>
              ) : (
                <List dense disablePadding>
                  {topFailures.map(({ test, failureCount }) => (
                    <ListItem key={test.id} disablePadding>
                      <ListItemButton
                        onClick={() => onTestClick(test.id)}
                        sx={{ borderRadius: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {test.title}
                            </Typography>
                          }
                          secondary={
                            failureCount > 0
                              ? `Failed ${failureCount} times historically`
                              : 'New failure'
                          }
                          secondaryTypographyProps={{
                            variant: 'caption',
                            sx: { color: 'text.secondary' },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>

            {/* Slowest Tests Section */}
            <Box>
              <Typography
                variant="overline"
                color="text.secondary"
                display="block"
                gutterBottom
              >
                Slowest Tests
              </Typography>

              {slowestTests.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No test duration data
                </Typography>
              ) : (
                <List dense disablePadding>
                  {slowestTests.map((test) => (
                    <ListItem key={test.id} disablePadding>
                      <ListItemButton
                        onClick={() => onTestClick(test.id)}
                        sx={{ borderRadius: 1 }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {test.title}
                            </Typography>
                          }
                          secondary={formatDuration(test.execution.duration)}
                          secondaryTypographyProps={{
                            variant: 'caption',
                            sx: { color: 'text.secondary' },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    )
  }
)
