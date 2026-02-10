import { Box } from '@mui/material'
import { ReactNode } from 'react'

interface BentoGridProps {
  children: ReactNode
}

export const BentoGrid = ({ children }: BentoGridProps) => {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: '1fr',
        '@media (min-width: 900px)': {
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: 'minmax(120px, auto)',
        },
        '@media (min-width: 1280px)': {
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridAutoRows: 'minmax(140px, auto)',
        },
      }}
    >
      {children}
    </Box>
  )
}
