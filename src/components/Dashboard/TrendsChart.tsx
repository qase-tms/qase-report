import { observer } from 'mobx-react-lite'
import { Box, Card, CardContent, Typography, useTheme } from '@mui/material'
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

/**
 * Custom tooltip component for trend charts.
 * Displays detailed run information on hover.
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null

  const data: TrendDataPoint = payload[0].payload

  return (
    <Card sx={{ p: 1.5 }}>
      <Typography variant="body2" fontWeight="bold" gutterBottom>
        {data.date}
      </Typography>
      <Typography variant="body2">Total: {data.total}</Typography>
      <Typography variant="body2" color="success.main">
        Passed: {data.passed} ({data.passRate.toFixed(1)}%)
      </Typography>
      <Typography variant="body2" color="error.main">
        Failed: {data.failed}
      </Typography>
      {data.skipped > 0 && (
        <Typography variant="body2" color="warning.main">
          Skipped: {data.skipped}
        </Typography>
      )}
      {data.broken > 0 && (
        <Typography variant="body2" color="text.secondary">
          Broken: {data.broken}
        </Typography>
      )}
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        Duration: {(data.duration / 1000).toFixed(1)}s
      </Typography>
    </Card>
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
  const theme = useTheme()

  // Only render if sufficient trend data exists
  if (!analyticsStore.hasTrendData) {
    return null
  }

  const passRateTrend = analyticsStore.passRateTrend
  const durationTrend = analyticsStore.durationTrend

  return (
    <Box>
      {/* Pass Rate Trend Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Pass Rate Trend
          </Typography>
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
                stroke={theme.palette.success.main}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Duration Trend Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Duration Trend
          </Typography>
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
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  )
})
