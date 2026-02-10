import { observer } from 'mobx-react-lite'
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { getStatusIcon } from './statusIcon'
import { useRootStore } from '../../store'
import { StabilityBadge } from './StabilityBadge'

interface TestListItemProps {
  test: QaseTestResult
  onSelect: (id: string) => void
}

export const TestListItem = observer(({ test, onSelect }: TestListItemProps) => {
  const handleClick = () => onSelect(test.id)
  const { analyticsStore } = useRootStore()

  // Format duration: if > 1000ms show as seconds
  const duration = test.execution.duration
  const durationText = duration >= 1000
    ? `${(duration / 1000).toFixed(1)}s`
    : `${duration}ms`

  // Get flakiness result if test has signature
  const flakinessResult = test.signature
    ? analyticsStore.getFlakinessScore(test.signature)
    : null

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
        {flakinessResult && <StabilityBadge result={flakinessResult} />}
      </ListItemButton>
    </ListItem>
  )
})
