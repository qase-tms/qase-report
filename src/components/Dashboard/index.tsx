import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { Skeleton } from '@/components/ui/skeleton'
import { BentoGrid } from './BentoGrid'
import { DashboardCard } from './DashboardCard'
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
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 auto-rows-[minmax(100px,auto)]">
          {/* SparklineCard placeholder - 1 col */}
          <Skeleton className="h-32 col-span-1" />
          {/* Duration trend placeholder - 1 col */}
          <Skeleton className="h-32 col-span-1" />
          {/* SuiteHealthCard placeholder - 1x2 */}
          <Skeleton className="h-64 col-span-1 row-span-2" />
          {/* AttentionRequired placeholder - 1 col */}
          <Skeleton className="h-32 col-span-1" />
          {/* QuickInsights placeholder - 1x2 */}
          <Skeleton className="h-64 col-span-1 row-span-2" />
          {/* TrendsChart placeholder - 2x2 */}
          <Skeleton className="h-64 col-span-2 row-span-2" />
        </div>
      </div>
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
        transitionDuration: prefersReducedMotion ? '0ms' : '300ms',
      }}
    >
      <BentoGrid>
        {/* Pass rate trend sparkline - only when trend data available */}
        {analyticsStore.hasTrendData && (
          <SparklineCard
            title="Pass Rate Trend"
            data={analyticsStore.passRateTrend.map(d => ({ value: d.passRate, label: d.date }))}
            currentValue={`${reportStore.passRate.toFixed(0)}%`}
            colSpan={1}
            rowSpan={1}
          />
        )}

        {/* Run/Host info removed - now in sidebar */}

        {/* Duration trend sparkline - only when trend data available */}
        {analyticsStore.hasTrendData && (
          <SparklineCard
            title="Duration Trend"
            data={analyticsStore.durationTrend.map(d => ({ value: d.duration / 1000, label: d.date }))}
            colSpan={1}
            rowSpan={1}
          />
        )}

        {/* Suite Health - 1x2 for proper list display */}
        {reportStore.suitePassRates.length > 0 && (
          <DashboardCard colSpan={1} rowSpan={2}>
            <SuiteHealthCard />
          </DashboardCard>
        )}

        {/* Attention Required - 1x1 wide list */}
        <DashboardCard colSpan={1}>
          <AttentionRequiredCard onTestClick={handleTestClick} />
        </DashboardCard>

        {/* Quick Insights - 1x2 for two sections */}
        <DashboardCard colSpan={1} rowSpan={2}>
          <QuickInsightsCard onTestClick={handleTestClick} />
        </DashboardCard>

        {/* Alerts panel - 1x1 alert list */}
        {analyticsStore.hasAlerts && (
          <DashboardCard colSpan={1}>
            <AlertsPanel onAlertClick={handleAlertClick} />
          </DashboardCard>
        )}

        {/* Trend visualization - 2x2 full width chart */}
        {analyticsStore.hasTrendData && (
          <DashboardCard colSpan={2} rowSpan={2}>
            <TrendsChart />
          </DashboardCard>
        )}

        {/* Test health widget - 1x2 visual importance */}
        {historyStore.isHistoryLoaded && (
          <DashboardCard colSpan={1} rowSpan={2}>
            <TestHealthWidget />
          </DashboardCard>
        )}

        {/* History timeline - 1x2 vertical timeline */}
        {historyStore.recentRuns.length > 0 && (
          <DashboardCard colSpan={1} rowSpan={2}>
            <HistoryTimeline />
          </DashboardCard>
        )}
      </BentoGrid>
    </div>
  )
})
