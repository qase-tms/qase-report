import { useState } from 'react'
import { List, ListItemButton, ListItemText, Collapse, Box } from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { TestListItem } from './TestListItem'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface SuiteGroupProps {
  suiteTitle: string
  tests: QaseTestResult[]
  onSelectTest: (id: string) => void
}

export const SuiteGroup = ({ suiteTitle, tests, onSelectTest }: SuiteGroupProps) => {
  const [open, setOpen] = useState(true) // Start expanded
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)} sx={{ bgcolor: 'action.hover' }}>
        <ListItemText
          primary={suiteTitle}
          secondary={`${tests.length} test${tests.length !== 1 ? 's' : ''}`}
        />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout={prefersReducedMotion ? 0 : 'auto'} unmountOnExit>
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
