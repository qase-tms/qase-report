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
          {/* Alerts placeholder - 1 col */}
          <Skeleton className="h-32 col-span-1" />
          {/* TestHealth placeholder - 1x2 */}
          <Skeleton className="h-64 col-span-1 row-span-2" />
          {/* SuiteHealth placeholder - 1x2 */}
          <Skeleton className="h-64 col-span-1 row-span-2" />
          {/* AttentionRequired placeholder - 1 col */}
          <Skeleton className="h-32 col-span-1" />
          {/* QuickInsights placeholder - 1x2 */}
          <Skeleton className="h-64 col-span-1 row-span-2" />
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
        {/* Alerts panel - first for visibility */}
        {analyticsStore.hasAlerts && (
          <DashboardCard colSpan={1}>
            <AlertsPanel onAlertClick={handleAlertClick} />
          </DashboardCard>
        )}

        {/* Attention Required - prominent position */}
        <DashboardCard colSpan={1}>
          <AttentionRequiredCard onTestClick={handleTestClick} />
        </DashboardCard>

        {/* Test health widget */}
        {historyStore.isHistoryLoaded && (
          <DashboardCard colSpan={1} rowSpan={2}>
            <TestHealthWidget />
          </DashboardCard>
        )}

        {/* Suite Health - 1x2 for proper list display */}
        {reportStore.suitePassRates.length > 0 && (
          <DashboardCard colSpan={1} rowSpan={2}>
            <SuiteHealthCard />
          </DashboardCard>
        )}

        {/* Quick Insights - 1x2 for two sections */}
        <DashboardCard colSpan={1} rowSpan={2}>
          <QuickInsightsCard onTestClick={handleTestClick} />
        </DashboardCard>

        {/* Trend visualization - 2x2 full width chart */}
        {analyticsStore.hasTrendData && (
          <DashboardCard colSpan={2} rowSpan={2}>
            <TrendsChart />
          </DashboardCard>
        )}

        {/* History timeline - horizontal scroll */}
        {historyStore.recentRuns.length > 0 && (
          <DashboardCard colSpan={2}>
            <HistoryTimeline />
          </DashboardCard>
        )}
      </BentoGrid>
    </div>
  )
})
