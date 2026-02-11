---
phase: 35-suite-hierarchy-progress
plan: 02
subsystem: test-list-ui
tags: [progress-bar, tooltip, suite-visualization, accessibility]
dependency_graph:
  requires:
    - "35-01 (TreeNode type with suite aggregations)"
    - "@radix-ui/react-progress"
    - "shadcn/ui tooltip component"
  provides:
    - "MultiSegmentProgress component"
    - "Progress column for suite rows"
    - "Visual suite health indicators"
  affects:
    - "src/components/TestList/columns.tsx"
    - "Suite row rendering"
tech_stack:
  added:
    - "@radix-ui/react-progress (via shadcn/ui tooltip dependency)"
    - "shadcn/ui Tooltip component"
  patterns:
    - "Cumulative percentage stacking for multi-segment progress bars"
    - "TooltipProvider wrapper for accessible tooltips"
    - "Conditional column rendering based on row type"
key_files:
  created:
    - "src/components/ui/tooltip.tsx (shadcn/ui component)"
    - "src/components/TestList/MultiSegmentProgress.tsx"
  modified:
    - "src/components/TestList/columns.tsx (added Progress column)"
decisions:
  - "Cumulative percentages instead of individual widths for progress segments (easier stacking logic)"
  - "Z-index reverse order (smaller segments on top) for visual clarity"
  - "TooltipProvider per component instance (plan pattern) vs app-level provider"
  - "Progress column between Status and Duration for logical column flow"
  - "Empty suite shows 'No tests' badge instead of empty progress bar"
metrics:
  duration: "132s (~2 min)"
  completed_at: "2026-02-11T20:08:05Z"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
  commits: 2
---

# Phase 35 Plan 02: Multi-Segment Progress Bars for Suite Health Summary

**One-liner:** Multi-color progress bars with tooltips showing suite test status breakdown (passed/failed/skipped/broken) and duration.

## Objective

Create multi-segment progress bar component and integrate into suite rows for visualizing pass/fail/skipped/broken proportions.

**Goal:** Provide visual feedback on suite health through color-coded progress bars that show test status breakdown with accessible tooltips displaying duration and counts.

## Execution Summary

### Completed Tasks

| Task | Name                                  | Commit  | Files                                                                    |
| ---- | ------------------------------------- | ------- | ------------------------------------------------------------------------ |
| 1    | Install Tooltip and MultiSegmentProgress | 8c2efc8 | src/components/ui/tooltip.tsx, MultiSegmentProgress.tsx                  |
| 2    | Add Progress column to columns.tsx    | 2006b88 | src/components/TestList/columns.tsx                                      |

### Task Details

**Task 1: Install Tooltip and create MultiSegmentProgress component**
- Installed shadcn/ui Tooltip component via CLI (`npx shadcn@latest add tooltip -y`)
- Created MultiSegmentProgress component with Radix ProgressPrimitive for accessibility
- Implemented cumulative percentage stacking with z-index ordering
- Added tooltip showing duration and status breakdown
- Progress bar supports keyboard focus (role="progressbar" with aria-label)

**Task 2: Add Progress column to columns.tsx for suite rows**
- Imported MultiSegmentProgress and ProgressSegment type
- Added Progress column between Status and Duration columns
- Calculated cumulative percentages: passed → failed → skipped → broken
- Applied color coding: green (passed), red (failed), yellow (skipped), gray (broken)
- Conditional rendering: progress bar for suites, null for test rows
- Empty suites show "No tests" badge instead of empty bar

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

### Build Verification
```bash
npm run build
# ✓ 2814 modules transformed
# ✓ built in 10.93s
```

### Component Verification
- Tooltip component installed at `src/components/ui/tooltip.tsx`
- MultiSegmentProgress exports component and ProgressSegment type
- Progress column added to columns array with correct structure
- Cumulative percentage calculation verified (passedPct → failedPct → skippedPct → brokenPct)
- Build passes without TypeScript errors

### Manual Verification (Required)
- [ ] Load test report with multiple suites
- [ ] See progress bars on suite rows
- [ ] Hover progress bar to see tooltip with duration and counts
- [ ] Tab to focus progress bar (keyboard accessibility)
- [ ] Colors match: green=passed, red=failed, yellow=skipped, gray=broken

## Technical Implementation

### MultiSegmentProgress Component

**Key implementation details:**
- **Cumulative percentages:** Segments use cumulative values (0-100) instead of individual widths
- **Z-index stacking:** Sorted ascending by value, z-index in reverse order (smaller segments on top)
- **Accessibility:** Radix ProgressPrimitive with role="progressbar" and aria-label
- **Tooltip:** Shows formatted duration and status breakdown with color indicators
- **Colors:** Tailwind classes (bg-green-500, bg-red-500, bg-yellow-500, bg-gray-500)

**Progress calculation:**
```typescript
const passedPct = (passedCount / totalTests) * 100
const failedPct = passedPct + (failedCount / totalTests) * 100  // Cumulative
const skippedPct = failedPct + (skippedCount / totalTests) * 100
const brokenPct = skippedPct + (brokenCount / totalTests) * 100
```

**Stacking order:**
1. Broken (largest value) → bottom layer (lowest z-index)
2. Skipped → middle layer
3. Failed → middle layer
4. Passed (smallest value) → top layer (highest z-index)

### Progress Column Integration

**Column order:**
1. Name (with expand chevron)
2. Status (for test rows only)
3. **Progress (NEW - for suite rows only)**
4. Duration
5. Actions

**Conditional rendering:**
- Suite rows (`type === 'suite'`): Show progress bar with aggregated counts
- Test rows (`type === 'test'`): Return null (no progress bar)
- Empty suites (`totalTests === 0`): Show "No tests" badge

## Success Criteria

- [x] shadcn/ui Tooltip component installed
- [x] MultiSegmentProgress component created with Radix primitives
- [x] Progress column added to columns.tsx
- [x] Suite rows show multi-segment progress bar
- [x] Test rows show nothing in Progress column
- [x] Tooltip displays duration and status breakdown
- [x] npm run build passes without errors

## Next Steps

Plan 35-03: Add suite row actions (expand all, collapse all, filter by status) and suite aggregation calculations for nested hierarchies.

## Artifacts

### Files Created
- `src/components/ui/tooltip.tsx` - shadcn/ui Tooltip component with Radix primitives
- `src/components/TestList/MultiSegmentProgress.tsx` - Multi-segment progress bar with tooltip

### Files Modified
- `src/components/TestList/columns.tsx` - Added Progress column for suite visualization

### Exports Added
- `MultiSegmentProgress` component
- `ProgressSegment` type (value, color, label, count)

### Dependencies Added
- None (shadcn/ui tooltip uses existing @radix-ui/react-progress dependency)

## Self-Check: PASSED

**Files created:**
- ✓ src/components/ui/tooltip.tsx
- ✓ src/components/TestList/MultiSegmentProgress.tsx

**Commits verified:**
- ✓ 8c2efc8 (Task 1: Tooltip and MultiSegmentProgress components)
- ✓ 2006b88 (Task 2: Progress column integration)
