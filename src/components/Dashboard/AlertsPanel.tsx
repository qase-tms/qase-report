import { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { AlertTriangle, Gauge, RefreshCw, AlertCircle } from 'lucide-react'
import { useRootStore } from '../../store'
import type { AlertItem, AlertType } from '../../types/alerts'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { HelpTooltip } from './HelpTooltip'

interface AlertsPanelProps {
  /** Callback when alert is clicked - receives test signature for navigation */
  onAlertClick: (testSignature: string) => void
}

/**
 * Returns icon component based on alert type
 */
const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case 'performance_regression':
      return <Gauge className="h-5 w-5 text-failed" />
    case 'flaky_warning':
      return <RefreshCw className="h-5 w-5 text-broken" />
    case 'new_failure':
      return <AlertCircle className="h-5 w-5 text-failed" />
  }
}

/**
 * Returns badge label and color based on alert type
 */
const getAlertBadge = (type: AlertType) => {
  switch (type) {
    case 'performance_regression':
      return { label: 'Regression', color: 'bg-failed text-white' }
    case 'flaky_warning':
      return { label: 'Flaky', color: 'bg-broken text-text-black' }
    case 'new_failure':
      return { label: 'New Failure', color: 'bg-failed text-white' }
  }
}

export const AlertsPanel = observer(({ onAlertClick }: AlertsPanelProps) => {
  const { analyticsStore } = useRootStore()
  const { alerts } = analyticsStore
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Don't render panel if no alerts
  if (alerts.length === 0) {
    return null
  }

  const hasErrors = alerts.some(a => a.severity === 'error')

  return (
    <div className="bg-card rounded-lg border shadow-sm h-full">
      <div className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-broken" />
            <h6 className="text-lg font-semibold">Alerts</h6>
            <span className={`px-2 py-1 rounded-full text-xs ${hasErrors ? 'bg-failed text-white' : 'bg-broken text-text-black'}`}>
              {alerts.length}
            </span>
          </div>
          <HelpTooltip content="Alerts highlight tests that need attention: performance regressions (slower than baseline), flaky tests (inconsistent results), and new failures (first-time fails)." />
        </div>
      </div>
      <div className="p-4 pt-2">
        <div className="space-y-1">
          {alerts.slice(0, 10).map((alert) => {
            const badge = getAlertBadge(alert.type)
            return (
              <div key={alert.id}>
                <button
                  onClick={() => onAlertClick(alert.testSignature)}
                  className="w-full p-2 rounded hover:bg-accent text-left transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]">
                          {alert.testTitle}
                        </p>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {alert.message}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            )
          })}
        </div>
        {alerts.length > 10 && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="text-xs text-muted-foreground mt-2 hover:text-foreground transition-colors"
          >
            +{alerts.length - 10} more alerts
          </button>
        )}
      </div>

      {/* Dialog with all alerts */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-broken" />
              Alerts
              <span className={`px-2 py-1 rounded-full text-xs ${hasErrors ? 'bg-failed text-white' : 'bg-broken text-text-black'}`}>
                {alerts.length}
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 -mx-6 px-6">
            <div className="space-y-1">
              {alerts.map((alert) => {
                const badge = getAlertBadge(alert.type)
                return (
                  <div key={alert.id}>
                    <button
                      onClick={() => {
                        onAlertClick(alert.testSignature)
                        setIsDialogOpen(false)
                      }}
                      className="w-full p-2 rounded hover:bg-accent text-left transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-0.5">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                              {alert.testTitle}
                            </p>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${badge.color} shrink-0`}>
                              {badge.label}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {alert.message}
                          </p>
                        </div>
                      </div>
                    </button>
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
