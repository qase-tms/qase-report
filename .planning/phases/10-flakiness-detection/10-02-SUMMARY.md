---
phase: 10-flakiness-detection
plan: 02
subsystem: ui
tags: [mui, badges, react, mobx-observer, flakiness, tooltips]

# Dependency graph
requires:
  - phase: 10-01
    provides: AnalyticsStore.getFlakinessScore method, FlakinessResult type
provides:
  - StabilityBadge component for visual flakiness indicators
  - TestListItem integration with flakiness detection
affects: [test-list, analytics-ui, dashboard]

# Tech tracking
tech-stack:
  added:
    - MUI Chip component for status badges
    - MUI Tooltip for detailed flakiness info
    - MUI Icons (CheckCircle, Loop, NewReleases)
  patterns:
    - Conditional badge rendering (hidden when insufficient data)
    - Observer pattern for MobX reactivity in list items
    - Signature-based flakiness lookup

key-files:
  created:
    - src/components/TestList/StabilityBadge.tsx
  modified:
    - src/components/TestList/TestListItem.tsx

key-decisions:
  - "Replace memo() with observer() in TestListItem for MobX reactivity"
  - "Hide badges when insufficient_data (< 5 runs) for clean UI"
  - "Use color-coded chips (warning/success/error) for immediate status recognition"

patterns-established:
  - "StabilityBadge as presentation component receiving FlakinessResult prop"
  - "TestListItem wraps with observer() to react to analyticsStore changes"
  - "Tooltip format: 'Flaky in X of Y runs (Z%)' for clear percentage communication"

# Metrics
duration: ~3min
completed: 2026-02-10
---

# Phase 10 Plan 02: Flakiness UI Components Summary

**Visual stability badges on test list items with color-coded status (flaky/stable/new_failure) and tooltip showing flakiness percentage**

## Performance

- **Duration:** ~3 minutes
- **Started:** 2026-02-10T14:20:19Z
- **Completed:** 2026-02-10T14:20:55Z (Task commits) + checkpoint verification
- **Tasks:** 3 (2 auto tasks + 1 human-verify checkpoint)
- **Files modified:** 2

## Accomplishments
- Created StabilityBadge component with color-coded status indicators
- Integrated flakiness detection into TestListItem UI
- Added tooltips showing detailed flakiness statistics (X of Y runs format)
- Implemented smart badge visibility (hidden when insufficient data)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create StabilityBadge component** - `b1b9100` (feat)
2. **Task 2: Integrate StabilityBadge into TestListItem** - `0a38375` (feat)
3. **Task 3: Verify flakiness detection UI** - Human verification checkpoint (PASSED)

_Note: No plan metadata commit per instructions - summary and state update only_

## Files Created/Modified

### Created
- `src/components/TestList/StabilityBadge.tsx` - Visual stability indicator component with MUI Chip and Tooltip
  - Props: `{ result: FlakinessResult }`
  - Returns null when `insufficient_data` (< 5 runs)
  - Color-coded by status: warning (flaky), success (stable), error (new_failure)
  - Icons: Loop (flaky), CheckCircle (stable), NewReleases (new_failure)
  - Tooltips: "Flaky in X of Y runs (Z%)" format per FLKY-03 spec

### Modified
- `src/components/TestList/TestListItem.tsx` - Test list item with integrated stability badges
  - Replaced `memo()` with `observer()` for MobX reactivity
  - Added `useRootStore()` hook to access analyticsStore
  - Calls `getFlakinessScore(test.signature)` for tests with signatures
  - Renders StabilityBadge conditionally when flakiness result exists

## Decisions Made

### Decision 1: Replace memo() with observer()
**Context:** TestListItem needs access to MobX store for flakiness data.

**Chosen:** Remove React.memo() wrapper, add observer() from mobx-react-lite

**Rationale:**
- MobX observer() provides built-in optimization (only re-renders when observed data changes)
- React.memo() unnecessary overhead when observer() already handles memoization
- Enables reactive updates when history data changes without manual dependency tracking

**Alternative considered:** Keep memo() and pass flakiness data as props from parent - rejected due to prop drilling and loss of reactivity

---

### Decision 2: Hide badges for insufficient_data
**Context:** Tests with < 5 runs return `insufficient_data` status.

**Chosen:** Return null from StabilityBadge when status is `insufficient_data`

**Rationale:**
- Clean UI - only show badges when meaningful
- Avoids confusion (no "Insufficient Data" badge clutter)
- User sees badges appear after 5th run, providing visual feedback of detection activation

**Alternative considered:** Show grey "Insufficient Data" badge - rejected as UI clutter

---

### Decision 3: Tooltip format "Flaky in X of Y runs (Z%)"
**Context:** Users need to understand flakiness severity beyond just "flaky" label.

**Chosen:** Show exact counts plus percentage in tooltip (per FLKY-03 spec)

**Rationale:**
- Transparency: Users see raw data (5 of 10 runs) plus calculated metric (50%)
- Context: "Flaky in 1 of 100 runs" vs "1 of 5 runs" tells different stories despite same 20% threshold
- Follows established pattern from Phase 10 Plan 01 design

**Alternative considered:** Show only percentage - rejected as losing important context

---

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation proceeded smoothly with clear algorithm foundation from Plan 01.

## Verification Results

### Human Verification (Task 3) - PASSED ✅

User confirmed flakiness detection UI works correctly:
- ✅ StabilityBadge shows appropriate status (flaky/stable/new_failure)
- ✅ Badge hidden when insufficient data (< 5 runs)
- ✅ Tooltips show flakiness percentage in "flaky in X of Y runs" format
- ✅ Colors match status: warning (orange) for flaky, success (green) for stable, error (red) for new_failure
- ✅ Badges appear on test list items with signatures and sufficient history

All success criteria met.

## Integration Points

### Consumes
- `AnalyticsStore.getFlakinessScore(signature)` - Per-test flakiness analysis from Plan 01
- `FlakinessResult` type from `src/types/flakiness.ts`
- `test.signature` from QaseTestResult schema

### Provides
- Visual flakiness feedback in test list UI
- User-facing tooltip documentation of flakiness metrics
- Color-coded quick status recognition

### Next Phase Readiness
- Flakiness detection (Phase 10) complete - algorithm + UI delivered
- Ready for Phase 11: Regression Detection (can use flakyTests data to filter regression candidates)
- Ready for Phase 12: Stability Scoring (badges integrate with broader stability metrics)

## Technical Notes

**Component Architecture:**
- StabilityBadge is pure presentation component (no store access)
- TestListItem bridges store data to presentation layer
- observer() ensures minimal re-renders (only when getFlakinessScore result changes)

**Performance Considerations:**
- getFlakinessScore() called per test item render (not computed)
- Acceptable performance impact: Method is O(n) where n = test run history count (max 100 per Phase 08-02)
- Future optimization: Could memoize results in AnalyticsStore if list performance degrades

**UX Design Choices:**
- Compact badge (height: 20px, size: small) avoids overshadowing test title
- ml: 1 spacing separates badge from test title cleanly
- Tooltip arrow for clear association with badge
- Status icons reinforce color meaning (accessibility consideration)

**Accessibility Notes:**
- Color not sole indicator: Icons + text label provide redundancy
- Tooltip accessible via hover (keyboard focus supported by MUI)
- Screen readers announce Chip label + icon semantic meaning

## Self-Check: PASSED

Verified all claimed deliverables exist:

✅ **Files exist:**
```
FOUND: src/components/TestList/StabilityBadge.tsx
FOUND: src/components/TestList/TestListItem.tsx
```

✅ **Commits exist:**
```
FOUND: b1b9100 (Task 1 - StabilityBadge component)
FOUND: 0a38375 (Task 2 - TestListItem integration)
```

✅ **Exports verified:**
- StabilityBadge exported from StabilityBadge.tsx
- TestListItem uses observer() wrapper
- StabilityBadge imported and rendered in TestListItem

✅ **TypeScript compilation:** No errors

✅ **Human verification:** User confirmed UI works correctly (checkpoint passed)

All deliverables confirmed.

---

*Phase: 10-flakiness-detection*
*Completed: 2026-02-10*
