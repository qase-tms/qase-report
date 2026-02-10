import { Card, CardContent } from '@mui/material'
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
    <Card
      elevation={2}
      sx={{
        gridColumn: 'span 1',
        gridRow: 'span 1',
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
      <CardContent>{children}</CardContent>
    </Card>
  )
}
