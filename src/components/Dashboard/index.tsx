import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { BentoGrid } from './BentoGrid'
import { DashboardCard } from './DashboardCard'
import { RunInfoCard } from './RunInfoCard'
import { HostInfoCard } from './HostInfoCard'
import { TrendsChart } from './TrendsChart'
import { HistoryTimeline } from './HistoryTimeline'
import { AlertsPanel } from './AlertsPanel'
import { TestHealthWidget } from './TestHealthWidget'
import { SparklineCard } from './SparklineCard'
import { SuiteHealthCard } from './SuiteHealthCard'
import { AttentionRequiredCard } from './AttentionRequiredCard'
import { QuickInsightsCard } from './QuickInsightsCard'

export const Dashboard = observer(() => {
  const { reportStore, analyticsStore, historyStore, testResultsStore } = useRootStore()
  const prefersReducedMotion = usePrefersReducedMotion()

  if (!reportStore.runData) {
    return (
      <p className="text-base text-muted-foreground">
        Load a report to view dashboard
      </p>
    )
  }

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

  // Handle test click - select test by ID directly
  const handleTestClick = (testId: string) => {
    reportStore.root.selectTest(testId)
  }

  return (
    <div
      className={`transition-opacity ${
        reportStore.runData
          ? 'opacity-100'
          : 'opacity-0'
      }`}
      style={{
        transitionDuration: prefersReducedMotion ? '0ms' : '200ms',
      }}
    >
      <BentoGrid>
        {/* Pass rate trend sparkline - only when trend data available */}
        {analyticsStore.hasTrendData && (
          <SparklineCard
            title="Pass Rate Trend"
            data={analyticsStore.passRateTrend.map(d => ({ value: d.passRate, label: d.date }))}
            currentValue={`${reportStore.passRate.toFixed(0)}%`}
            colSpan={2}
            rowSpan={1}
          />
        )}

        {/* Metadata cards - 2x1 horizontal layout */}
        <DashboardCard colSpan={2}>
          <RunInfoCard />
        </DashboardCard>
        <DashboardCard colSpan={2}>
          <HostInfoCard />
        </DashboardCard>

        {/* Duration trend sparkline - only when trend data available */}
        {analyticsStore.hasTrendData && (
          <SparklineCard
            title="Duration Trend"
            data={analyticsStore.durationTrend.map(d => ({ value: d.duration / 1000, label: d.date }))}
            colSpan={2}
            rowSpan={1}
          />
        )}

        {/* Suite Health - 2x2 for proper list display */}
        {reportStore.suitePassRates.length > 0 && (
          <DashboardCard colSpan={2} rowSpan={2}>
            <SuiteHealthCard />
          </DashboardCard>
        )}

        {/* Attention Required - 3x1 wide list */}
        <DashboardCard colSpan={3}>
          <AttentionRequiredCard onTestClick={handleTestClick} />
        </DashboardCard>

        {/* Quick Insights - 2x2 for two sections */}
        <DashboardCard colSpan={2} rowSpan={2}>
          <QuickInsightsCard onTestClick={handleTestClick} />
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
    </div>
  )
})
