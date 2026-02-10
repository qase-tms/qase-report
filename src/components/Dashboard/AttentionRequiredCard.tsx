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
  Chip,
} from '@mui/material'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useRootStore } from '../../store'

interface AttentionRequiredCardProps {
  /** Callback when test is clicked - receives test ID for navigation */
  onTestClick: (testId: string) => void
}

/**
 * AttentionRequiredCard component displays tests that need attention.
 *
 * Shows:
 * - Failed tests from current run
 * - Tests that are historically flaky (badge)
 * - Clickable list for navigation
 * - "Failed" badge (error color) and "Flaky" badge (warning color)
 * - Limit to 5 items with "+N more" indicator
 *
 * Handles empty state when no tests require attention.
 */
export const AttentionRequiredCard = observer(
  ({ onTestClick }: AttentionRequiredCardProps) => {
    const { testResultsStore, analyticsStore } = useRootStore()

    // Get failed tests from current run
    const failedTests = testResultsStore.resultsList.filter(
      (test) => test.execution.status === 'failed'
    )

    // Get flaky test signatures
    const flakyTestSignatures = new Set(analyticsStore.flakyTests)

    // Combine failed tests with flaky status
    const testsNeedingAttention = failedTests.map((test) => ({
      ...test,
      isFlaky: test.signature ? flakyTestSignatures.has(test.signature) : false,
    }))

    // Empty state
    if (testsNeedingAttention.length === 0) {
      return (
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorOutlineIcon color="success" />
                <Typography variant="h6">Attention Required</Typography>
              </Box>
            }
          />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              No tests require attention
            </Typography>
          </CardContent>
        </Card>
      )
    }

    // Limit to 5 items
    const displayedTests = testsNeedingAttention.slice(0, 5)

    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ErrorOutlineIcon color="error" />
              <Typography variant="h6">Attention Required</Typography>
              <Chip
                label={testsNeedingAttention.length}
                size="small"
                color="error"
              />
            </Box>
          }
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ pt: 1 }}>
          <List dense disablePadding>
            {displayedTests.map((test) => (
              <ListItem key={test.id} disablePadding>
                <ListItemButton
                  onClick={() => onTestClick(test.id)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: 300,
                          }}
                        >
                          {test.title}
                        </Typography>
                        <Chip
                          label="Failed"
                          color="error"
                          size="small"
                          sx={{ height: 18, fontSize: '0.7rem' }}
                        />
                        {test.isFlaky && (
                          <Chip
                            label="Flaky"
                            color="warning"
                            size="small"
                            sx={{ height: 18, fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          {testsNeedingAttention.length > 5 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block' }}
            >
              +{testsNeedingAttention.length - 5} more tests
            </Typography>
          )}
        </CardContent>
      </Card>
    )
  }
)
