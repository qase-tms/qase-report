import { Box, CircularProgress, Typography } from '@mui/material'
import { DashboardCard } from './DashboardCard'

interface ProgressRingCardProps {
  title: string
  value: number
  size?: number
  thickness?: number
  colSpan?: number
  rowSpan?: number
}

export const ProgressRingCard = ({
  title,
  value,
  size = 100,
  thickness = 4,
  colSpan = 1,
  rowSpan = 1,
}: ProgressRingCardProps) => {
  // Determine color based on value
  const getColor = (val: number): string => {
    if (val >= 80) return 'success.main'
    if (val >= 50) return 'warning.main'
    return 'error.main'
  }

  return (
    <DashboardCard colSpan={colSpan} rowSpan={rowSpan}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          {/* Background ring (track) */}
          <CircularProgress
            variant="determinate"
            value={100}
            size={size}
            thickness={thickness}
            sx={{ color: 'action.hover' }}
          />
          {/* Foreground ring (progress) */}
          <CircularProgress
            variant="determinate"
            value={value}
            size={size}
            thickness={thickness}
            sx={{
              position: 'absolute',
              left: 0,
              color: getColor(value),
            }}
          />
          {/* Centered percentage label */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h5" component="div">
              {Math.round(value)}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </DashboardCard>
  )
}
