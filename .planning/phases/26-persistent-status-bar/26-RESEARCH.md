# Phase 26: Persistent Status Bar - Research

**Researched:** 2026-02-11
**Domain:** MUI AppBar layout, compact status visualization, persistent UI patterns
**Confidence:** HIGH

## Summary

This phase adds persistent status information to the AppBar, ensuring run status and statistics are always visible regardless of scroll position or active view. The codebase already has working patterns for circular progress visualization (ProgressRingCard with 80px size in Phase 20) and run metadata display (RunDateDisplay). The implementation primarily involves composing existing patterns into a compact AppBar component.

Key insight: The AppBar already contains a hamburger menu (Phase 25) and uses `variant="dense"` with flexbox layout for multiple elements. The status bar component must be compact (fitting within 48px toolbar height) and reuse the existing two-CircularProgress overlay pattern at a smaller size (32-40px vs 80px in sidebar).

**Primary recommendation:** Create StatusBarPill component with compact pass rate ring (32-40px), quick stats text, and run metadata. Position in AppBar between title and actions using flexbox. Wrap with observer() for MobX reactivity. Reuse ProgressRingCard's color logic and CircularProgress pattern.

## Standard Stack

### Core (Already in Project)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @mui/material | ^5.12.0 | UI components (AppBar, Toolbar, CircularProgress, Typography, Box, Chip) | Already used throughout codebase |
| mobx | ^6.9.0 | State management for reactive status updates | Already manages reportStore and analyticsStore |
| mobx-react-lite | ^3.4.3 | React bindings | Already used for observer() pattern |

### No New Dependencies Needed

All required functionality exists in current stack:
- `CircularProgress` - for compact pass rate ring (already used in ProgressRingCard)
- `Chip` - optional for status count pills (already used in filters)
- `Box`, `Typography` - for layout and text (standard MUI)
- `Toolbar` with variant="dense" - already in use in AppBar

## Architecture Patterns

### Current AppBar Structure (After Phase 25)
```
App.tsx
└── AppBar (position="fixed", zIndex: drawer + 1)
    └── Toolbar (variant="dense", height: 48px)
        ├── IconButton (Hamburger menu)
        ├── Typography (Title: "Qase | Report")
        ├── Box (flexGrow: 1, center: RunDateDisplay)
        └── Box (Actions: Search, Export, ThemeToggle)
```

### Proposed Enhanced Structure
```
App.tsx
└── AppBar (position="fixed", zIndex: drawer + 1)
    └── Toolbar (variant="dense", height: 48px)
        ├── IconButton (Hamburger menu)
        ├── Typography (Title: "Qase | Report")
        ├── Box (flexGrow: 1, center: StatusBarPill)  ← NEW (replaces RunDateDisplay)
        └── Box (Actions: Search, Export, ThemeToggle)
```

StatusBarPill internal structure:
```
StatusBarPill (observer component)
├── CircularProgress (compact pass rate ring 32-40px)
├── Box (quick stats text: "N passed, M failed, K flaky")
└── Typography (run metadata: date, duration)
```

### Pattern 1: Compact Circular Progress (Scaled from ProgressRingCard)
**What:** Two overlapping CircularProgress components at smaller size (32-40px vs 80px)
**When to use:** Pass rate visualization in AppBar toolbar
**Example (adapted from ProgressRingCard):**
```typescript
// Source: Adapted from src/components/Dashboard/ProgressRingCard.tsx
<Box sx={{ position: 'relative', display: 'inline-flex' }}>
  {/* Background ring (track) */}
  <CircularProgress
    variant="determinate"
    value={100}
    size={32}  // Reduced from 80px (Phase 20 decision)
    thickness={4}
    sx={{ color: 'action.hover' }}
  />
  {/* Foreground ring (progress) */}
  <CircularProgress
    variant="determinate"
    value={passRate}
    size={32}
    thickness={4}
    sx={{
      position: 'absolute',
      left: 0,
      color: getColor(passRate),  // Reuse ProgressRingCard color logic
    }}
  />
  {/* Optional: Centered percentage label (may be too small at 32px) */}
  <Box sx={{
    position: 'absolute',
    top: 0, left: 0, bottom: 0, right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Typography variant="caption" fontSize="0.625rem">
      {Math.round(passRate)}%
    </Typography>
  </Box>
</Box>
```

### Pattern 2: Compact Quick Stats Text
**What:** Horizontal text display showing passed/failed/flaky counts
**When to use:** Status overview in limited AppBar space
**Example:**
```typescript
// Compact text format instead of vertical stat boxes
<Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
  <Typography variant="body2" color="success.main">
    {stats.passed} passed
  </Typography>
  <Typography variant="body2" color="error.main">
    {stats.failed} failed
  </Typography>
  {analyticsStore.flakyTestCount > 0 && (
    <Typography variant="body2" color="warning.main">
      {analyticsStore.flakyTestCount} flaky
    </Typography>
  )}
</Box>
```

### Pattern 3: Run Metadata Display (from RunDateDisplay)
**What:** Show run date and optional duration in compact format
**When to use:** Run context in AppBar
**Example (already exists in RunDateDisplay):**
```typescript
// Source: src/components/RunDateDisplay/index.tsx
const startTime = reportStore.runData.execution.start_time
const formattedDate = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(startTime))

// Additional: duration from reportStore.formattedDuration
<Typography variant="body2" color="text.secondary">
  {formattedDate} • {reportStore.formattedDuration}
</Typography>
```

### Pattern 4: Flexbox Layout for Multiple AppBar Elements
**What:** Use flexGrow and gap properties to distribute elements in Toolbar
**When to use:** Positioning multiple components in constrained AppBar space
**Example:**
```typescript
// Source: Current App.tsx Toolbar structure
<Toolbar variant="dense">
  <IconButton edge="start" sx={{ mr: 2 }}>...</IconButton>
  <Typography variant="h6">Title</Typography>
  <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
    {/* Center section: StatusBarPill */}
  </Box>
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {/* Right section: Actions */}
  </Box>
</Toolbar>
```

### Anti-Patterns to Avoid
- **Hardcoding stats:** Use computed values from reportStore and analyticsStore
- **Breaking dense toolbar height:** StatusBarPill must fit within 48px Toolbar (dense variant height)
- **Rendering without data:** Always guard with `if (!reportStore.runData) return null`
- **Forgetting observer():** StatusBarPill MUST wrap with observer() for MobX reactivity
- **Duplicating RunDateDisplay:** StatusBarPill replaces RunDateDisplay, don't render both

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Circular progress ring | Custom SVG donut chart | MUI CircularProgress overlay pattern | Already proven in ProgressRingCard, theme-aware colors |
| Date formatting | Manual string manipulation | Intl.DateTimeFormat | Already used in RunDateDisplay, locale-aware |
| Duration formatting | Custom time calculation | reportStore.formattedDuration | Already computed in ReportStore |
| Color-coded values | Manual color logic | Existing getColor() pattern from ProgressRingCard | Consistent thresholds (80%/50%) |
| Responsive layout | Custom media queries | MUI sx prop with theme breakpoints | Theme-aware, consistent with existing patterns |

## Common Pitfalls

### Pitfall 1: Toolbar Overflow on Small Screens
**What goes wrong:** StatusBarPill too wide, elements wrap or overflow toolbar
**Why it happens:** Not considering mobile viewport widths (320-768px)
**How to avoid:**
- Use responsive display: hide some elements on mobile with `sx={{ display: { xs: 'none', sm: 'flex' } }}`
- Test at 360px width (common mobile size)
- Consider abbreviating text ("15 P, 3 F" instead of "15 passed, 3 failed")
**Warning signs:** Horizontal scroll in AppBar, elements overlapping, toolbar height exceeding 48px

### Pitfall 2: Pass Rate Ring Too Small to Read
**What goes wrong:** 32px ring with percentage text is illegible
**Why it happens:** Trying to fit too much info in compact space
**How to avoid:** Either show ring without text, or use 40px size with smaller font (0.625rem)
**Warning signs:** Percentage text overlaps ring, unclear at normal reading distance

### Pitfall 3: Accessing Stats Before Report Loaded
**What goes wrong:** Error or NaN when accessing reportStore.runData before data loaded
**Why it happens:** StatusBarPill renders immediately, report loads async
**How to avoid:**
```typescript
if (!reportStore.runData) return null
```
Guard at top of component
**Warning signs:** "0%" or "NaN%" displayed initially, console errors about null access

### Pitfall 4: Missing observer() Wrapper
**What goes wrong:** StatusBarPill doesn't update when report loads or stats change
**Why it happens:** Forgetting to wrap component with observer() from mobx-react-lite
**How to avoid:** Always wrap observer components with `export const StatusBarPill = observer(() => { ... })`
**Warning signs:** Stats show stale data, don't update when report reloaded

### Pitfall 5: Replacing RunDateDisplay Without Removing It
**What goes wrong:** Both RunDateDisplay AND StatusBarPill render, cluttering AppBar
**Why it happens:** Adding StatusBarPill without deleting old RunDateDisplay usage
**How to avoid:** In App.tsx, remove `<RunDateDisplay />` when adding `<StatusBarPill />`
**Warning signs:** Duplicate date display, AppBar too crowded

## Code Examples

### Recommended StatusBarPill Component Structure

```typescript
// Source: New component for Phase 26, based on existing patterns
import { observer } from 'mobx-react-lite'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useRootStore } from '../../store'

export const StatusBarPill = observer(() => {
  const { reportStore, analyticsStore } = useRootStore()

  // Guard: Return null if no report loaded
  if (!reportStore.runData) {
    return null
  }

  const passRate = reportStore.passRate
  const stats = reportStore.runData.stats
  const flakyCount = analyticsStore.flakyTestCount

  // Reuse ProgressRingCard color logic
  const getColor = (val: number): string => {
    if (val >= 80) return 'success.main'
    if (val >= 50) return 'warning.main'
    return 'error.main'
  }

  // Format run date (from RunDateDisplay)
  const startTime = reportStore.runData.execution.start_time
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(startTime))

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 1,
      }}
    >
      {/* Compact pass rate ring */}
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={32}
          thickness={4}
          sx={{ color: 'action.hover' }}
        />
        <CircularProgress
          variant="determinate"
          value={passRate}
          size={32}
          thickness={4}
          sx={{
            position: 'absolute',
            left: 0,
            color: getColor(passRate),
          }}
        />
      </Box>

      {/* Quick stats - hide on mobile */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Typography variant="body2" color="success.main">
          {stats.passed}
        </Typography>
        <Typography variant="body2" color="error.main">
          {stats.failed}
        </Typography>
        {stats.skipped > 0 && (
          <Typography variant="body2" color="text.secondary">
            {stats.skipped}
          </Typography>
        )}
        {flakyCount > 0 && (
          <Typography variant="body2" color="warning.main">
            {flakyCount}~
          </Typography>
        )}
      </Box>

      {/* Run metadata - hide on small screens */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ display: { xs: 'none', md: 'block' } }}
      >
        {formattedDate} • {reportStore.formattedDuration}
      </Typography>
    </Box>
  )
})
```

### Integration into App.tsx Toolbar

```typescript
// Source: Modified from current App.tsx
import { StatusBarPill } from './components/StatusBarPill'

// In App.tsx, inside AppBar:
<Toolbar variant="dense">
  {/* Hamburger menu */}
  <IconButton
    color="inherit"
    onClick={(e) => setAnchorEl(e.currentTarget)}
    edge="start"
    sx={{ mr: 2 }}
  >
    <MenuIcon />
  </IconButton>

  {/* Title */}
  <Typography variant="h6" component="div">
    Qase | Report
  </Typography>

  {/* Center: Status bar (replaces RunDateDisplay) */}
  <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
    <StatusBarPill />
  </Box>

  {/* Right: Actions */}
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
    <IconButton color="inherit" onClick={() => setSearchOpen(true)}>
      <SearchIcon />
    </IconButton>
    <ExportButton />
    <ThemeToggle />
  </Box>
</Toolbar>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static status in sidebar only | Persistent status in AppBar | v1.4 (Phase 26) | Status always visible regardless of scroll |
| Large progress rings (100px+) | Compact rings (32-40px) for toolbar | v1.4 (Phase 26) | Fits in dense toolbar height (48px) |
| Separate RunDateDisplay component | Integrated into StatusBarPill | v1.4 (Phase 26) | Reduced component count, consolidated metadata |
| Custom SVG progress | MUI CircularProgress variant="determinate" | MUI 5 | Simpler, theme-aware |

## Available Data for Status Bar

From existing stores (no new computation needed):

| Metric | Source | Type | Notes |
|--------|--------|------|-------|
| Pass rate | `reportStore.passRate` | number (0-100) | Computed getter |
| Passed count | `reportStore.runData.stats.passed` | number | From run.json |
| Failed count | `reportStore.runData.stats.failed` | number | From run.json |
| Skipped count | `reportStore.runData.stats.skipped` | number | From run.json |
| Broken count | `reportStore.brokenCount` | number | Handles broken/blocked |
| Flaky count | `analyticsStore.flakyTestCount` | number | Computed from history |
| Run date | `reportStore.runData.execution.start_time` | ISO string | Format with Intl.DateTimeFormat |
| Duration | `reportStore.formattedDuration` | string | Already formatted (e.g., "1h 23m 45s") |
| Run title | `reportStore.runData.title` | string | Optional display |

## Responsive Design Considerations

### Breakpoints Strategy (Following MUI Theme)
| Breakpoint | Width | StatusBarPill Visibility |
|------------|-------|--------------------------|
| xs | 0-600px | Ring only (hide text stats, hide metadata) |
| sm | 600-900px | Ring + quick stats (hide metadata) |
| md | 900-1200px | Ring + quick stats + metadata (full display) |
| lg | 1200px+ | Full display |

### Example Responsive Implementation
```typescript
<Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
  {/* Quick stats - hidden on mobile */}
</Box>

<Typography sx={{ display: { xs: 'none', md: 'block' } }}>
  {/* Run metadata - hidden on mobile and tablet */}
</Typography>
```

## Open Questions

1. **Ring Size Decision: 32px vs 40px**
   - What we know: Phase 20 used 80px for sidebar (compact design decision)
   - What's unclear: Optimal size for AppBar (32px more compact, 40px more readable)
   - Recommendation: Start with 40px with percentage text. Test readability. If too crowded, use 32px ring-only (no text label)

2. **Mobile Layout Strategy**
   - What we know: Current AppBar already responsive with hamburger menu
   - What's unclear: Should mobile show ring only, or hide status bar entirely?
   - Recommendation: Show ring-only on xs (mobile). Users can navigate to Dashboard for full stats if needed

3. **Skipped Count Display Priority**
   - What we know: Passed/failed are high priority, skipped less critical
   - What's unclear: Should skipped always show, or only when count > 0?
   - Recommendation: Show skipped only when count > 0 to save space (same pattern as flaky)

## Sources

### Primary (HIGH confidence)
- Codebase analysis: `src/App.tsx` - current AppBar structure with hamburger menu (Phase 25)
- Codebase analysis: `src/components/Dashboard/ProgressRingCard.tsx` - circular progress pattern with 80px size
- Codebase analysis: `src/components/RunDateDisplay/index.tsx` - run metadata formatting
- Codebase analysis: `src/store/ReportStore.ts` - computed values (passRate, formattedDuration)
- Codebase analysis: `.planning/phases/20-sidebar-overhaul/20-01-PLAN.md` - Phase 20-01 decision: 80px ring size
- Codebase analysis: `.planning/research/ARCHITECTURE-LAYOUT-SIMPLIFICATION.md` - v1.4 architecture patterns

### Secondary (MEDIUM confidence)
- [MUI App Bar React component](https://mui.com/material-ui/react-app-bar/) - AppBar layout patterns, flexbox distribution
- [MUI CircularProgress API](https://mui.com/material-ui/api/circular-progress/) - props reference for size and thickness
- [MUI Toolbar API](https://mui.com/material-ui/api/toolbar/) - dense variant and height properties
- Web search: MUI dense toolbar multiple sections layout - flexGrow patterns for element distribution

### Tertiary (LOW confidence)
- Web search: React status bar dashboard best practices - general patterns, not MUI-specific
- Web search: compact circular progress AppBar - general implementation examples across frameworks

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already in use, no new dependencies
- Architecture: HIGH - patterns already exist in ProgressRingCard and RunDateDisplay
- Pitfalls: HIGH - based on direct code analysis and AppBar constraints (48px height)
- Responsive design: MEDIUM - breakpoints follow MUI theme, but mobile layout needs testing

**Research date:** 2026-02-11
**Valid until:** 90 days (stable MUI v5 ecosystem, no breaking changes expected)
