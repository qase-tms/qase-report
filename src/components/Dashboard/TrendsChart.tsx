import { useEffect, useState } from 'react'
import { observer } from 'mobx-react-lite'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { useRootStore } from '../../store'
import type { TrendDataPoint } from '../../store/AnalyticsStore'
import { HelpTooltip } from './HelpTooltip'

// Get computed RGB color for Recharts (SVG doesn't support CSS vars or oklch)
const useThemeColor = (cssVar: string, fallback: string) => {
  const [color, setColor] = useState(fallback)

  useEffect(() => {
    const updateColor = () => {
      // Create a temporary element to get computed color
      const el = document.createElement('div')
      el.style.color = `var(${cssVar})`
      el.style.display = 'none'
      document.body.appendChild(el)
      const computed = getComputedStyle(el).color
      document.body.removeChild(el)

      if (computed && computed !== 'rgba(0, 0, 0, 0)') {
        setColor(computed)
      }
    }
    updateColor()

    // Update on theme change
    const observer = new MutationObserver(updateColor)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [cssVar])

  return color
}

/**
 * Custom tooltip component for pass rate trend chart.
 * Displays detailed run information on hover.
 */
const PassRateTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null

  const data: TrendDataPoint = payload[0].payload

  return (
    <div className="bg-card rounded-lg border shadow-sm p-3">
      <p className="text-sm font-bold mb-1">
        {data.date}
      </p>
      <p className="text-sm">Total: {data.total}</p>
      <p className="text-sm text-passed">
        Passed: {data.passed} ({data.passRate.toFixed(1)}%)
      </p>
      <p className="text-sm text-failed">
        Failed: {data.failed}
      </p>
      {data.skipped > 0 && (
        <p className="text-sm text-broken">
          Skipped: {data.skipped}
        </p>
      )}
      {data.blocked > 0 && (
        <p className="text-sm text-blocked">
          Blocked: {data.blocked}
        </p>
      )}
      <p className="text-sm mt-1">
        Duration: {(data.duration / 1000).toFixed(1)}s
      </p>
    </div>
  )
}

/**
 * Custom tooltip component for duration trend chart.
 */
const DurationTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null

  const data: TrendDataPoint = payload[0].payload

  // Format duration nicely
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    if (minutes > 0) {
      const remainingSeconds = seconds % 60
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  return (
    <div className="bg-card rounded-lg border shadow-sm p-3">
      <p className="text-sm font-bold mb-1">
        {data.date}
      </p>
      <p className="text-sm">
        Duration: {formatDuration(data.duration)}
      </p>
    </div>
  )
}

/**
 * TrendsChart component displays pass rate and duration trends over time.
 * Only renders when 2+ historical runs exist (hasTrendData).
 *
 * Uses Recharts library for responsive line charts with:
 * - Pass rate trend: passed/failed/skipped lines over time
 * - Duration trend: execution time changes over time
 */
export const TrendsChart = observer(() => {
  const { analyticsStore } = useRootStore()
  const chart1Color = useThemeColor('--chart-1', '#22c55e')
  const primaryColor = useThemeColor('--primary', '#3b82f6')

  // Only render if sufficient trend data exists
  if (!analyticsStore.hasTrendData) {
    return null
  }

  const passRateTrend = analyticsStore.passRateTrend
  const durationTrend = analyticsStore.durationTrend

  return (
    <div>
      {/* Pass Rate Trend Chart */}
      <div className="bg-card rounded-lg border shadow-sm mb-6">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h6 className="text-lg font-semibold">Pass Rate Trend</h6>
            <HelpTooltip content="Shows how test pass rate changes over time. Hover over points to see detailed run statistics including passed, failed, skipped counts." />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={passRateTrend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip content={<PassRateTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="passRate"
                name="Pass Rate"
                stroke={chart1Color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Duration Trend Chart */}
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h6 className="text-lg font-semibold">Duration Trend</h6>
            <HelpTooltip content="Shows how total test execution time changes over time. Helps identify performance regressions or improvements in test suite." />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={durationTrend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
              />
              <Tooltip content={<DurationTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="duration"
                name="Duration"
                stroke={primaryColor}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
})
