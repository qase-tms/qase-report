import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { GitBranch } from 'lucide-react'
import { useRootStore } from '../../store'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HelpTooltip } from './HelpTooltip'

/**
 * SuiteHealthCard component displays pass rates for test suites.
 *
 * Shows:
 * - Suite names with progress bars
 * - Color-coded pass rates (green 90%+, warning 70-89%, error <70%)
 * - Count format: "X/Y (Z%)"
 * - Top 5 worst-performing suites
 *
 * Handles empty state when no suite data available.
 */
export const SuiteHealthCard = observer(() => {
  const { reportStore } = useRootStore()
  const { suitePassRates } = reportStore
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const helpText =
    'Shows pass rates for test suites, sorted by lowest first. Green: 90%+, Yellow: 70-89%, Red: below 70%. Format: passed/total (percentage).'

  // Empty state
  if (suitePassRates.length === 0) {
    return (
      <div className="bg-card rounded-lg border shadow-sm h-full">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-muted-foreground" />
              <h6 className="text-lg font-semibold">Suite Health</h6>
            </div>
            <HelpTooltip content={helpText} />
          </div>
          <p className="text-sm text-muted-foreground">
            No suite data available
          </p>
        </div>
      </div>
    )
  }

  /**
   * Returns color classes based on pass rate threshold
   */
  const getPassRateColor = (passRate: number): string => {
    if (passRate >= 90) return 'bg-passed'
    if (passRate >= 70) return 'bg-broken'
    return 'bg-failed'
  }

  // Show top 5 worst-performing suites (already sorted by passRate ascending)
  const displayedSuites = suitePassRates.slice(0, 5)

  return (
    <div className="bg-card rounded-lg border shadow-sm h-full">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            <h6 className="text-lg font-semibold">Suite Health</h6>
          </div>
          <HelpTooltip content={helpText} />
        </div>
      </div>
      <div className="p-4 pt-2">
        <div className="flex flex-col gap-4">
          {displayedSuites.map((suite) => {
            const colorClass = getPassRateColor(suite.passRate)
            return (
              <div key={suite.suite}>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[60%]">
                    {suite.suite}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {suite.passed}/{suite.total} ({suite.passRate.toFixed(0)}%)
                  </p>
                </div>
                <div className="w-full bg-secondary rounded h-2">
                  <div
                    className={`h-2 rounded ${colorClass}`}
                    style={{ width: `${suite.passRate}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {suitePassRates.length > 5 && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="text-xs text-muted-foreground mt-4 hover:text-foreground transition-colors"
          >
            +{suitePassRates.length - 5} more suites
          </button>
        )}
      </div>

      {/* Dialog with all suites */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-primary" />
              Suite Health
              <span className="px-2 py-1 rounded-full text-xs bg-primary text-primary-foreground">
                {suitePassRates.length}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <div className="flex flex-col gap-4">
              {suitePassRates.map((suite) => {
                const colorClass = getPassRateColor(suite.passRate)
                return (
                  <div key={suite.suite}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[60%]">
                        {suite.suite}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {suite.passed}/{suite.total} ({suite.passRate.toFixed(0)}%)
                      </p>
                    </div>
                    <div className="w-full bg-secondary rounded h-2">
                      <div
                        className={`h-2 rounded ${colorClass}`}
                        style={{ width: `${suite.passRate}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
})
