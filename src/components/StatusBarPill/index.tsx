import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const StatusBarPill = observer(() => {
 const { reportStore, analyticsStore } = useRootStore()

 // Guard: return null if no report loaded
 if (!reportStore.runData) {
 return null
 }

 const { stats } = reportStore.runData
 const passRate = reportStore.passRate
 const flakyCount = analyticsStore.flakyTestCount

 // Color logic for pass rate ring
 const getColor = (rate: number): string => {
 if (rate >= 80) return 'success.main'
 if (rate >= 50) return 'warning.main'
 return 'error.main'
 }

 // Format run date
 const startTime = reportStore.runData.execution.start_time
 const formattedDate = new Intl.DateTimeFormat('en-US', {
 dateStyle: 'medium',
 timeStyle: 'short',
 }).format(new Date(startTime))

 return (
 <div>
 {/* Compact pass rate ring (40px) */}
 <div>
 {/* Background ring (track) */}
 <CircularProgress
 value={100}
 size={40}
 thickness={4}
 />
 {/* Foreground ring (progress) */}
 <CircularProgress
 value={passRate}
 size={40}
 thickness={4}
 />
 {/* Centered percentage label */}
 <div
 >
 <span className="text-xs">
 {Math.round(passRate)}%
 </p>
 </div>
 </div>

 {/* Quick stats section - hidden on mobile */}
 <div,
 alignItems: 'center',
 gap: 1,
 }}
 >
 <p className="text-sm">
 {stats.passed} passed
 </p>
 <p className="text-sm" className="text-muted-foreground">
 •
 </p>
 <p className="text-sm">
 {stats.failed} failed
 </p>
 {stats.skipped > 0 && (
 <>
 <p className="text-sm" className="text-muted-foreground">
 •
 </p>
 <p className="text-sm" className="text-muted-foreground">
 {stats.skipped} skipped
 </p>
 </>
 )}
 {flakyCount > 0 && (
 <>
 <p className="text-sm" className="text-muted-foreground">
 •
 </p>
 <p className="text-sm">
 ~{flakyCount} flaky
 </p>
 </>
 )}
 </div>

 {/* Run metadata - hidden on small screens */}
 <p className="text-sm" className="text-muted-foreground" }}
 >
 {formattedDate} • {reportStore.formattedDuration}
 </p>
 </div>
 )
})
