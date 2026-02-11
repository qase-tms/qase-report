import { useState, useCallback } from 'react'
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Chip,
  Paper,
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ErrorOutline as RegressionIcon,
  CheckCircleOutline as FixedIcon,
  Add as AddedIcon,
  Remove as RemovedIcon,
  Speed as DurationIcon,
  ArrowUpward as SlowerIcon,
  ArrowDownward as FasterIcon,
} from '@mui/icons-material'
import type { ComparisonResult, StatusChange, DurationChange } from '../../types/comparison'
import { useRootStore } from '../../store'

interface DiffListProps {
  comparison: ComparisonResult
}

type DiffSection = 'regressions' | 'fixed' | 'added' | 'removed' | 'duration'

export const DiffList = ({ comparison }: DiffListProps) => {
  const { selectTest, testResultsStore } = useRootStore()
  const [expanded, setExpanded] = useState<Set<DiffSection>>(new Set(['regressions']))

  const toggleSection = useCallback((section: DiffSection) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }, [])

  const handleTestClick = useCallback((signature: string) => {
    // Find test ID by signature in current results
    const test = testResultsStore.resultsList.find(t => t.signature === signature)
    if (test) {
      selectTest(test.id)
    }
  }, [selectTest, testResultsStore.resultsList])

  const { diff } = comparison
  const regressions = diff.statusChanged.filter(c => c.changeType === 'regression')
  const fixed = diff.statusChanged.filter(c => c.changeType === 'fixed')

  const renderStatusChangeItem = (item: StatusChange) => (
    <ListItemButton
      key={item.signature}
      onClick={() => handleTestClick(item.signature)}
      sx={{ pl: 4 }}
    >
      <ListItemText
        primary={item.title}
        secondary={`${item.oldStatus} -> ${item.newStatus}`}
      />
    </ListItemButton>
  )

  const renderDurationItem = (item: DurationChange) => {
    const isFaster = item.difference < 0
    return (
      <ListItemButton
        key={item.signature}
        onClick={() => handleTestClick(item.signature)}
        sx={{ pl: 4 }}
      >
        <ListItemIcon sx={{ minWidth: 36 }}>
          {isFaster ? (
            <FasterIcon color="success" fontSize="small" />
          ) : (
            <SlowerIcon color="error" fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText
          primary={item.title}
          secondary={`${item.oldDuration}ms -> ${item.newDuration}ms (${item.percentChange > 0 ? '+' : ''}${Math.round(item.percentChange)}%)`}
        />
      </ListItemButton>
    )
  }

  const renderAddedRemovedItem = (item: typeof diff.added[0]) => (
    <ListItemButton
      key={item.signature}
      onClick={() => handleTestClick(item.signature)}
      sx={{ pl: 4 }}
    >
      <ListItemText
        primary={item.title}
        secondary={`${item.status} (${item.duration}ms)`}
      />
    </ListItemButton>
  )

  const sections = [
    {
      id: 'regressions' as const,
      label: 'Regressions',
      icon: <RegressionIcon color="error" />,
      count: regressions.length,
      items: regressions,
      render: renderStatusChangeItem,
    },
    {
      id: 'fixed' as const,
      label: 'Fixed',
      icon: <FixedIcon color="success" />,
      count: fixed.length,
      items: fixed,
      render: renderStatusChangeItem,
    },
    {
      id: 'added' as const,
      label: 'Added Tests',
      icon: <AddedIcon color="info" />,
      count: diff.added.length,
      items: diff.added,
      render: renderAddedRemovedItem,
    },
    {
      id: 'removed' as const,
      label: 'Removed Tests',
      icon: <RemovedIcon color="warning" />,
      count: diff.removed.length,
      items: diff.removed,
      render: renderAddedRemovedItem,
    },
    {
      id: 'duration' as const,
      label: 'Duration Changes',
      icon: <DurationIcon />,
      count: diff.durationChanged.length,
      items: diff.durationChanged,
      render: renderDurationItem,
    },
  ]

  return (
    <Paper>
      <List disablePadding>
        {sections.map(section => {
          if (section.count === 0) return null

          return (
            <Box key={section.id}>
              <ListItemButton onClick={() => toggleSection(section.id)}>
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.label} />
                <Chip label={section.count} size="small" sx={{ mr: 1 }} />
                {expanded.has(section.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
              <Collapse in={expanded.has(section.id)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {section.items.map(section.render)}
                </List>
              </Collapse>
            </Box>
          )
        })}
      </List>

      {sections.every(s => s.count === 0) && (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="text.secondary">
            No differences found between selected runs.
          </Typography>
        </Box>
      )}
    </Paper>
  )
}
