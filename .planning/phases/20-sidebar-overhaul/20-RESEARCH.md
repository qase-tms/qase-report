# Phase 20: Sidebar Overhaul - Research

**Researched:** 2026-02-10
**Domain:** MUI Navigation, Progress Visualization, Filter Chips
**Confidence:** HIGH

## Summary

This phase enhances the existing `NavigationDrawer` component to include stats visualization (pass rate ring, quick stats) and filter chips. The codebase already has working patterns for both circular progress visualization (`ProgressRingCard`) and chip-based filtering (`TestListFilters`). The implementation can largely reuse these existing patterns.

Key insight: The existing `ProgressRingCard` component demonstrates the exact two-CircularProgress overlay technique needed for the pass rate ring. The `TestListFilters` and `StabilityGradeFilter` components show working chip toggle patterns using MobX stores. This phase is primarily about composing existing patterns into the sidebar, not inventing new approaches.

**Primary recommendation:** Extend `NavigationDrawer` with three new sections (stats ring, quick stats, filter chips) positioned between navigation items and the collapse toggle, reusing existing patterns from Dashboard and TestList components.

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | ^5.12.0 | UI components (Drawer, CircularProgress, Chip, List) | Already used throughout codebase |
| @mui/icons-material | ^5.18.0 | Navigation icons (Dashboard, Assignment, etc.) | Already imported in NavigationDrawer |
| mobx | ^6.9.0 | State management for filters | Already manages filter state in TestResultsStore |
| mobx-react-lite | ^3.4.3 | React bindings | Already used for observer() pattern |

### No New Dependencies Needed

All required functionality exists in current stack:
- `CircularProgress` - for pass rate ring (already used in ProgressRingCard)
- `Chip` - for filter chips (already used in TestListFilters)
- `Box`, `Typography`, `Divider` - for layout (standard MUI)

## Architecture Patterns

### Current NavigationDrawer Structure
```
NavigationDrawer (permanent Drawer, left anchor)
├── Toolbar (spacer for AppBar)
├── List (navigation items)
│   ├── ListItemButton (Dashboard) [DashboardIcon]
│   ├── ListItemButton (Tests) [AssignmentIcon]
│   └── ListItemButton (Analytics) [AnalyticsIcon]
├── Box (flexGrow spacer)
└── Box (collapse toggle button)
```

### Proposed Enhanced Structure
```
NavigationDrawer (permanent Drawer, left anchor)
├── Toolbar (spacer for AppBar)
├── Box (stats section - only when expanded)
│   ├── PassRateRing (CircularProgress overlay)
│   └── QuickStats (passed/failed/flaky counts)
├── Divider
├── List (navigation items)
│   ├── ListItemButton (Dashboard) [DashboardIcon]
│   ├── ListItemButton (Tests) [AssignmentIcon/BugReportIcon]
│   ├── ListItemButton (Failure Clusters) [ErrorOutlineIcon/GroupWorkIcon]
│   ├── ListItemButton (Gallery) [CollectionsIcon/PhotoLibraryIcon]
│   └── ListItemButton (Comparison) [CompareArrowsIcon]
├── Divider
├── Box (filter chips section - only when expanded)
│   ├── Typography ("Filters" label)
│   ├── Status chips (passed/failed/broken/skipped)
│   └── Grade chips (A+/A/B/C/D/F)
├── Box (flexGrow spacer)
└── Box (collapse toggle button)
```

### Pattern 1: Circular Progress Ring (from ProgressRingCard)
**What:** Two overlapping CircularProgress components - background track + foreground value
**When to use:** Pass rate visualization in sidebar
**Example (already in codebase):**
```typescript
// Source: src/components/Dashboard/ProgressRingCard.tsx
<Box sx={{ position: 'relative', display: 'inline-flex' }}>
  {/* Background ring (track) */}
  <CircularProgress
    variant="determinate"
    value={100}
    size={size}
    thickness={thickness}
    sx={{ color: 'action.hover' }}
  />
  {/* Foreground ring (progress) */}
  <CircularProgress
    variant="determinate"
    value={value}
    size={size}
    thickness={thickness}
    sx={{
      position: 'absolute',
      left: 0,
      color: getColor(value),
    }}
  />
  {/* Centered percentage label */}
  <Box sx={{ /* centering styles */ }}>
    <Typography variant="h5">{Math.round(value)}%</Typography>
  </Box>
</Box>
```

### Pattern 2: Toggle Chip Filters (from TestListFilters)
**What:** Chip components with filled/outlined variants based on filter state
**When to use:** Status and grade filter chips in sidebar
**Example (already in codebase):**
```typescript
// Source: src/components/TestList/TestListFilters.tsx
<Chip
  key={status.value}
  label={status.label}
  color={status.color}
  variant={statusFilters.has(status.value) ? 'filled' : 'outlined'}
  onClick={() => toggleStatusFilter(status.value)}
  size="small"
/>
```

### Pattern 3: Responsive Sidebar Content
**What:** Show/hide content based on `isNavigationCollapsed` state
**When to use:** Stats and filters sections should hide when collapsed
**Example:**
```typescript
// Only render stats section when expanded
{!isNavigationCollapsed && (
  <Box sx={{ p: 2 }}>
    {/* Stats content */}
  </Box>
)}
```

### Anti-Patterns to Avoid
- **Duplicating filter state:** Don't create new filter state - use existing `testResultsStore.statusFilters` and `testResultsStore.stabilityGradeFilters`
- **Breaking MobX reactivity:** Always wrap filter-consuming components with `observer()`
- **Hardcoding stats:** Use computed values from `reportStore` (passRate, totalTests) and `analyticsStore` (flakyTestCount)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Circular progress ring | Custom SVG | MUI CircularProgress overlay pattern | Already proven in ProgressRingCard |
| Filter toggle state | Custom useState | TestResultsStore.statusFilters/stabilityGradeFilters | MobX handles persistence and reactivity |
| Color-coded value display | Manual color logic | Existing getColor() pattern from ProgressRingCard | Consistent thresholds (80%/50%) |
| Navigation icons | Custom icons | @mui/icons-material | 2100+ pre-made Material Design icons |

## Common Pitfalls

### Pitfall 1: Filter State Duplication
**What goes wrong:** Creating local filter state instead of using MobX store
**Why it happens:** Developer unfamiliar with existing TestResultsStore pattern
**How to avoid:** Import and use `useRootStore()` to access `testResultsStore.statusFilters`
**Warning signs:** `useState` for filter values, filters not persisting between views

### Pitfall 2: Breaking Collapsed State
**What goes wrong:** Stats/filters visible even when sidebar collapsed, breaking layout
**Why it happens:** Forgetting to check `isNavigationCollapsed` before rendering content
**How to avoid:** Wrap all non-icon content with `{!isNavigationCollapsed && (...)}`
**Warning signs:** Content overflow in collapsed state, visual clipping

### Pitfall 3: Missing observer() Wrapper
**What goes wrong:** Component doesn't re-render when MobX state changes
**Why it happens:** Forgetting to wrap component with `observer()` from mobx-react-lite
**How to avoid:** NavigationDrawer is already wrapped - ensure any new sub-components are too
**Warning signs:** Chips not updating visual state when clicked

### Pitfall 4: Accessing Stats Before Report Loaded
**What goes wrong:** Error or NaN when accessing `reportStore.passRate` before data loaded
**Why it happens:** Stats accessed without checking if report is loaded
**How to avoid:** Check `reportStore.runData` exists before rendering stats section
**Warning signs:** "0%" or "NaN%" displayed initially, errors in console

## Code Examples

### Recommended Icon Choices for Navigation

```typescript
// Source: @mui/icons-material (official MUI icons)
import {
  Dashboard as DashboardIcon,        // Dashboard view
  Assignment as AssignmentIcon,      // Tests list (current)
  BugReport as BugReportIcon,        // Alternative: Tests (bug-focused)
  ErrorOutline as ErrorOutlineIcon,  // Failure Clusters
  GroupWork as GroupWorkIcon,        // Alternative: Failure Clusters (grouping)
  Collections as CollectionsIcon,    // Gallery (image collection)
  PhotoLibrary as PhotoLibraryIcon,  // Alternative: Gallery
  CompareArrows as CompareArrowsIcon,// Comparison view
  Analytics as AnalyticsIcon,        // Analytics (current)
} from '@mui/icons-material'
```

### Quick Stats Display Pattern

```typescript
// Source: Pattern derived from Dashboard/index.tsx stats display
const QuickStats = observer(() => {
  const { reportStore, analyticsStore } = useRootStore()
  const stats = reportStore.runData?.stats

  if (!stats) return null

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-around', py: 1 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="success.main">{stats.passed}</Typography>
        <Typography variant="caption" color="text.secondary">Passed</Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="error.main">{stats.failed}</Typography>
        <Typography variant="caption" color="text.secondary">Failed</Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" color="warning.main">{analyticsStore.flakyTestCount}</Typography>
        <Typography variant="caption" color="text.secondary">Flaky</Typography>
      </Box>
    </Box>
  )
})
```

### Compact Filter Chips for Sidebar

```typescript
// Source: Adapted from TestListFilters.tsx for sidebar context
const SidebarFilters = observer(() => {
  const { testResultsStore } = useRootStore()
  const { statusFilters, toggleStatusFilter, stabilityGradeFilters, toggleStabilityGradeFilter } = testResultsStore

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        Status
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
        {['passed', 'failed', 'broken', 'skipped'].map(status => (
          <Chip
            key={status}
            label={status}
            size="small"
            variant={statusFilters.has(status) ? 'filled' : 'outlined'}
            onClick={() => toggleStatusFilter(status)}
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" gutterBottom>
        Grade
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {['A+', 'A', 'B', 'C', 'D', 'F'].map(grade => (
          <Chip
            key={grade}
            label={grade}
            size="small"
            variant={stabilityGradeFilters.has(grade) ? 'filled' : 'outlined'}
            onClick={() => toggleStabilityGradeFilter(grade)}
          />
        ))}
      </Box>
    </Box>
  )
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom SVG progress | MUI CircularProgress variant="determinate" | MUI 5 | Simpler, theme-aware |
| CSS variables for track | enableTrackSlot prop (MUI v6+) | MUI 6 | Native track support |
| useState for filters | MobX observables | Project convention | Centralized, persistent |

**Note on enableTrackSlot:** MUI v6 introduced `enableTrackSlot` prop for native background track support. However, current project uses MUI v5.12.0, so the two-CircularProgress overlay pattern (already used in ProgressRingCard) remains the correct approach.

## Available Data for Stats

From existing stores (no new computation needed):

| Metric | Source | Type |
|--------|--------|------|
| Pass rate | `reportStore.passRate` | number (0-100) |
| Total tests | `reportStore.totalTests` | number |
| Passed count | `reportStore.runData?.stats.passed` | number |
| Failed count | `reportStore.runData?.stats.failed` | number |
| Skipped count | `reportStore.runData?.stats.skipped` | number |
| Broken count | `reportStore.brokenCount` | number |
| Flaky count | `analyticsStore.flakyTestCount` | number |
| Status filters | `testResultsStore.statusFilters` | Set<string> |
| Grade filters | `testResultsStore.stabilityGradeFilters` | Set<StabilityGrade> |
| Active filter count | `testResultsStore.activeFilterCount` | number |

## Open Questions

1. **New Navigation Views (Failure Clusters, Gallery, Comparison)**
   - What we know: Phase mentions these navigation items but they don't exist in codebase yet
   - What's unclear: Are these views being implemented in this phase or future phases?
   - Recommendation: Add navigation items with icons now, show "Coming Soon" placeholder if views don't exist

2. **Collapsed State Indicator**
   - What we know: When collapsed, only icons visible
   - What's unclear: Should active filters show badge count on collapsed icon?
   - Recommendation: Consider small badge on filter-related nav item showing `activeFilterCount`

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/components/Dashboard/ProgressRingCard.tsx` - circular progress pattern
- Codebase analysis: `src/components/TestList/TestListFilters.tsx` - chip filter pattern
- Codebase analysis: `src/components/NavigationDrawer/index.tsx` - current navigation structure
- Codebase analysis: `src/store/TestResultsStore.ts` - filter state management

### Secondary (MEDIUM confidence)
- [MUI CircularProgress API](https://mui.com/material-ui/api/circular-progress/) - props reference
- [MUI Chip API](https://mui.com/material-ui/api/chip/) - props reference
- [MUI Material Icons](https://mui.com/material-ui/material-icons/) - icon selection

### Tertiary (LOW confidence)
- Web search for MUI v6 enableTrackSlot (not applicable to current v5 version)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use
- Architecture: HIGH - patterns already exist in codebase
- Pitfalls: HIGH - based on direct code analysis

**Research date:** 2026-02-10
**Valid until:** 90 days (stable MUI v5 ecosystem, no breaking changes expected)
