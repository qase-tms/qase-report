import { observer } from 'mobx-react-lite'
import { Typography } from '@mui/material'
import { useRootStore } from '../../store'
import { BentoGrid } from './BentoGrid'
import { DashboardCard } from './DashboardCard'
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
    <BentoGrid>
      {/* Statistics cards - 1x1 compact counters */}
      <DashboardCard>
        <StatsCard
          status="passed"
          count={stats.passed}
          percentage={reportStore.passRate}
        />
      </DashboardCard>
      <DashboardCard>
        <StatsCard
          status="failed"
          count={stats.failed}
          percentage={reportStore.failedRate}
        />
      </DashboardCard>
      <DashboardCard>
        <StatsCard
          status="skipped"
          count={stats.skipped}
          percentage={reportStore.skippedRate}
        />
      </DashboardCard>
      <DashboardCard>
        <StatsCard
          status="broken"
          count={reportStore.brokenCount}
          percentage={reportStore.brokenRate}
        />
      </DashboardCard>

      {/* Metadata cards - 2x1 horizontal layout */}
      <DashboardCard colSpan={2}>
        <RunInfoCard />
      </DashboardCard>
      <DashboardCard colSpan={2}>
        <HostInfoCard />
      </DashboardCard>

      {/* Alerts panel - 3x1 wide alert list */}
      {analyticsStore.hasAlerts && (
        <DashboardCard colSpan={3}>
          <AlertsPanel onAlertClick={handleAlertClick} />
        </DashboardCard>
      )}

      {/* Trend visualization - 4x2 large chart prominence */}
      {analyticsStore.hasTrendData && (
        <DashboardCard colSpan={4} rowSpan={2}>
          <TrendsChart />
        </DashboardCard>
      )}

      {/* Test health widget - 2x2 visual importance */}
      {historyStore.isHistoryLoaded && (
        <DashboardCard colSpan={2} rowSpan={2}>
          <TestHealthWidget />
        </DashboardCard>
      )}

      {/* History timeline - 2x2 vertical timeline */}
      {historyStore.recentRuns.length > 0 && (
        <DashboardCard colSpan={2} rowSpan={2}>
          <HistoryTimeline />
        </DashboardCard>
      )}
    </BentoGrid>
  )
})
