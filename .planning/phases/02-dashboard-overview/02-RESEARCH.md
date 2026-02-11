# Phase 2: Dashboard Overview - Research

**Researched:** 2026-02-09
**Domain:** React dashboard UI with MUI components and MobX state management
**Confidence:** HIGH

## Summary

Phase 2 requires building a dashboard to display test run statistics (passed/failed/skipped/broken with percentages), run metadata (title, environment, duration), and host information (system, machine, python version). The data is already available in ReportStore.runData from Phase 1.

The standard approach uses MUI Card components arranged in a responsive Grid layout, with computed MobX getters for derived statistics (percentages, formatted durations), and observer components for automatic reactivity. The primary challenges are safe percentage calculations (zero-division handling), duration formatting from milliseconds, and responsive layout across breakpoints.

**Primary recommendation:** Use MUI Grid with Card/CardContent components, add computed getters to ReportStore for derived values, and create dedicated dashboard components wrapped with observer for automatic updates.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | ^5.12.0 | UI components (Card, Grid, Typography) | Already in project, Material Design system with comprehensive dashboard components |
| mobx | ^6.9.0 | Computed values for statistics | Already in project, provides efficient caching and reactive updates |
| mobx-react-lite | ^3.4.3 | observer HOC for components | Already in project, minimal re-renders with automatic dependency tracking |
| react | ^18.2.0 | Component framework | Already in project |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None required | - | All needs met by existing stack | Duration formatting can be done manually (no library needed for simple HH:MM:SS) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual duration formatting | pretty-ms or humanize-duration | Libraries add bundle size; manual implementation is ~10 lines for HH:MM:SS format |
| MUI Grid v2 | CSS Grid or Flexbox | MUI Grid provides built-in responsive breakpoints and theme integration already in use |
| Custom Card styling | MUI Paper + Box | Card provides semantic structure with CardContent/CardHeader out of the box |

**Installation:**
No additional packages required - all dependencies already present in package.json.

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── Dashboard/          # New dashboard components
│   │   ├── index.tsx       # Main dashboard container (observer)
│   │   ├── StatsCard.tsx   # Reusable statistics card
│   │   ├── RunInfoCard.tsx # Run metadata display
│   │   └── HostInfoCard.tsx # Host data display
├── store/
│   ├── ReportStore.ts      # Add computed getters for percentages, formatted duration
└── utils/                  # Optional
    └── formatters.ts       # Duration/number formatting helpers
```

### Pattern 1: MUI Grid Responsive Layout
**What:** 12-column grid system with 5 breakpoints (xs: 0px, sm: 600px, md: 900px, lg: 1200px, xl: 1536px)
**When to use:** All dashboard layouts requiring responsive behavior
**Example:**
```typescript
// Source: https://mui.com/material-ui/react-grid/
<Grid container spacing={2}>
  <Grid item xs={12} md={6} lg={3}>
    <Card>
      <CardContent>Statistics</CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} md={6} lg={3}>
    <Card>
      <CardContent>Run Info</CardContent>
    </Card>
  </Grid>
</Grid>
```

### Pattern 2: MobX Computed Getters for Derived Statistics
**What:** Computed values cache derived data and only recompute when observables change
**When to use:** Any derived statistics (percentages, formatted values) that don't require arguments
**Example:**
```typescript
// Source: https://mobx.js.org/computeds.html
// Already in ReportStore.ts (lines 53-66)
get totalTests(): number {
  return this.runData?.stats.total || 0
}

get passRate(): number {
  if (!this.runData || this.runData.stats.total === 0) {
    return 0
  }
  return (this.runData.stats.passed / this.runData.stats.total) * 100
}

// Add similar computed getters for failed, skipped, broken percentages
get failedRate(): number {
  if (!this.runData || this.runData.stats.total === 0) {
    return 0
  }
  return (this.runData.stats.failed / this.runData.stats.total) * 100
}
```

### Pattern 3: Observer Components with MUI Cards
**What:** Wrap components with observer() to automatically re-render when computed values change
**When to use:** Any component displaying MobX store data
**Example:**
```typescript
// Source: https://mobx.js.org/react-integration.html + https://mui.com/material-ui/react-card/
import { observer } from 'mobx-react-lite'
import { Card, CardContent, Typography } from '@mui/material'
import { useRootStore } from '../../store'

export const StatsCard = observer(() => {
  const { reportStore } = useRootStore()

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Passed</Typography>
        <Typography variant="h3">{reportStore.runData?.stats.passed || 0}</Typography>
        <Typography variant="body2" color="text.secondary">
          {reportStore.passRate.toFixed(1)}%
        </Typography>
      </CardContent>
    </Card>
  )
})
```

### Pattern 4: Safe Percentage Calculation
**What:** Always check for zero divisor before calculating percentages
**When to use:** Every percentage calculation
**Example:**
```typescript
// Source: https://codepal.ai/code-generator/query/NMcxEtkG/typescript-function-calculate-percentage-div0-error
const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) {
    return 0
  }
  return (value / total) * 100
}
```

### Pattern 5: Duration Formatting from Milliseconds
**What:** Convert milliseconds to human-readable format (HH:MM:SS or "X minutes Y seconds")
**When to use:** Displaying execution.duration or execution.cumulative_duration
**Example:**
```typescript
// Source: https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-230.php
const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}
```

### Anti-Patterns to Avoid
- **Storing computed values in state:** Don't use useState for percentages - use MobX computed getters instead (they automatically update)
- **Computing values in render:** Don't calculate percentages in JSX - use computed getters (avoids recalculation on every render)
- **Forgetting observer wrapper:** Components using store data must be wrapped with observer() or they won't re-render on changes
- **Not handling null/undefined:** ReportStore.runData is null before loading - always use optional chaining or null checks

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive grid system | Custom media queries + flex/grid | MUI Grid with breakpoint props | Already in project, handles 12-column math, spacing, and theme integration automatically |
| Card elevation/shadows | Custom box-shadow CSS | MUI Card component | Provides semantic structure, theme-aware shadows (elevation prop 0-24), consistent styling |
| Typography scaling | Custom font-size media queries | MUI Typography with variant prop | Theme-aware sizing, responsive by default, follows Material Design type scale |
| State management for statistics | Local useState + useEffect | MobX computed values | Already integrated, automatic caching, zero boilerplate, no manual dependency arrays |

**Key insight:** MUI and MobX already solve layout responsiveness and reactive state management. Custom solutions add complexity without benefit and break theme consistency.

## Common Pitfalls

### Pitfall 1: Division by Zero in Percentage Calculations
**What goes wrong:** Dividing by stats.total when no tests exist returns Infinity or NaN
**Why it happens:** Empty run.json or zero total tests
**How to avoid:** Always check if total === 0 before dividing, return 0 for empty datasets
**Warning signs:** Seeing "Infinity%", "NaN%", or React errors about rendering non-finite numbers
**Example:**
```typescript
// BAD
get passRate(): number {
  return (this.runData.stats.passed / this.runData.stats.total) * 100
}

// GOOD (already in ReportStore.ts line 61-65)
get passRate(): number {
  if (!this.runData || this.runData.stats.total === 0) {
    return 0
  }
  return (this.runData.stats.passed / this.runData.stats.total) * 100
}
```

### Pitfall 2: Not Wrapping Components with observer()
**What goes wrong:** Component displays stale data, doesn't update when store changes
**Why it happens:** MobX requires observer() HOC to track dependencies and trigger re-renders
**How to avoid:** Wrap all components that access store data with observer()
**Warning signs:** Dashboard shows old values after loading new report, manual refresh needed
**Example:**
```typescript
// BAD
export const Dashboard = () => {
  const { reportStore } = useRootStore()
  return <div>{reportStore.totalTests}</div>
}

// GOOD (see MainLayout/index.tsx line 7 for pattern)
export const Dashboard = observer(() => {
  const { reportStore } = useRootStore()
  return <div>{reportStore.totalTests}</div>
})
```

### Pitfall 3: MUI Grid Negative Margin Causing Horizontal Scroll
**What goes wrong:** Grid with spacing creates negative margins that extend beyond viewport
**Why it happens:** MUI Grid uses negative margin to offset child spacing, can overflow container
**How to avoid:** Wrap Grid in a container with proper padding, or use spacing={0} on outermost Grid
**Warning signs:** Horizontal scrollbar appears, content shifts left, Grid appears misaligned
**Source:** https://github.com/mui/material-ui/issues/29379

### Pitfall 4: Accessing runData Without Null Checks
**What goes wrong:** Runtime errors "Cannot read property 'stats' of null"
**Why it happens:** runData is null before user loads a report
**How to avoid:** Use optional chaining (?.) or explicit null checks before accessing runData properties
**Warning signs:** App crashes on mount, errors in console about null properties
**Example:**
```typescript
// BAD
<Typography>{reportStore.runData.title}</Typography>

// GOOD
<Typography>{reportStore.runData?.title || 'No report loaded'}</Typography>
```

### Pitfall 5: Over-Nesting Grid Items
**What goes wrong:** Grid items incorrectly nested (Grid item contains Grid container without proper structure)
**Why it happens:** Misunderstanding that Grid with container prop shouldn't also have item prop
**How to avoid:** Grid containers and Grid items are separate - don't mix container and item props on same element
**Warning signs:** Layout breaks, spacing inconsistent, responsive breakpoints don't work
**Source:** https://blog.logrocket.com/mui-grid-system/

### Pitfall 6: MobX Computed Returning New Objects Without .struct
**What goes wrong:** Computed getter returns new object/array on every access, triggers unnecessary re-renders
**Why it happens:** JavaScript object equality is by reference, not by value
**How to avoid:** For this phase, computed getters return primitives (numbers/strings), no issue. If returning objects later, use computed.struct
**Warning signs:** Dashboard re-renders excessively, performance degradation with large datasets
**Source:** https://alexhisen.gitbook.io/mobx-recipes/use-computedstruct-for-computed-objects

### Pitfall 7: Unnecessary Re-renders Without React.memo
**What goes wrong:** Child components re-render when parent updates, even if their props haven't changed
**Why it happens:** React's default behavior is to re-render all children when parent re-renders
**How to avoid:** For this simple dashboard, observer() already optimizes re-renders. Only use React.memo if profiling shows performance issues
**Warning signs:** Slow dashboard updates, multiple cards flashing on every change
**Source:** https://blog.sentry.io/react-js-performance-guide/

## Code Examples

Verified patterns from official sources:

### MUI Card with Statistics Display
```typescript
// Source: https://mui.com/material-ui/react-card/
import { Card, CardContent, Typography, Box } from '@mui/material'

<Card elevation={2}>
  <CardContent>
    <Typography variant="overline" color="text.secondary" gutterBottom>
      Passed Tests
    </Typography>
    <Typography variant="h3" component="div">
      {reportStore.runData?.stats.passed || 0}
    </Typography>
    <Typography variant="body2" color="success.main">
      {reportStore.passRate.toFixed(1)}%
    </Typography>
  </CardContent>
</Card>
```

### MUI Grid Responsive Dashboard Layout
```typescript
// Source: https://mui.com/material-ui/react-grid/
<Grid container spacing={3}>
  {/* Statistics cards - 4 columns on desktop, 2 on tablet, 1 on mobile */}
  <Grid item xs={12} sm={6} md={3}>
    <StatsCard status="passed" />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatsCard status="failed" />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatsCard status="skipped" />
  </Grid>
  <Grid item xs={12} sm={6} md={3}>
    <StatsCard status="broken" />
  </Grid>

  {/* Metadata cards - 2 columns on desktop, 1 on mobile */}
  <Grid item xs={12} md={6}>
    <RunInfoCard />
  </Grid>
  <Grid item xs={12} md={6}>
    <HostInfoCard />
  </Grid>
</Grid>
```

### MobX Computed Getters for All Statistics
```typescript
// Source: https://mobx.js.org/computeds.html
// Add to src/store/ReportStore.ts after existing getters

get failedRate(): number {
  if (!this.runData || this.runData.stats.total === 0) {
    return 0
  }
  return (this.runData.stats.failed / this.runData.stats.total) * 100
}

get skippedRate(): number {
  if (!this.runData || this.runData.stats.total === 0) {
    return 0
  }
  return (this.runData.stats.skipped / this.runData.stats.total) * 100
}

get brokenRate(): number {
  if (!this.runData || this.runData.stats.total === 0) {
    return 0
  }
  return (this.runData.stats.broken / this.runData.stats.total) * 100
}

get formattedDuration(): string {
  if (!this.runData) return '0s'

  const ms = this.runData.execution.duration
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}
```

### Observer Component Pattern
```typescript
// Source: https://mobx.js.org/react-integration.html
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'

export const Dashboard = observer(() => {
  const { reportStore } = useRootStore()

  // Component automatically re-renders when accessed computed values change
  // No need for useEffect, useMemo, or manual dependency tracking

  if (!reportStore.runData) {
    return <Typography>No report loaded</Typography>
  }

  return (
    <Grid container spacing={3}>
      {/* Dashboard content */}
    </Grid>
  )
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MUI Grid v1 with Grid prop | MUI Grid v2 (new Grid2 component) | MUI v5.13.0 (June 2023) | Project uses v5.12.0 - stick with current Grid, v2 is separate import |
| Class components with mobx | Functional components with mobx-react-lite | mobx-react-lite v3 (2020) | Already using this pattern (see MainLayout) |
| Manual responsive breakpoints | MUI responsive prop objects | Always been standard | Use size={{xs: 12, md: 6}} not separate props |
| Custom CSS for elevation | MUI elevation prop | MUI v5+ standard | Use elevation={2} on Card instead of custom shadows |

**Deprecated/outdated:**
- MUI Grid v1 spacing={2} as number only - now supports responsive spacing={{xs: 2, md: 3}} but current project uses simple numbers (fine for this use case)
- makeObservable() decorator syntax - project uses makeAutoObservable() (simpler, recommended)

## Open Questions

1. **Should duration display millisecond precision?**
   - What we know: execution.duration is in milliseconds, typical values range from seconds to hours
   - What's unclear: User preference for precision (HH:MM:SS vs "5 minutes 23 seconds" vs "5.4 minutes")
   - Recommendation: Start with HH:MM:SS format (most common for test reports), add formatting options later if requested

2. **How to handle missing environment field?**
   - What we know: environment is optional/nullable in schema (QaseRun.schema.ts line 142)
   - What's unclear: Display strategy when null (hide field, show "N/A", show empty string)
   - Recommendation: Display "N/A" or "Not specified" for better UX than empty space

3. **Should host_data.python be displayed prominently?**
   - What we know: python field is optional (QaseRun.schema.ts line 125), tests might be Node.js only
   - What's unclear: Importance to users (is it always relevant?)
   - Recommendation: Display in HostInfoCard with conditional rendering (only show if present)

4. **Color coding for test statuses?**
   - What we know: Standard is green (passed), red (failed), gray (skipped), yellow (broken)
   - What's unclear: MUI theme color mappings (success.main, error.main, etc.)
   - Recommendation: Use MUI semantic colors (success.main for passed, error.main for failed, warning.main for broken, text.secondary for skipped)

## Sources

### Primary (HIGH confidence)
- MUI Card Component - https://mui.com/material-ui/react-card/
- MUI Grid Component - https://mui.com/material-ui/react-grid/
- MUI Typography - https://mui.com/material-ui/react-typography/
- MobX Computed Values - https://mobx.js.org/computeds.html
- MobX React Integration - https://mobx.js.org/react-integration.html
- Project codebase: src/store/ReportStore.ts, src/schemas/QaseRun.schema.ts

### Secondary (MEDIUM confidence)
- MUI Grid System Guide - https://blog.logrocket.com/mui-grid-system/
- MUI Stack Component - https://mui.com/material-ui/react-stack/
- ReportPortal Dashboard Patterns - https://reportportal.io/docs/dashboards-and-widgets/OverallStatistics/
- React Performance Guide - https://blog.sentry.io/react-js-performance-guide/
- MobX Recipes (computed.struct) - https://alexhisen.gitbook.io/mobx-recipes/use-computedstruct-for-computed-objects

### Tertiary (LOW confidence - community examples)
- Duration formatting examples - https://www.w3resource.com/javascript-exercises/fundamental/javascript-fundamental-exercise-230.php
- Test status color conventions - https://allurereport.org/docs/test-statuses/

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project, official MUI/MobX docs available
- Architecture: HIGH - MUI Grid and MobX patterns well-documented with official examples
- Pitfalls: HIGH - Common issues documented in GitHub issues, LogRocket, and official docs
- Code examples: HIGH - Derived from official MUI/MobX documentation and existing project code

**Research date:** 2026-02-09
**Valid until:** ~30 days (MUI/MobX are stable, no breaking changes expected)

**Notes:**
- No CONTEXT.md exists for this phase, full freedom in approach
- ReportStore already has computed getter examples (totalTests, passRate) to follow
- MainLayout already demonstrates observer pattern to replicate
- All required data structures defined in QaseRun.schema.ts
