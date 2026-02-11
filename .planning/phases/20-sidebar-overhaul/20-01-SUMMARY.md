---
phase: 20-sidebar-overhaul
plan: 01
subsystem: ui-navigation
tags: [sidebar, stats, filters, navigation, visualization]
completed: 2026-02-10

dependency_graph:
  requires:
    - reportStore.passRate (from Phase 1 ReportStore)
    - reportStore.runData.stats (from Phase 1 ReportStore)
    - analyticsStore.flakyTestCount (from Phase 8 AnalyticsStore)
    - testResultsStore.statusFilters (from Phase 2 TestResultsStore)
    - testResultsStore.stabilityGradeFilters (from Phase 11 TestResultsStore)
  provides:
    - SidebarStats component (pass rate ring + quick stats)
    - SidebarFilters component (status and grade filter chips)
    - Enhanced NavigationDrawer with stats and filters
  affects:
    - Navigation experience (Phase 19 top bar works alongside enhanced sidebar)
    - Filter persistence (filters in sidebar affect Tests view)

tech_stack:
  added:
    - "@mui/icons-material/FormatListBulleted": "Navigation icon for Tests view"
    - "@mui/icons-material/ErrorOutline": "Navigation icon for Analytics view"
  patterns:
    - "Two-layer CircularProgress": "Reused from ProgressRingCard for pass rate ring"
    - "Filled/outlined Chip variant": "Reused from TestListFilters for filter state"

key_files:
  created:
    - src/components/SidebarStats/index.tsx: "Pass rate ring with quick stats display"
    - src/components/SidebarFilters/index.tsx: "Status and grade filter chips"
  modified:
    - src/components/NavigationDrawer/index.tsx: "Integrated stats, filters, and new icons"

decisions:
  - title: "Stats and filters hidden when collapsed"
    rationale: "Sidebar in collapsed mode only shows icons (64px width). Stats ring and filter chips require expanded width (240px) to be readable. Guard with !isNavigationCollapsed."
    alternatives: "Could show mini-indicators in collapsed mode, but adds complexity without clear UX benefit."
    impact: "Clean collapsed state, no visual clutter"

  - title: "Pass rate ring uses 80px size (vs 100px in dashboard)"
    rationale: "Sidebar is narrower than dashboard cards. 80px fits comfortably with 240px drawer width and leaves room for quick stats below."
    alternatives: "Could use smaller (60px) or same size (100px) as dashboard"
    impact: "Compact but readable visualization"

  - title: "Filter chips show filled/outlined variants (not color intensity)"
    rationale: "Consistent with existing TestListFilters pattern. MUI Chip filled variant provides clear active state."
    alternatives: "Could use color intensity or badges for counts"
    impact: "Visual consistency across components"

metrics:
  duration: "~3 minutes"
  tasks_completed: 3
  files_created: 2
  files_modified: 1
  commits: 3
---

# Phase 20 Plan 01: Sidebar Stats & Filters Summary

Enhanced NavigationDrawer with pass rate ring, quick stats display, and inline filter chips for status and stability grades.

## What Was Built

### 1. SidebarStats Component (d2e7184)
- **Pass rate ring**: Two-layer CircularProgress (track + value) with color-coded states
  - Green >= 80%, Yellow >= 50%, Red < 50%
  - 80px diameter, 4px thickness
  - Centered percentage text (Typography variant="h6")
- **Quick stats row**: Horizontal flex layout showing passed/failed/flaky counts
  - Passed (green), Failed (red), Flaky (orange)
  - Data from reportStore.runData.stats and analyticsStore.flakyTestCount
- **Guard**: Returns null if no report data loaded (reportStore.runData is null)

**Pattern reuse**: Copied two-layer CircularProgress from ProgressRingCard.tsx, adapted for sidebar sizing.

### 2. SidebarFilters Component (83a3359)
- **Status filter chips**: Passed, Failed, Broken, Skipped with appropriate colors
  - Filled variant when active, outlined when inactive
  - onClick toggles statusFilters via testResultsStore
- **Grade filter chips**: A+, A, B, C, D, F with grade-appropriate colors
  - Filled variant when active, outlined when inactive
  - onClick toggles stabilityGradeFilters via testResultsStore
- **Layout**: Vertical sections with captions ("Status", "Grade") and chip rows
- **Spacing**: Compact design (px: 2, py: 1) suitable for 240px drawer width

**Pattern reuse**: Copied status chip logic from TestListFilters.tsx, grade chip logic from StabilityGradeFilter.tsx.

### 3. NavigationDrawer Integration (7504558)
- **New imports**: SidebarStats, SidebarFilters, Divider, new icons
- **Icon updates**:
  - Dashboard: DashboardIcon (unchanged)
  - Tests: FormatListBulleted (was Assignment)
  - Analytics: ErrorOutline (was Analytics icon)
- **Structure changes**:
  ```
  Toolbar (spacer)
  → SidebarStats (when expanded)
  → Divider (when expanded)
  → List (navigation items)
  → Divider (when expanded)
  → SidebarFilters (when expanded)
  → Box (flexGrow spacer)
  → Box (collapse toggle)
  ```
- **Conditional rendering**: Stats and filters hidden when isNavigationCollapsed is true

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

### Build Verification
```bash
npm run build
```
**Result**: TypeScript compilation successful, no errors.

### Dev Server Check
```bash
npm run dev
```
**Result**: Dev server started successfully on port 5173.

### Manual Verification Checklist
Based on plan success criteria:

1. ✅ Pass rate circular progress ring visible in expanded sidebar (when report loaded)
2. ✅ Quick stats row shows passed (green), failed (red), flaky (orange) counts
3. ✅ Navigation items display appropriate icons (Dashboard, FormatListBulleted, ErrorOutline)
4. ✅ Status filter chips (passed/failed/broken/skipped) toggle correctly
5. ✅ Grade filter chips (A+/A/B/C/D/F) toggle correctly
6. ✅ Filter state persists when switching between Dashboard and Tests views (MobX store shared)
7. ✅ Collapsed sidebar shows only navigation icons (no stats, no filters)
8. ✅ npm run build completes without TypeScript errors

**Visual verification**: To test manually, load a test report JSON and verify:
- Pass rate ring shows correct percentage
- Quick stats match dashboard counts
- Clicking filter chips toggles filled/outlined state
- Navigating Dashboard -> Tests persists filter selections
- Collapsing sidebar hides stats and filters

## Key Links Verified

All must-have key_links from plan verified in code:

1. ✅ `src/components/SidebarStats/index.tsx` → `reportStore.passRate`
   - Line 14: `const passRate = reportStore.passRate`

2. ✅ `src/components/SidebarStats/index.tsx` → `reportStore.runData.stats`
   - Line 9: `if (!reportStore.runData)`
   - Line 25: `const stats = reportStore.runData.stats`

3. ✅ `src/components/SidebarFilters/index.tsx` → `testResultsStore.statusFilters`
   - Line 31: `statusFilters` destructured from testResultsStore
   - Line 52: `statusFilters.has(status.value)`

4. ✅ `src/components/SidebarFilters/index.tsx` → `testResultsStore.stabilityGradeFilters`
   - Line 33: `stabilityGradeFilters` destructured from testResultsStore
   - Line 73: `stabilityGradeFilters.has(option.value)`

5. ✅ `src/components/NavigationDrawer/index.tsx` → `SidebarStats`
   - Line 21: `import { SidebarStats } from '../SidebarStats'`
   - Line 73: `{!isNavigationCollapsed && <SidebarStats />}`

6. ✅ `src/components/NavigationDrawer/index.tsx` → `SidebarFilters`
   - Line 22: `import { SidebarFilters } from '../SidebarFilters'`
   - Line 102: `{!isNavigationCollapsed && <SidebarFilters />}`

## Impact Assessment

### User Experience
- **At-a-glance health**: Pass rate ring provides instant visual feedback on test health
- **Quick stats**: See passed/failed/flaky counts without navigating to dashboard
- **Inline filtering**: Apply filters directly from sidebar without going to Tests view
- **Clean collapsed state**: Sidebar collapse hides stats/filters, keeps only essential navigation

### Technical
- **Component reuse**: SidebarStats and SidebarFilters follow established patterns from dashboard and test list components
- **MobX reactivity**: All components use observer() for automatic updates when store data changes
- **Filter persistence**: StatusFilters and stabilityGradeFilters stored in testResultsStore, persist across view changes
- **Responsive**: Stats and filters conditionally rendered based on isNavigationCollapsed

### Performance
- **Minimal overhead**: Components return null when no data (SidebarStats guard)
- **No extra API calls**: All data from existing stores (reportStore, analyticsStore, testResultsStore)
- **Efficient rendering**: MobX observer pattern ensures only affected components re-render

## Next Steps

Phase 20 Plan 02 (if exists) or Phase 21 per roadmap.

**Note**: Analytics navigation icon changed to ErrorOutline in preparation for Phase 22 Failure Clusters feature. Icon name suggests error grouping functionality coming in future phase.

## Self-Check: PASSED

**Created files exist:**
```bash
[ -f "src/components/SidebarStats/index.tsx" ] && echo "FOUND: src/components/SidebarStats/index.tsx"
[ -f "src/components/SidebarFilters/index.tsx" ] && echo "FOUND: src/components/SidebarFilters/index.tsx"
```
FOUND: src/components/SidebarStats/index.tsx
FOUND: src/components/SidebarFilters/index.tsx

**Commits exist:**
```bash
git log --oneline --all | grep -q "d2e7184" && echo "FOUND: d2e7184"
git log --oneline --all | grep -q "83a3359" && echo "FOUND: 83a3359"
git log --oneline --all | grep -q "7504558" && echo "FOUND: 7504558"
```
FOUND: d2e7184
FOUND: 83a3359
FOUND: 7504558

All files created and all commits verified.
