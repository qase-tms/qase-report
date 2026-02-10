import { observer } from 'mobx-react-lite'
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Chip, Tooltip } from '@mui/material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { getStatusIcon } from './statusIcon'
import { useRootStore } from '../../store'
import { StabilityBadge } from './StabilityBadge'
import type { StabilityGrade } from '../../types/stability'

interface TestListItemProps {
  test: QaseTestResult
  onSelect: (id: string) => void
}

const getGradeColor = (grade: StabilityGrade): 'success' | 'info' | 'warning' | 'error' | 'default' => {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'success'
    case 'B':
      return 'info'
    case 'C':
    case 'D':
      return 'warning'
    case 'F':
      return 'error'
    default:
      return 'default'
  }
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

  // Get stability score if test has signature
  const stabilityResult = test.signature
    ? analyticsStore.getStabilityScore(test.signature)
    : null

  return (
    <ListItem disablePadding>
      <ListItemButton
        onClick={handleClick}
        sx={{
          transition: (theme) =>
            theme.transitions.create(['transform', 'background-color'], {
              duration: theme.transitions.duration.shorter,
            }),
          '&:hover': {
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          {getStatusIcon(test.execution.status)}
        </ListItemIcon>
        <ListItemText
          primary={test.title}
          secondary={durationText}
          primaryTypographyProps={{ noWrap: true }}
        />
        {stabilityResult && stabilityResult.grade !== 'N/A' && (
          <Tooltip title={`Score: ${Math.round(stabilityResult.score)} (Pass: ${Math.round(stabilityResult.passRate)}%, Flaky: ${Math.round(stabilityResult.flakinessPercent)}%, CV: ${Math.round(stabilityResult.durationCV)}%)`}>
            <Chip
              label={stabilityResult.grade}
              size="small"
              color={getGradeColor(stabilityResult.grade)}
              sx={{ ml: 1, minWidth: 32 }}
            />
          </Tooltip>
        )}
        {flakinessResult && <StabilityBadge result={flakinessResult} />}
      </ListItemButton>
    </ListItem>
  )
})
