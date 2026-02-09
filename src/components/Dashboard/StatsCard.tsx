import { Card, CardContent, Typography } from '@mui/material'

interface StatsCardProps {
  status: 'passed' | 'failed' | 'skipped' | 'broken'
  count: number
  percentage: number
}

export const StatsCard = ({ status, count, percentage }: StatsCardProps) => {
  const getColor = () => {
    switch (status) {
      case 'passed':
        return 'success.main'
      case 'failed':
        return 'error.main'
      case 'broken':
        return 'warning.main'
      case 'skipped':
        return 'text.secondary'
    }
  }

  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="overline" color="text.secondary" gutterBottom>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Typography>
        <Typography variant="h3" component="div">
          {count}
        </Typography>
        <Typography variant="body2" color={getColor()}>
          {percentage.toFixed(1)}%
        </Typography>
      </CardContent>
    </Card>
  )
}
