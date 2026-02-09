import { memo } from 'react'
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { getStatusIcon } from './statusIcon'

interface TestListItemProps {
  test: QaseTestResult
  onSelect: (id: string) => void
}

export const TestListItem = memo(({ test, onSelect }: TestListItemProps) => {
  const handleClick = () => onSelect(test.id)

  // Format duration: if > 1000ms show as seconds
  const duration = test.execution.duration
  const durationText = duration >= 1000
    ? `${(duration / 1000).toFixed(1)}s`
    : `${duration}ms`

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleClick}>
        <ListItemIcon sx={{ minWidth: 36 }}>
          {getStatusIcon(test.execution.status)}
        </ListItemIcon>
        <ListItemText
          primary={test.title}
          secondary={durationText}
          primaryTypographyProps={{ noWrap: true }}
        />
      </ListItemButton>
    </ListItem>
  )
})
