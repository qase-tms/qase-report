# Phase 29: Statistics Cleanup - Research

**Researched:** 2026-02-11
**Domain:** React component cleanup, code deduplication
**Confidence:** HIGH

## Summary

Phase 28 removed the permanent sidebar (NavigationDrawer, Sidebar, SidebarFilters, SidebarStats), leaving StatusBarPill in the AppBar as the single source of truth for pass rate visualization and quick stats. However, the Dashboard still contains duplicate statistics components that show the same information:

1. **ProgressRingCard** (100px ring) duplicates the StatusBarPill's 40px pass rate ring
2. **StatsCard x4** (passed/failed/skipped/broken counts) duplicates StatusBarPill's quick stats
3. **SparklineCard "Pass Rate Trend"** with `currentValue` showing pass rate percentage - partially duplicates

The cleanup is straightforward: remove the redundant components from Dashboard/index.tsx while keeping the unique analytics widgets that provide additional value (SuiteHealth, TestHealth, TrendsChart, etc.).

**Primary recommendation:** Remove ProgressRingCard and the four StatsCards from Dashboard/index.tsx. Optionally remove SparklineCard's `currentValue` prop (it shows pass rate % which is already in StatusBarPill).

## Duplication Analysis

### Current State: What Shows Pass Rate

| Location | Component | Visual | Size | Info Shown |
|----------|-----------|--------|------|------------|
| AppBar (KEEP) | StatusBarPill | Ring + text | 40px | Pass %, passed/failed/skipped/flaky counts, date, duration |
| Dashboard (REMOVE) | ProgressRingCard | Ring + text | 100px | Pass % only |
| Dashboard (KEEP) | SparklineCard | Line chart | 2x1 | Pass rate trend over time (currentValue shows %) |

### Current State: What Shows Status Counts

| Location | Component | Visual | Info Shown |
|----------|-----------|--------|------------|
| AppBar (KEEP) | StatusBarPill | Text | passed, failed, skipped, flaky counts |
| Dashboard (REMOVE) | StatsCard x4 | Cards | passed, failed, skipped, broken counts + percentages |

### Unique Dashboard Widgets (KEEP)

These provide value beyond what StatusBarPill shows:

| Component | Purpose | Why Keep |
|-----------|---------|----------|
| SuiteHealthCard | Per-suite pass rates | Drill-down info not in StatusBarPill |
| TestHealthWidget | Stability grade distribution | History-based analysis |
| AttentionRequiredCard | Failed + flaky tests list | Actionable items |
| QuickInsightsCard | Top failures + slowest tests | Actionable items |
| AlertsPanel | Regression/performance alerts | History-based analysis |
| TrendsChart | Pass rate + duration over time | History visualization |
| SparklineCard (trends) | Mini trend lines | Quick trends (but currentValue is redundant) |
| RunInfoCard | Run metadata | Execution details |
| HostInfoCard | Host info | Environment details |
| HistoryTimeline | Recent runs list | Navigation aid |

## Files to Modify

### 1. src/components/Dashboard/index.tsx

**Current imports to potentially remove:**
- `StatsCard` - used 4 times for passed/failed/skipped/broken
- `ProgressRingCard` - used 1 time for pass rate ring

**Lines to remove (approximately):**
```tsx
// Lines 57-85: StatsCard usage (4 cards)
<DashboardCard>
  <StatsCard status="passed" count={stats.passed} percentage={reportStore.passRate} />
</DashboardCard>
// ... repeated for failed, skipped, broken

// Lines 87-93: ProgressRingCard usage
<ProgressRingCard
  title="Pass Rate"
  value={reportStore.passRate}
  colSpan={1}
  rowSpan={1}
/>
```

### 2. src/components/Dashboard/StatsCard.tsx (potentially DELETE)

After removal from Dashboard/index.tsx, this component becomes unused. Safe to delete.

### 3. src/components/Dashboard/ProgressRingCard.tsx (potentially DELETE)

After removal from Dashboard/index.tsx, this component becomes unused. Safe to delete.

## Verification Strategy

### Before Cleanup

1. **Visual audit:** Document what statistics user sees in Dashboard vs AppBar
2. **Confirm duplication:** StatusBarPill shows passed/failed/skipped/flaky + pass rate ring
3. **Build passes:** `npm run build` succeeds

### After Cleanup

1. **Orphan check:** Grep for removed components - should return 0 matches
2. **Build passes:** `npm run build` with no TypeScript errors
3. **Visual audit:** Dashboard no longer shows duplicate stats cards or pass rate ring
4. **StatusBarPill intact:** Pass rate and quick stats still visible in AppBar

## Risk Assessment

| Risk | Level | Mitigation |
|------|-------|------------|
| Breaking Dashboard layout | LOW | BentoGrid handles missing items gracefully |
| Losing useful stats view | LOW | StatusBarPill shows same info + is always visible |
| Import cleanup missed | LOW | TypeScript will error on unused imports |
| User confusion | LOW | Stats consolidated in one place (better UX) |

## Implementation Order

1. **Task 1:** Remove StatsCard usage and ProgressRingCard usage from Dashboard/index.tsx
2. **Task 2:** Delete orphaned component files (StatsCard.tsx, ProgressRingCard.tsx)
3. **Verification:** Build, visual check, orphan scan

## SparklineCard Decision

The SparklineCard for "Pass Rate Trend" has a `currentValue` prop that shows the current pass rate percentage. This is technically redundant with StatusBarPill, but:

- The sparkline itself is NOT redundant (shows trend over time)
- Removing `currentValue` might hurt at-a-glance understanding of the trend

**Recommendation:** Keep SparklineCard as-is. The `currentValue` provides context for the trend line (where the current run sits). The small visual duplication is acceptable for UX.

## Code Examples

### Current Dashboard StatsCard Usage (TO REMOVE)

```tsx
// src/components/Dashboard/index.tsx lines 57-85
<DashboardCard>
  <StatsCard
    status="passed"
    count={stats.passed}
    percentage={reportStore.passRate}
  />
</DashboardCard>
<DashboardCard>
  <StatsCard
    status="failed"
    count={stats.failed}
    percentage={reportStore.failedRate}
  />
</DashboardCard>
<DashboardCard>
  <StatsCard
    status="skipped"
    count={stats.skipped}
    percentage={reportStore.skippedRate}
  />
</DashboardCard>
<DashboardCard>
  <StatsCard
    status="broken"
    count={reportStore.brokenCount}
    percentage={reportStore.brokenRate}
  />
</DashboardCard>
```

### Current ProgressRingCard Usage (TO REMOVE)

```tsx
// src/components/Dashboard/index.tsx lines 87-93
<ProgressRingCard
  title="Pass Rate"
  value={reportStore.passRate}
  colSpan={1}
  rowSpan={1}
/>
```

### StatusBarPill (THE KEEPER)

```tsx
// src/components/StatusBarPill/index.tsx
// Already shows:
// - 40px pass rate ring with percentage
// - passed/failed/skipped/flaky counts
// - run date and duration
// - Responsive: ring only (mobile) -> full (desktop)
```

## Don't Hand-Roll

| Problem | Don't Build | Already Have |
|---------|-------------|--------------|
| Pass rate visualization | Custom ring | StatusBarPill (40px ring) |
| Status counts display | Custom cards | StatusBarPill (inline text) |
| Dashboard stats cards | New components | Remove, use StatusBarPill |

## Common Pitfalls

### Pitfall 1: Incomplete Import Cleanup

**What goes wrong:** Remove component usage but leave import statement
**Why it happens:** Copy-paste deletion misses top of file
**How to avoid:** After removing usage, check imports section
**Warning signs:** TypeScript warnings about unused imports

### Pitfall 2: Breaking BentoGrid Layout

**What goes wrong:** Removing items causes layout gaps
**Why it happens:** Grid expects certain item count
**How to avoid:** BentoGrid auto-flows, so this is actually not a risk
**Warning signs:** Visual gaps in dashboard (test manually)

### Pitfall 3: Deleting Component Still in Use Elsewhere

**What goes wrong:** Delete file that's imported somewhere unexpected
**Why it happens:** Component might be used in another view
**How to avoid:** Grep for component name before deleting
**Warning signs:** Build fails with "module not found"

## Open Questions

None - the cleanup scope is clear and well-defined.

## Sources

### Primary (HIGH confidence)
- `/Users/gda/Documents/github/qase-tms/qase-report/src/components/StatusBarPill/index.tsx` - StatusBarPill implementation
- `/Users/gda/Documents/github/qase-tms/qase-report/src/components/Dashboard/index.tsx` - Dashboard component usage
- `/Users/gda/Documents/github/qase-tms/qase-report/src/components/Dashboard/StatsCard.tsx` - StatsCard implementation
- `/Users/gda/Documents/github/qase-tms/qase-report/src/components/Dashboard/ProgressRingCard.tsx` - ProgressRingCard implementation
- `/Users/gda/Documents/github/qase-tms/qase-report/.planning/phases/28-layout-simplification/28-01-SUMMARY.md` - Phase 28 context
- `/Users/gda/Documents/github/qase-tms/qase-report/.planning/phases/26-persistent-status-bar/26-01-SUMMARY.md` - StatusBarPill decisions

## Metadata

**Confidence breakdown:**
- Component identification: HIGH - direct codebase inspection
- Duplication analysis: HIGH - side-by-side comparison of components
- Implementation plan: HIGH - straightforward removal

**Research date:** 2026-02-11
**Valid until:** N/A (codebase-specific, not library research)
