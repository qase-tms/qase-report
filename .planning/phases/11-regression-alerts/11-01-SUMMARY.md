---
phase: 11-regression-alerts
plan: 01
subsystem: analytics
tags: [mobx, statistics, 2-sigma, performance-monitoring]

# Dependency graph
requires:
  - phase: 10-flakiness-detection
    provides: AnalyticsStore structure and flakiness detection patterns
  - phase: 08-history-infrastructure
    provides: HistoryStore.getTestHistory for duration analysis
provides:
  - AlertItem type definitions for unified alert system
  - getPerformanceRegression method with 2-sigma outlier detection
  - alerts computed property aggregating flakiness + regression alerts
affects: [12-stability-scoring, dashboard, test-details]

# Tech tracking
tech-stack:
  added: []
  patterns: ["2-sigma outlier detection for performance regression", "AlertItem unified alert interface"]

key-files:
  created: [src/types/alerts.ts]
  modified: [src/store/AnalyticsStore.ts]

key-decisions:
  - "2-sigma threshold (mean + 2*stddev) balances between false positives and catching real regressions"
  - "Compare latest run against historical mean (excluding current) to detect if current run is outlier"
  - "stdDev > 0 check prevents false positives when all durations are identical"
  - "5-run minimum (MIN_RUNS_REGRESSION) matches flakiness detection for consistency"

patterns-established:
  - "AlertItem interface: Unified structure for all alert types (flakiness, regression, new_failure)"
  - "Alert severity mapping: error for regressions/new_failures, warning for flakiness"
  - "alerts computed: Single source of truth for all alerts, sorted by severity"

# Metrics
duration: 1m 51s
completed: 2026-02-10
---

# Phase 11 Plan 01: Regression Alerts Summary

**2-sigma outlier detection for performance regressions with unified alert system aggregating flakiness and regression warnings**

## Performance

- **Duration:** 1m 51s
- **Started:** 2026-02-10T11:54:10Z
- **Completed:** 2026-02-10T11:56:01Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- Created AlertItem type system for unified alert interface across flakiness and regression detection
- Implemented 2-sigma outlier detection algorithm (mean + 2*stdDev) for performance regression identification
- Built alerts computed property aggregating all alert types with severity-based sorting

## Task Commits

Each task was committed atomically:

1. **Task 1: Create alert types** - `6cfe554` (feat)
2. **Task 2: Implement regression detection algorithm** - `acf9ef7` (feat)
3. **Task 3: Add alerts computed property** - `c561d87` (feat)

## Files Created/Modified
- `src/types/alerts.ts` - AlertItem, AlertType, AlertSeverity type definitions with MIN_RUNS_REGRESSION constant
- `src/store/AnalyticsStore.ts` - Added calculateStats helper, getPerformanceRegression method, alerts/alertCount/hasAlerts computed properties

## Decisions Made

**2-sigma threshold selection**: Used mean + 2*stdDev as threshold, which statistically captures ~95% of normal variation. This balances between catching real performance issues and avoiding false positives from natural variance.

**Historical baseline calculation**: Compare latest run against mean of all PRIOR runs (excluding current). This detects if the most recent run is an outlier compared to historical behavior.

**stdDev > 0 guard**: Added check to prevent false positives when all historical durations are identical (stdDev = 0), which would make threshold = mean and flag any increase as regression.

**Consistent minimum runs**: Used same 5-run minimum as flakiness detection for consistency across analytics features and statistical validity.

**Alert severity mapping**: Regressions and new_failures use 'error' severity (red), flakiness uses 'warning' (yellow) for visual distinction in UI.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation followed plan specifications without issues.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Phase 11 Plan 02 (Alerts Panel UI):**
- AlertItem types fully defined with severity, type, message, details structure
- alerts computed property provides reactive data source for UI components
- alertCount and hasAlerts helpers available for badge display

**Ready for Phase 12 (Stability Scoring):**
- Performance regression detection provides input for stability metrics
- Alert aggregation pattern established for future metric integration

**Integration points available:**
- `analyticsStore.alerts` - array of AlertItem for rendering
- `analyticsStore.alertCount` - count for badge display
- `analyticsStore.hasAlerts` - boolean for conditional rendering
- Each alert includes testSignature for navigation to test details

## Self-Check: PASSED

All claims verified:
- ✓ src/types/alerts.ts exists
- ✓ Task 1 commit 6cfe554 exists
- ✓ Task 2 commit acf9ef7 exists
- ✓ Task 3 commit c561d87 exists

---
*Phase: 11-regression-alerts*
*Completed: 2026-02-10*
