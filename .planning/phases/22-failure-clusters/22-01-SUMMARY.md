---
phase: 22-failure-clusters
plan: 01
subsystem: analytics
tags: [analytics, failure-clusters, mobx, computed-properties]
dependency_graph:
  requires:
    - testResultsStore.resultsList
  provides:
    - failureClusters (FailureCluster[])
    - failureClusterCount (number)
    - hasFailureClusters (boolean)
  affects:
    - Future UI components for failure cluster visualization
tech_stack:
  added:
    - FailureCluster type interface
  patterns:
    - MobX computed properties for reactive clustering
    - Error message normalization (100 chars, lowercase, whitespace)
key_files:
  created: []
  modified:
    - src/store/AnalyticsStore.ts
decisions:
  - Error normalization uses first 100 chars to balance specificity vs grouping
  - Only clusters with 2+ tests are returned (single failures not considered clusters)
  - Error extraction priority: test.message -> stacktrace first line -> '__no_error__'
  - Follows existing pattern from flakiness detection (lines 490-505)
metrics:
  duration: "1m 25s"
  tasks_completed: 2
  files_modified: 1
  commits: 2
  test_coverage: N/A
  completed_date: "2026-02-10"
---

# Phase 22 Plan 01: Failure Clustering Algorithm Summary

**One-liner:** Added failure clustering algorithm to AnalyticsStore that groups failed tests by normalized error messages (first 100 chars, lowercase, whitespace-normalized).

## What Was Built

Added failure clustering capability to AnalyticsStore enabling users to identify common failure patterns across their test suite:

1. **FailureCluster Type**: Interface with `errorPattern` (normalized error string) and `tests` (QaseTestResult array)
2. **normalizeErrorMessage Helper**: Private method for consistent error message normalization (100 char limit, lowercase, whitespace-normalized)
3. **failureClusters Computed Property**: Returns clusters sorted by test count descending, filters out single-test "clusters"
4. **Convenience Getters**: `failureClusterCount` and `hasFailureClusters` for UI integration

## Implementation Details

**Error Extraction Priority:**
1. `test.message` (user-friendly error message)
2. First line of `test.execution.stacktrace` (fallback)
3. `'__no_error__'` (tests without error information)

**Normalization Algorithm:**
- Takes first 100 characters (balances specificity vs grouping)
- Converts to lowercase (case-insensitive matching)
- Normalizes whitespace (multiple spaces/tabs → single space)
- Trims leading/trailing whitespace

**Clustering Logic:**
- Groups failed tests by normalized error message
- Filters to only clusters with 2+ tests
- Sorts clusters by test count descending (largest problems first)
- MobX computed: automatically updates when test results change

## Technical Decisions

### Error Normalization Length (100 chars)
**Decision:** Use first 100 characters for error message normalization

**Rationale:**
- Balances specificity (enough to distinguish different errors) vs grouping power (similar errors cluster together)
- Follows existing pattern from flakiness detection (lines 490-505 in AnalyticsStore)
- Stack traces and error messages often have unique details (timestamps, IDs) deep in the string

**Alternatives considered:**
- Full error message: Too specific, won't cluster similar errors with minor variations
- 50 chars: Too short, may group unrelated errors
- Fuzzy matching: Added complexity for marginal benefit

### Single-Test Cluster Filtering
**Decision:** Only return clusters with 2+ tests

**Rationale:**
- Single failures aren't "clusters" by definition
- Reduces UI noise (focus on patterns, not individual failures)
- Users can see individual failures in main test list

### Error Extraction Priority
**Decision:** Prefer `test.message` over `execution.stacktrace`

**Rationale:**
- `test.message` is more user-friendly and descriptive
- Stacktrace first line provides fallback for tests without explicit messages
- Matches existing error handling patterns in codebase

## Files Modified

### `src/store/AnalyticsStore.ts`
**Changes:**
- Added `FailureCluster` interface export (lines after imports)
- Added `QaseTestResult` import for type safety
- Added `normalizeErrorMessage` private helper method (after line 291)
- Added `failureClusters` computed getter (after `gradeDistribution`)
- Added `failureClusterCount` and `hasFailureClusters` convenience getters

**Integration Points:**
- Depends on `this.root.testResultsStore.resultsList` (MobX reactive)
- Filters for `test.execution.status === 'failed'`
- Ready for UI components to consume via `rootStore.analyticsStore.failureClusters`

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

✅ **TypeScript Compilation:** `npx tsc --noEmit` passes with no errors
✅ **Dev Server:** Starts successfully
✅ **MobX Reactivity:** Computed properties properly decorated with makeAutoObservable

**Manual verification in browser console:**
```javascript
// After loading a report with multiple failed tests:
rootStore.analyticsStore.failureClusters.length // > 0 if clusters exist
rootStore.analyticsStore.failureClusters[0].tests.length // >= 2
rootStore.analyticsStore.failureClusters[0].errorPattern // normalized error string
rootStore.analyticsStore.hasFailureClusters // boolean
rootStore.analyticsStore.failureClusterCount // number
```

## Next Steps

**Immediate (Phase 22-02):**
- Build UI components to display failure clusters
- Add filtering/sorting controls for cluster view
- Implement cluster drill-down to see affected tests

**Future Enhancements:**
- Similarity-based fuzzy matching (vs exact normalization)
- Cluster severity scoring (based on test count + recency)
- Historical cluster tracking (recurring failures across runs)

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | 381e21e | Add FailureCluster type and normalizeErrorMessage helper |
| 2 | 2eb7404 | Add failureClusters computed property with convenience getters |

## Self-Check: PASSED

✅ **File exists:** `src/store/AnalyticsStore.ts`
✅ **Task 1 commit exists:** `381e21e`
✅ **Task 2 commit exists:** `2eb7404`

All plan deliverables verified successfully.
