import { List, ListItemButton, ListItemText, Collapse, Box } from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { TestListItem } from './TestListItem'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface SuiteGroupProps {
  suiteTitle: string
  tests: QaseTestResult[]
  onSelectTest: (id: string) => void
  isExpanded: boolean
  onToggle: () => void
}

export const SuiteGroup = ({
  suiteTitle,
  tests,
  onSelectTest,
  isExpanded,
  onToggle,
}: SuiteGroupProps) => {
  const prefersReducedMotion = usePrefersReducedMotion()
  const contentId = `suite-${encodeURIComponent(suiteTitle)}-content`

  return (
    <>
      <ListItemButton
        onClick={onToggle}
        sx={{ bgcolor: 'action.hover' }}
        aria-expanded={isExpanded}
        aria-controls={contentId}
      >
        <ListItemText
          primary={suiteTitle}
          secondary={`${tests.length} test${tests.length !== 1 ? 's' : ''}`}
        />
        {isExpanded ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse
        in={isExpanded}
        timeout={prefersReducedMotion ? 0 : 'auto'}
        unmountOnExit
        id={contentId}
      >
        <List component="div" disablePadding>
          <Box sx={{ pl: 2 }}>
            {tests.map((test) => (
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
}
