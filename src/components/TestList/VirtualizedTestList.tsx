import { useRef, useMemo, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { VariableSizeList, ListChildComponentProps } from 'react-window'
import { ListItemButton, ListItemText } from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import type { QaseTestResult } from '../../schemas/QaseTestResult.schema'
import { TestListItem } from './TestListItem'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface FlatListItem {
  type: 'suite-header' | 'test-item'
  id: string
  data: { title: string; count: number } | QaseTestResult
  suiteTitle: string
}

interface VirtualizedTestListProps {
  grouped: Map<string, QaseTestResult[]>
  expandedSuites: Set<string>
  toggleSuite: (title: string) => void
  onSelectTest: (id: string) => void
  height: number
}

interface RowData {
  items: FlatListItem[]
  expandedSuites: Set<string>
  toggleSuite: (title: string) => void
  onSelectTest: (id: string) => void
}

const flattenGroupedTests = (
  grouped: Map<string, QaseTestResult[]>,
  expandedSuites: Set<string>
): FlatListItem[] => {
  const flat: FlatListItem[] = []

  for (const [suiteTitle, tests] of grouped.entries()) {
    flat.push({
      type: 'suite-header',
      id: `suite-${suiteTitle}`,
      data: { title: suiteTitle, count: tests.length },
      suiteTitle
    })

    if (expandedSuites.has(suiteTitle)) {
      tests.forEach(test => {
        flat.push({
          type: 'test-item',
          id: test.id,
          data: test,
          suiteTitle
        })
      })
    }
  }

  return flat
}

const Row = observer(({ index, style, data }: ListChildComponentProps<RowData>) => {
  const { items, toggleSuite, onSelectTest, expandedSuites } = data
  const item = items[index]
  const prefersReducedMotion = usePrefersReducedMotion()

  if (item.type === 'suite-header') {
    const headerData = item.data as { title: string; count: number }
    const isExpanded = expandedSuites.has(item.suiteTitle)
    const contentId = `suite-${encodeURIComponent(item.suiteTitle)}-content`

    return (
      <div style={style}>
        <ListItemButton
          onClick={() => toggleSuite(item.suiteTitle)}
          sx={{ bgcolor: 'action.hover' }}
          aria-expanded={isExpanded}
          aria-controls={contentId}
        >
          <ListItemText
            primary={headerData.title}
            secondary={`${headerData.count} test${headerData.count !== 1 ? 's' : ''}`}
          />
          {isExpanded ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </div>
    )
  }

  return (
    <div style={style}>
      <TestListItem test={item.data as QaseTestResult} onSelect={onSelectTest} />
    </div>
  )
})

export const VirtualizedTestList = observer(({
  grouped,
  expandedSuites,
  toggleSuite,
  onSelectTest,
  height
}: VirtualizedTestListProps) => {
  const listRef = useRef<VariableSizeList>(null)

  const flatItems = useMemo(
    () => flattenGroupedTests(grouped, expandedSuites),
    [grouped, expandedSuites]
  )

  // Reset size cache when expanded state changes
  useEffect(() => {
    listRef.current?.resetAfterIndex(0)
  }, [expandedSuites])

  const getItemSize = (index: number) => {
    // Suite headers with primary + secondary text need 72px
    // Test items also need 72px for consistent layout
    return 72
  }

  const itemData: RowData = {
    items: flatItems,
    expandedSuites,
    toggleSuite,
    onSelectTest
  }

  return (
    <VariableSizeList
      ref={listRef}
      height={height}
      itemCount={flatItems.length}
      itemSize={getItemSize}
      width="100%"
      overscanCount={2}
      itemData={itemData}
    >
      {Row}
    </VariableSizeList>
  )
})
