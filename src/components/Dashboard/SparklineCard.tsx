import { Typography, useTheme } from '@mui/material'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { DashboardCard } from './DashboardCard'

interface SparklineCardProps {
  title: string
  data: Array<{ value: number; label?: string }>
  dataKey?: string
  color?: string
  colSpan?: number
  rowSpan?: number
  currentValue?: string | number
}

export const SparklineCard = ({
  title,
  data,
  dataKey = 'value',
  color,
  colSpan = 2,
  rowSpan = 1,
  currentValue,
}: SparklineCardProps) => {
  const theme = useTheme()
  const lineColor = color || theme.palette.primary.main

  return (
    <DashboardCard colSpan={colSpan} rowSpan={rowSpan}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {currentValue !== undefined && (
        <Typography variant="h4">{currentValue}</Typography>
      )}
      <ResponsiveContainer width="100%" height={60}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
        >
          <Tooltip
            contentStyle={{ fontSize: '0.75rem' }}
            cursor={false}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </DashboardCard>
  )
}
