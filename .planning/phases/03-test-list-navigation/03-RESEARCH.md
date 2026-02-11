# Phase 3: Test List & Navigation - Research

**Researched:** 2026-02-09
**Domain:** React List UI with filtering, search, hierarchical grouping, and navigation
**Confidence:** MEDIUM-HIGH

## Summary

Phase 3 requires implementing a test list with filtering by status, search by name, suite hierarchy grouping, and navigation to test details. The technical domain involves MUI List components, MobX computed values for reactive filtering, collapsible nested lists for suite hierarchy, and state-based navigation without a router.

**Key findings:** MUI provides mature List components with Material Design patterns. MobX computed values enable efficient reactive filtering without manual subscription management. For suite hierarchy, MUI's nested List with Collapse component is the standard free alternative to TreeView (which is MUI X paid). Performance optimization through debounced search and React.memo prevents unnecessary re-renders. Navigation can be handled via MobX state without introducing React Router for this simple use case.

**Primary recommendation:** Use MUI List + ListItem + ListItemButton for test rendering, MobX computed getters for filtering/search logic, nested List with Collapse for suite hierarchy, and MobX observable state for tracking selected test ID.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | ^5.12.0 | List UI components | Already in project, provides List/ListItem/Collapse |
| mobx | ^6.9.0 | Reactive filtering/search | Already in project, computed values for derived state |
| mobx-react-lite | ^3.4.3 | React integration | Already in project, observer HOC for reactivity |
| @mui/icons-material | Not installed | Status icons | Standard MUI icon library (CheckCircle, Error, Warning, etc.) |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-window | Latest | List virtualization | ONLY if test count exceeds 1000+ items |
| lodash.debounce | Latest | Search debouncing | If custom debounce implementation needed (can use built-in) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MUI List | MUI DataGrid | DataGrid is overkill for simple list, adds complexity |
| Nested List + Collapse | MUI X TreeView | TreeView is paid MUI X component, free Community version exists but adds dependency |
| MobX state navigation | React Router | Router adds URL complexity unnecessary for simple detail view toggle |
| Custom debounce | lodash.debounce | Custom is simpler for basic use case, lodash better for advanced timing |

**Installation:**
```bash
npm install @mui/icons-material
# Optional, only if virtualization needed:
# npm install react-window
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── TestList/
│   │   ├── index.tsx              # Main list component with observer
│   │   ├── TestListItem.tsx       # Individual test item (memoized)
│   │   ├── TestListFilters.tsx    # Status filter chips
│   │   ├── TestListSearch.tsx     # Search input with debounce
│   │   └── SuiteGroup.tsx         # Collapsible suite hierarchy
│   └── TestDetails/
│       └── index.tsx               # Test detail view
├── store/
│   └── TestResultsStore.ts        # Add computed getters for filtering
└── layout/
    └── MainLayout/
        └── index.tsx               # Orchestrate list vs detail view
```

### Pattern 1: MobX Computed for Filtering

**What:** Create computed getters in TestResultsStore that reactively filter based on observable state.

**When to use:** For any derived/filtered data that depends on observable state.

**Example:**
```typescript
// Source: MobX official docs + project conventions
export class TestResultsStore {
  testResults = new Map<string, QaseTestResult>()
  searchQuery = ''
  statusFilters = new Set<string>() // 'passed', 'failed', 'skipped', 'broken'

  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  // Computed getter - automatically recalculates when dependencies change
  get filteredResults(): QaseTestResult[] {
    let results = this.resultsList

    // Filter by status
    if (this.statusFilters.size > 0) {
      results = results.filter(r => this.statusFilters.has(r.execution.status))
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase()
      results = results.filter(r => r.title.toLowerCase().includes(query))
    }

    return results
  }

  setSearchQuery = (query: string) => {
    this.searchQuery = query
  }

  toggleStatusFilter = (status: string) => {
    if (this.statusFilters.has(status)) {
      this.statusFilters.delete(status)
    } else {
      this.statusFilters.add(status)
    }
  }

  clearFilters = () => {
    this.searchQuery = ''
    this.statusFilters.clear()
  }
}
```

### Pattern 2: MUI Nested List with Collapse for Hierarchy

**What:** Use List + ListItemButton + Collapse to create expandable suite groups.

**When to use:** For hierarchical test organization by suite path.

**Example:**
```typescript
// Source: MUI official docs - nested list pattern
import { List, ListItemButton, ListItemText, Collapse } from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { useState } from 'react'

export const SuiteGroup = ({ suite, tests }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)}>
        <ListItemText primary={suite.title} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {tests.map(test => (
            <TestListItem key={test.id} test={test} sx={{ pl: 4 }} />
          ))}
        </List>
      </Collapse>
    </>
  )
}
```

### Pattern 3: State-Based Navigation Without Router

**What:** Use MobX observable to track selected test ID and conditionally render detail view.

**When to use:** For simple view switching without URL routing needs.

**Example:**
```typescript
// Source: React state management patterns
// In RootStore:
export class RootStore {
  selectedTestId: string | null = null

  constructor() {
    makeAutoObservable(this)
  }

  selectTest = (testId: string) => {
    this.selectedTestId = testId
  }

  clearSelection = () => {
    this.selectedTestId = null
  }

  get selectedTest(): QaseTestResult | null {
    if (!this.selectedTestId) return null
    return this.testResultsStore.testResults.get(this.selectedTestId) || null
  }
}

// In MainLayout:
export const MainLayout = observer(() => {
  const { selectedTest, clearSelection } = useRootStore()

  if (selectedTest) {
    return <TestDetails test={selectedTest} onBack={clearSelection} />
  }

  return <TestList />
})
```

### Pattern 4: Debounced Search Input

**What:** Debounce search input to avoid filtering on every keystroke.

**When to use:** For search inputs that trigger expensive operations (filtering large arrays).

**Example:**
```typescript
// Source: React debouncing best practices 2026
import { useState, useEffect } from 'react'
import { TextField } from '@mui/material'
import { observer } from 'mobx-react-lite'

export const TestListSearch = observer(() => {
  const { testResultsStore } = useRootStore()
  const [localQuery, setLocalQuery] = useState('')

  // Debounce: only update store after 300ms of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      testResultsStore.setSearchQuery(localQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [localQuery, testResultsStore])

  return (
    <TextField
      fullWidth
      placeholder="Search tests..."
      value={localQuery}
      onChange={(e) => setLocalQuery(e.target.value)}
    />
  )
})
```

### Pattern 5: Status Icons with Semantic Colors

**What:** Use MUI icons with theme colors matching status semantics.

**When to use:** For visual test status indicators.

**Example:**
```typescript
// Source: MUI icons documentation + project StatsCard conventions
import { CheckCircle, Error, Warning, DoNotDisturb } from '@mui/icons-material'

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'passed':
      return <CheckCircle color="success" />
    case 'failed':
      return <Error color="error" />
    case 'broken':
      return <Warning color="warning" />
    case 'skipped':
      return <DoNotDisturb color="disabled" />
  }
}

// Usage in ListItem:
<ListItemIcon>{getStatusIcon(test.execution.status)}</ListItemIcon>
```

### Anti-Patterns to Avoid

- **Filtering in component render:** Don't filter in component body - use MobX computed instead. Component filtering runs on every render, computed caches results.
- **No key prop on list items:** Always use test.id as key, never index. Without stable keys, React can't track list changes efficiently.
- **Deep component nesting:** Keep list item components flat. Excessive nesting causes re-render cascades.
- **Inline function props:** Avoid `onClick={() => selectTest(test.id)}` in list items. Use `onClick={handleClick}` with stable reference or wrap ListItem in React.memo with comparison function.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| List virtualization | Custom windowing logic | react-window (if needed) | Edge cases: scroll restoration, dynamic heights, focus management |
| Debouncing | Custom setTimeout tracking | useEffect cleanup pattern | Built-in cleanup prevents memory leaks and race conditions |
| Icon system | Custom SVG components | @mui/icons-material | Accessibility (ARIA), consistent sizing, tree-shaking support |
| Status color mapping | Hardcoded hex values | MUI theme colors | Theme consistency, dark mode support, semantic naming |
| Hierarchical grouping | Recursive rendering logic | Flatten with parent references | Performance issues with deep recursion, harder to optimize |

**Key insight:** List performance and UX patterns have many edge cases (keyboard nav, focus management, ARIA labels, scroll restoration). MUI components handle these by default.

## Common Pitfalls

### Pitfall 1: No Debouncing on Search Input
**What goes wrong:** Search filtering runs on every keystroke, causing lag on large lists (100+ items).

**Why it happens:** Direct binding of input onChange to store setter triggers immediate filtering and re-render.

**How to avoid:** Use local state for input value with useEffect debounce timer (300ms). Only update store after typing stops.

**Warning signs:** UI feels sluggish during typing, profiler shows excessive re-renders.

### Pitfall 2: Computed Value Not Reacting
**What goes wrong:** Filtered list doesn't update when status filter changes.

**Why it happens:** Computed getter references observable incorrectly (e.g., accessing size property on Set without iterating it, or checking Map.has() without reading the Map).

**How to avoid:** Ensure computed reads the observable value. For Set filters, iterate or use Array.from(). For search, read the string value directly.

**Warning signs:** UI doesn't update when changing filters, but works after manual refresh.

### Pitfall 3: Re-rendering All List Items on Filter Change
**What goes wrong:** Changing search query re-renders every list item, even those that remain visible.

**Why it happens:** List items not memoized, or memoization broken by unstable props (inline functions, new objects).

**How to avoid:** Wrap TestListItem in React.memo. Pass stable references (use store methods, not inline functions). Use observer() on ListItem to only re-render when item's own data changes.

**Warning signs:** Profiler shows all ListItems rendering on every keystroke.

### Pitfall 4: Suite Hierarchy Doesn't Match Test Data
**What goes wrong:** Tests grouped by first suite level only, ignoring deep hierarchy.

**Why it happens:** Suite data is array (relations.suite.data) but grouping logic only checks first element.

**How to avoid:** Decide grouping strategy upfront: (1) Group by full path (concatenate all suite titles), (2) Group by top-level suite only, (3) Nested groups (one Collapse per level). Document decision in CONTEXT.md.

**Warning signs:** Users can't find tests because grouping doesn't match expectations.

### Pitfall 5: Navigation Loses Scroll Position
**What goes wrong:** Returning from test detail view resets list scroll to top.

**Why it happens:** Component unmounts when navigating, losing scroll state.

**How to avoid:** (Option 1) Keep list mounted, hide with CSS. (Option 2) Store scroll position in MobX observable before navigating, restore in useEffect. (Option 3) Use CSS `display: none` instead of conditional rendering.

**Warning signs:** User complaints about losing place in list.

### Pitfall 6: Empty Filter Results with No Feedback
**What goes wrong:** User applies filters, sees blank screen, doesn't know why.

**Why it happens:** No UI feedback when filteredResults.length === 0.

**How to avoid:** Show empty state message: "No tests match current filters. [Clear filters]". Include filter summary in UI.

**Warning signs:** Support questions about "tests disappeared."

## Code Examples

Verified patterns from official sources:

### Status Filter with MUI Chips
```typescript
// Source: MUI Chip documentation + Toggle Button patterns
import { Box, Chip } from '@mui/material'
import { observer } from 'mobx-react-lite'

export const TestListFilters = observer(() => {
  const { testResultsStore } = useRootStore()
  const { statusFilters, toggleStatusFilter } = testResultsStore

  const statuses = [
    { value: 'passed', label: 'Passed', color: 'success' },
    { value: 'failed', label: 'Failed', color: 'error' },
    { value: 'broken', label: 'Broken', color: 'warning' },
    { value: 'skipped', label: 'Skipped', color: 'default' },
  ] as const

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {statuses.map(status => (
        <Chip
          key={status.value}
          label={status.label}
          color={status.color}
          variant={statusFilters.has(status.value) ? 'filled' : 'outlined'}
          onClick={() => toggleStatusFilter(status.value)}
        />
      ))}
    </Box>
  )
})
```

### Memoized List Item Component
```typescript
// Source: React performance optimization patterns
import { memo } from 'react'
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { observer } from 'mobx-react-lite'

interface TestListItemProps {
  test: QaseTestResult
  onSelect: (id: string) => void
}

export const TestListItem = memo(observer(({ test, onSelect }: TestListItemProps) => {
  return (
    <ListItem disablePadding>
      <ListItemButton onClick={() => onSelect(test.id)}>
        <ListItemIcon>{getStatusIcon(test.execution.status)}</ListItemIcon>
        <ListItemText
          primary={test.title}
          secondary={`${test.execution.duration}ms`}
        />
      </ListItemButton>
    </ListItem>
  )
}))
```

### Grouping Tests by Suite
```typescript
// Source: Array grouping patterns
// Helper to group tests by top-level suite
const groupBySuite = (tests: QaseTestResult[]) => {
  const grouped = new Map<string, QaseTestResult[]>()

  for (const test of tests) {
    // Get top-level suite title, or 'Uncategorized' if no suite
    const suiteTitle = test.relations?.suite?.data?.[0]?.title || 'Uncategorized'

    if (!grouped.has(suiteTitle)) {
      grouped.set(suiteTitle, [])
    }
    grouped.get(suiteTitle)!.push(test)
  }

  return grouped
}

// Usage in component:
export const TestList = observer(() => {
  const { testResultsStore } = useRootStore()
  const grouped = groupBySuite(testResultsStore.filteredResults)

  return (
    <List>
      {Array.from(grouped.entries()).map(([suite, tests]) => (
        <SuiteGroup key={suite} suite={{ title: suite }} tests={tests} />
      ))}
    </List>
  )
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-virtualized | react-window | 2018 | react-window is smaller, faster, maintained |
| Class components with componentDidUpdate | observer() HOC with MobX | 2019 | MobX eliminates manual subscription management |
| Custom debounce hooks | useEffect cleanup pattern | 2021 | Built-in cleanup prevents leaks |
| Material-UI v4 | MUI v5 (@mui/material) | 2021 | v5 uses Emotion CSS-in-JS, smaller bundle |
| TreeView in @mui/lab | TreeView in @mui/x-tree-view | 2023 | Moved to MUI X, Community (free) version available |

**Deprecated/outdated:**
- **@mui/lab/TreeView:** Moved to @mui/x-tree-view (as of 2023). Use nested List + Collapse for free alternative.
- **withStyles HOC:** Replaced by sx prop in MUI v5. Use sx for inline styles, styled() for reusable components.
- **makeObservable vs makeAutoObservable:** makeAutoObservable is simpler for most cases (MobX 6+).

## Open Questions

1. **Should suite hierarchy be fully nested or single-level grouping?**
   - What we know: Test data has relations.suite.data as array (can be multiple levels)
   - What's unclear: User preference for flat vs nested navigation
   - Recommendation: Start with single-level grouping (top suite only) for MVP. Add nested in future phase if users request it. Add computed getter that builds hierarchy Map for future extensibility.

2. **Do we need virtualization for 1000+ tests?**
   - What we know: react-window adds complexity, but essential for 10k+ items
   - What's unclear: Typical test count for target users
   - Recommendation: Defer virtualization until performance issues confirmed. Add TODO comment in code for future optimization.

3. **Should empty suite groups be hidden or shown?**
   - What we know: Filters can leave suite groups empty
   - What's unclear: Better UX to hide empty groups or show "0 tests" message
   - Recommendation: Hide empty groups, add filter summary showing "Showing X of Y tests" for clarity.

## Sources

### Primary (HIGH confidence)
- [MobX - Deriving information with computeds](https://mobx.js.org/computeds.html) - MobX computed patterns
- [MUI List Component Documentation](https://mui.com/material-ui/react-list/) - List API reference
- [MUI Chip Component](https://mui.com/material-ui/react-chip/) - Chip for filters
- [MUI Toggle Button](https://mui.com/material-ui/react-toggle-button/) - Alternative filter pattern
- [MUI Collapse API](https://mui.com/material-ui/api/collapse/) - Collapsible lists
- [MobX - Running side effects with reactions](https://mobx.js.org/reactions.html) - Reaction patterns
- Project code: src/store/TestResultsStore.ts, src/components/Dashboard/StatsCard.tsx

### Secondary (MEDIUM confidence)
- [MUI TreeView Licensing](https://mui.com/x/introduction/licensing/) - Verified TreeView is paid (Pro) with free Community version
- [MUI nested list pattern GitHub issue](https://github.com/mui/material-ui/issues/5483) - ExpandMore/ExpandLess icon pattern
- [React debouncing best practices](https://www.developerway.com/posts/debouncing-in-react) - useEffect cleanup pattern
- [React list optimization guide](https://federicoterzi.com/blog/optimizing-list-in-react-solving-performance-problems-and-anti-patterns/) - Performance patterns
- [Virtualization in React (Medium)](https://medium.com/@ignatovich.dm/virtualization-in-react-improving-performance-for-large-lists-3df0800022ef) - react-window overview

### Tertiary (LOW confidence, flagged for validation)
- WebSearch results about MUI List filtering - No official docs retrieved, only CSS
- WebSearch results about react-window MUI integration - Community patterns, not official
- Various blog posts about React performance - Multiple sources but not authoritative

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project except @mui/icons-material (standard MUI library)
- Architecture: HIGH - MobX computed and MUI List patterns verified with official docs
- Pitfalls: MEDIUM - Based on community experience and performance guides, not project-specific testing
- Code examples: HIGH - Patterns verified with MobX/MUI official docs and existing project conventions

**Research date:** 2026-02-09
**Valid until:** 2026-03-09 (30 days - stable ecosystem)
