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

// Get computed CSS variable color for Recharts (SVG doesn't support CSS vars)
const useThemeColor = (cssVar: string, fallback: string) => {
  const [color, setColor] = useState(fallback)

  useEffect(() => {
    const updateColor = () => {
      const computed = getComputedStyle(document.documentElement)
        .getPropertyValue(cssVar)
        .trim()
      if (computed) {
        setColor(`hsl(${computed})`)
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
 * Custom tooltip component for trend charts.
 * Displays detailed run information on hover.
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null

  const data: TrendDataPoint = payload[0].payload

  return (
    <div className="bg-card rounded-lg border shadow-sm p-3">
      <p className="text-sm font-bold mb-1">
        {data.date}
      </p>
      <p className="text-sm">Total: {data.total}</p>
      <p className="text-sm text-green-500">
        Passed: {data.passed} ({data.passRate.toFixed(1)}%)
      </p>
      <p className="text-sm text-destructive">
        Failed: {data.failed}
      </p>
      {data.skipped > 0 && (
        <p className="text-sm text-yellow-500">
          Skipped: {data.skipped}
        </p>
      )}
      {data.broken > 0 && (
        <p className="text-sm text-muted-foreground">
          Broken: {data.broken}
        </p>
      )}
      <p className="text-sm mt-1">
        Duration: {(data.duration / 1000).toFixed(1)}s
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
          <h6 className="text-lg font-semibold mb-4">
            Pass Rate Trend
          </h6>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={passRateTrend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip content={<CustomTooltip />} />
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
          <h6 className="text-lg font-semibold mb-4">
            Duration Trend
          </h6>
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
              <Tooltip
                formatter={(value: number) => `${(value / 1000).toFixed(1)}s`}
                labelFormatter={(label) => `Date: ${label}`}
              />
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
