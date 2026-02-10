import { Box } from '@mui/material'
import { ReactNode } from 'react'

interface DashboardCardProps {
  colSpan?: number
  rowSpan?: number
  children: ReactNode
}

export const DashboardCard = ({
  colSpan = 1,
  rowSpan = 1,
  children,
}: DashboardCardProps) => {
  return (
    <Box
      sx={{
        gridColumn: 'span 1',
        gridRow: 'span 1',
        transition: (theme) =>
          theme.transitions.create(['transform', 'box-shadow'], {
            duration: theme.transitions.duration.shorter,
          }),
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3,
        },
        '@media (min-width: 900px)': {
          gridColumn: `span ${Math.min(colSpan, 4)}`,
          gridRow: `span ${rowSpan}`,
        },
        '@media (min-width: 1280px)': {
          gridColumn: `span ${colSpan}`,
          gridRow: `span ${rowSpan}`,
        },
      }}
    >
      {children}
    </Box>
  )
}
