import { List, ListItemButton, ListItemIcon, ListItemText, Collapse, Box, Typography } from '@mui/material'
import { ExpandLess, ExpandMore, ErrorOutline } from '@mui/icons-material'
import { observer } from 'mobx-react-lite'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { TestListItem } from '../TestList/TestListItem'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface ClusterGroupProps {
  errorPattern: string
  tests: QaseTestResult[]
  isExpanded: boolean
  onToggle: () => void
  onSelectTest: (id: string) => void
}

export const ClusterGroup = observer(({
  errorPattern,
  tests,
  isExpanded,
  onToggle,
  onSelectTest,
}: ClusterGroupProps) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const contentId = `cluster-${encodeURIComponent(errorPattern.slice(0, 20))}-content`

  // Display-friendly error pattern (truncate if too long)
  const displayPattern = errorPattern === '__no_error__'
    ? 'No error message'
    : errorPattern.length > 80
      ? errorPattern.slice(0, 80) + '...'
      : errorPattern

  return (
    <>
      <ListItemButton
        onClick={onToggle}
        sx={{
          bgcolor: 'error.dark',
          '&:hover': { bgcolor: 'error.main' },
          borderRadius: 1,
          mb: 0.5,
        }}
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <ListItemIcon sx={{ minWidth: 36, color: 'error.contrastText' }}>
          <ErrorOutline />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body2" sx={{ color: 'error.contrastText', fontFamily: 'monospace' }}>
              {displayPattern}
            </Typography>
          }
          secondary={
            <Typography variant="caption" sx={{ color: 'error.contrastText', opacity: 0.8 }}>
              {tests.length} test{tests.length !== 1 ? 's' : ''} affected
            </Typography>
          }
        />
        {isExpanded ? (
          <ExpandLess sx={{ color: 'error.contrastText' }} />
        ) : (
          <ExpandMore sx={{ color: 'error.contrastText' }} />
        )}
      </ListItemButton>
      <Collapse
        in={isExpanded}
        timeout={prefersReducedMotion ? 0 : 'auto'}
        unmountOnExit
        id={contentId}
      >
        <List component="div" disablePadding>
          <Box sx={{ pl: 2, py: 1 }}>
            {tests.map(test => (
              <TestListItem
                key={test.id}
                test={test}
                onSelect={onSelectTest}
              />
            ))}
          </Box>
        </List>
      </Collapse>
    </>
  )
})
