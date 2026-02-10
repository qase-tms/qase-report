import { observer } from 'mobx-react-lite'
import { Box, Grid, Typography } from '@mui/material'
import { useRootStore } from '../../store'
import { StatsCard } from './StatsCard'
import { RunInfoCard } from './RunInfoCard'
import { HostInfoCard } from './HostInfoCard'
import { TrendsChart } from './TrendsChart'
import { HistoryTimeline } from './HistoryTimeline'
import { AlertsPanel } from './AlertsPanel'
import { TestHealthWidget } from './TestHealthWidget'

export const Dashboard = observer(() => {
  const { reportStore, analyticsStore, historyStore, testResultsStore } = useRootStore()

  if (!reportStore.runData) {
    return (
      <Typography variant="body1" color="text.secondary">
        Load a report to view dashboard
      </Typography>
    )
  }

  const { stats } = reportStore.runData

  // Handle alert click - find test by signature and select it
  const handleAlertClick = (testSignature: string) => {
    // Find test with matching signature in current results
    for (const [id, test] of testResultsStore.testResults) {
      if (test.signature === testSignature) {
        reportStore.root.selectTest(id)
        return
      }
    }
  }

  return (
    <>
      <Grid container spacing={3}>
        {/* Statistics cards - 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            status="passed"
            count={stats.passed}
            percentage={reportStore.passRate}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            status="failed"
            count={stats.failed}
            percentage={reportStore.failedRate}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            status="skipped"
            count={stats.skipped}
            percentage={reportStore.skippedRate}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            status="broken"
            count={reportStore.brokenCount}
            percentage={reportStore.brokenRate}
          />
        </Grid>

        {/* Metadata cards - 2 columns on desktop, 1 on mobile */}
        <Grid item xs={12} md={6}>
          <RunInfoCard />
        </Grid>
        <Grid item xs={12} md={6}>
          <HostInfoCard />
        </Grid>
      </Grid>

      {/* Alerts panel - show when alerts exist */}
      {analyticsStore.hasAlerts && (
        <Box sx={{ mt: 3 }}>
          <AlertsPanel onAlertClick={handleAlertClick} />
        </Box>
      )}

      {/* Trend visualization - show when history data available */}
      {(analyticsStore.hasTrendData || historyStore.recentRuns.length > 0) && (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {analyticsStore.hasTrendData && (
              <Grid item xs={12} lg={6}>
                <TrendsChart />
              </Grid>
            )}
            {historyStore.isHistoryLoaded && (
              <Grid item xs={12} sm={6} lg={3}>
                <TestHealthWidget />
              </Grid>
            )}
            {historyStore.recentRuns.length > 0 && (
              <Grid item xs={12} sm={6} lg={3}>
                <HistoryTimeline />
              </Grid>
            )}
          </Grid>
        </Box>
      )}
    </>
  )
})
