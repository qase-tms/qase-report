# Phase 24: Comparison View - Research

**Researched:** 2026-02-11
**Domain:** Test run comparison and diff visualization
**Confidence:** HIGH

## Summary

Phase 24 implements comparison view to show differences between two test runs. The phase leverages existing MobX infrastructure (HistoryStore already has HistoricalRun data) and signature-based test identity for stable tracking across runs.

The comparison domain involves three core problems: (1) efficiently computing set differences between test sets using signature-based identity, (2) detecting status transitions and duration changes, and (3) presenting differences in a clear UI using MUI Grid/Card components with visual indicators for changes.

**Primary recommendation:** Use Map-based set operations (O(n+m) performance) for computing test differences, MobX computed properties in AnalyticsStore for reactive caching, and MUI Grid with color-coded Cards for split-screen comparison display.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| MobX | 6.x | Computed comparison data | Already in project, reactive caching |
| MUI 5 | Latest | Comparison UI components | Already in project, Grid/Card/Chip |
| Recharts | 2.15 | Duration comparison charts | Already in project (STATE.md) |
| TypeScript | 5.9 | Type safety for diff results | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Map (ES6) | Native | Set operations for diff | Test signature lookups |
| Array.prototype methods | Native | Filtering/mapping results | Transformation operations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Map-based diff | Lodash difference | Map faster for O(1) lookups, no deps |
| MUI Grid | react-diff-view | Grid simpler for test list diffs, react-diff-view for code |
| Computed properties | On-demand calculation | Computed caches, better for repeated access |

**Installation:**
```bash
# No new dependencies required - all existing in project
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── store/
│   ├── AnalyticsStore.ts    # Add comparison computed properties
│   └── HistoryStore.ts       # Already has HistoricalRun data
├── types/
│   └── comparison.ts         # ComparisonResult, TestDiff types
└── components/
    └── ComparisonView.tsx    # Comparison UI component
```

### Pattern 1: MobX Computed Comparison Data
**What:** Store comparison logic as computed properties in AnalyticsStore
**When to use:** When comparison data needs reactivity and caching
**Example:**
```typescript
// AnalyticsStore pattern (similar to existing failureClusters)
class AnalyticsStore {
  // User selects runs for comparison
  selectedBaseRunId: string | null = null
  selectedCompareRunId: string | null = null

  // Computed property automatically recalculates when selections change
  get comparison(): ComparisonResult | null {
    if (!this.selectedBaseRunId || !this.selectedCompareRunId) return null

    const baseRun = this.getRunById(this.selectedBaseRunId)
    const compareRun = this.getRunById(this.selectedCompareRunId)

    return this.computeComparison(baseRun, compareRun)
  }
}
```

### Pattern 2: Map-Based Set Difference
**What:** Use ES6 Map for O(n+m) test comparison by signature
**When to use:** Comparing test sets to find added/removed/changed tests
**Example:**
```typescript
// Efficient set operations using signature as key
function computeTestDiff(
  baseTests: HistoricalTestRunData[],
  compareTests: HistoricalTestRunData[]
): TestDiff {
  // O(n) - build lookup map
  const baseMap = new Map(baseTests.map(t => [t.signature, t]))
  const compareMap = new Map(compareTests.map(t => [t.signature, t]))

  // O(n) - find added tests
  const added = compareTests.filter(t => !baseMap.has(t.signature))

  // O(m) - find removed tests
  const removed = baseTests.filter(t => !compareMap.has(t.signature))

  // O(n) - find changed tests
  const changed = compareTests.filter(t => {
    const baseTest = baseMap.get(t.signature)
    return baseTest && (
      baseTest.status !== t.status ||
      Math.abs(baseTest.duration - t.duration) > threshold
    )
  })

  return { added, removed, changed }
}
```

### Pattern 3: MUI Grid Split-Screen Layout
**What:** Two-column Grid layout for side-by-side run comparison
**When to use:** Displaying run metadata and statistics for comparison
**Example:**
```typescript
// Split-screen pattern from MUI documentation
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    <Card>
      <CardHeader title="Base Run" />
      <CardContent>
        {/* Base run stats */}
      </CardContent>
    </Card>
  </Grid>
  <Grid item xs={12} md={6}>
    <Card>
      <CardHeader title="Compare Run" />
      <CardContent>
        {/* Compare run stats */}
      </CardContent>
    </Card>
  </Grid>
</Grid>
```

### Pattern 4: Status Change Color Coding
**What:** Use MUI color palette to indicate status transitions
**When to use:** Highlighting test status changes (pass→fail, fail→pass)
**Example:**
```typescript
// Status change indicators from Carbon Design System patterns
function getStatusChangeColor(
  oldStatus: TestStatus,
  newStatus: TestStatus
): string {
  if (oldStatus === 'passed' && newStatus === 'failed') return 'error'    // Red - regression
  if (oldStatus === 'failed' && newStatus === 'passed') return 'success'  // Green - fixed
  if (oldStatus === 'skipped' && newStatus === 'passed') return 'info'    // Blue - new pass
  return 'default'
}

// Apply to Chip component
<Chip
  label={`${oldStatus} → ${newStatus}`}
  color={getStatusChangeColor(oldStatus, newStatus)}
/>
```

### Anti-Patterns to Avoid
- **Recomputing comparison on every render:** Use MobX computed properties for caching
- **O(n²) nested loops for diff:** Use Map for O(1) lookups instead of Array.find
- **Comparing by test UUID:** Use signature field (stable identifier) not id (run-specific)
- **Not handling missing data:** Guard against runs with no test history data

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Set difference algorithm | Custom nested loops | Map-based filter | O(n+m) vs O(n²), proven approach |
| Reactive caching | Manual cache invalidation | MobX computed | Already in stack, automatic deps |
| Grid layout | Flexbox calculations | MUI Grid | Responsive breakpoints built-in |
| Duration comparison | Custom threshold logic | Reuse regression detection | Already has 2-sigma logic (STATE.md) |

**Key insight:** Project already has 90% of required infrastructure - HistoryStore has HistoricalRun data, AnalyticsStore has computed pattern examples (failureClusters, galleryAttachments), and signature-based identity is proven for cross-run tracking.

## Common Pitfalls

### Pitfall 1: Comparing by Test UUID Instead of Signature
**What goes wrong:** Tests get treated as "added/removed" when they're the same test across runs
**Why it happens:** QaseTestResult.id is UUID, changes every run; signature is stable identifier
**How to avoid:** Always use test.signature for cross-run identity (already proven in HistoryStore.addCurrentRun)
**Warning signs:** Every test shows as "added" in newer run and "removed" in older run

### Pitfall 2: O(n²) Nested Loop Comparison
**What goes wrong:** Performance degrades badly with 100+ tests (v1.3 targets 100-500 tests)
**Why it happens:** Using Array.find inside Array.filter creates nested loops
**How to avoid:** Build Map once (O(n)), then use Map.has() for O(1) lookups
**Warning signs:** Slow comparison computation on larger test suites

### Pitfall 3: Not Handling Runs Without Test History
**What goes wrong:** Comparison fails when HistoricalRun exists but no per-test data
**Why it happens:** HistoryStore has separate runs[] and tests[] arrays; user may not have history file
**How to avoid:** Check HistoryStore.getTestHistory() returns non-empty array before comparing
**Warning signs:** TypeError when accessing test properties, empty comparison results

### Pitfall 4: Duration Difference Sensitivity
**What goes wrong:** All tests show as "changed" due to minor duration fluctuations
**Why it happens:** Comparing exact duration values (milliseconds vary naturally)
**How to avoid:** Use threshold (e.g., >10% change or >100ms absolute) or reuse 2-sigma regression logic
**Warning signs:** Every test highlighted as changed, no "unchanged" tests shown

### Pitfall 5: Forgetting Mobile Responsiveness
**What goes wrong:** Split-screen layout breaks on mobile (xs screens)
**Why it happens:** MUI Grid xs={6} forces two columns even on narrow screens
**How to avoid:** Use xs={12} md={6} - full width on mobile, split on desktop
**Warning signs:** Horizontal scrolling on mobile, Cards too narrow to read

## Code Examples

Verified patterns from project codebase:

### Map Construction from History Data
```typescript
// Source: Derived from HistoryStore.getTestHistory pattern
// Get test history for a specific run
function getTestsForRun(
  runId: string,
  history: QaseHistory
): Map<string, HistoricalTestRunData> {
  const testsMap = new Map<string, HistoricalTestRunData>()

  for (const testEntry of history.tests) {
    const runData = testEntry.runs.find(r => r.run_id === runId)
    if (runData) {
      testsMap.set(testEntry.signature, runData)
    }
  }

  return testsMap
}
```

### MobX Computed Property Pattern
```typescript
// Source: AnalyticsStore.failureClusters (lines 260-287)
// Existing pattern for computed lists
class AnalyticsStore {
  get failureClusters(): FailureCluster[] {
    const failedTests = this.root.testResultsStore.resultsList
      .filter(test => test.execution.status === 'failed')

    if (failedTests.length === 0) return []

    // ... clustering logic

    return clusters
  }

  get failureClusterCount(): number {
    return this.failureClusters.length
  }

  get hasFailureClusters(): boolean {
    return this.failureClusters.length > 0
  }
}
```

### Signature-Based Test Tracking
```typescript
// Source: HistoryStore.addCurrentRun (lines 213-214)
// Proven pattern for stable test identity
for (const testResult of testResults.values()) {
  const signature = testResult.signature
  if (!signature) continue

  // Find or create test entry by signature
  let testEntry = this.history.tests.find((t) => t.signature === signature)
  if (!testEntry) {
    testEntry = {
      signature,
      title: testResult.title,
      runs: [],
    }
    this.history.tests.push(testEntry)
  }
  // ... add run data
}
```

### MUI Grid Responsive Layout
```typescript
// Source: MUI documentation pattern
// Two-column layout that collapses on mobile
<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    <Card>
      {/* Content for column 1 */}
    </Card>
  </Grid>
  <Grid item xs={12} md={6}>
    <Card>
      {/* Content for column 2 */}
    </Card>
  </Grid>
</Grid>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| UUID-based identity | Signature-based identity | v1.1 (Phase 8) | Stable test tracking |
| Manual cache invalidation | MobX computed properties | v1.1 (Phase 9) | Reactive trend data |
| Manual threshold tuning | 2-sigma outlier detection | v1.1 (Phase 11) | Statistical regression alerts |
| Plain objects | ES6 Map for lookups | Modern JS | O(1) vs O(n) lookups |

**Deprecated/outdated:**
- Comparing tests by UUID (id field) - use signature field instead (v1.1+)
- Array.find for set membership - use Map.has() for performance (ES6+)

## Open Questions

1. **Duration change threshold - absolute or percentage?**
   - What we know: Project uses 2-sigma for regression (mean + 2*stdDev)
   - What's unclear: Should comparison highlight ANY duration change or use threshold?
   - Recommendation: Reuse 2-sigma logic from AnalyticsStore.getPerformanceRegression for consistency

2. **Compare against current run or only historical runs?**
   - What we know: HistoryStore.addCurrentRun adds current run to history
   - What's unclear: Can user compare current run to previous, or only historical-to-historical?
   - Recommendation: Support both - include current run in comparison dropdown (most recent run is usually most interesting)

3. **Maximum runs to show in comparison selector?**
   - What we know: MAX_RUNS = 100 (HistoryStore line 23), recentRuns returns last 10
   - What's unclear: Show all 100 runs or limit dropdown?
   - Recommendation: Show recent 20 runs (balance discoverability vs dropdown size)

## Sources

### Primary (HIGH confidence)
- Project codebase: `/src/store/HistoryStore.ts` - HistoricalRun schema, signature-based tracking
- Project codebase: `/src/store/AnalyticsStore.ts` - Computed property patterns (failureClusters, galleryAttachments)
- Project codebase: `/src/schemas/QaseHistory.schema.ts` - Data structures for historical runs and tests
- `.planning/STATE.md` - Design decisions: MobX computed properties, signature-based identity, 2-sigma regression
- `.planning/PROJECT.md` - Tech stack: React 18, TypeScript 5.9, MUI 5, MobX, Recharts

### Secondary (MEDIUM confidence)
- [MobX Computeds Documentation](https://mobx.js.org/computeds.html) - Computed properties with automatic caching
- [MUI React Grid](https://mui.com/material-ui/react-grid/) - Responsive grid layout patterns
- [MUI React Card](https://mui.com/material-ui/react-card/) - Card component for comparison display
- [JavaScript Map/Set Performance](https://javascript.info/map-set) - ES6 Map for O(1) lookups
- [Carbon Design System Status Indicators](https://carbondesignsystem.com/patterns/status-indicator-pattern/) - Color coding for status changes
- [diff-arrays-of-objects npm](https://www.npmjs.com/package/diff-arrays-of-objects) - Array diff algorithm patterns

### Tertiary (LOW confidence)
- [Playwright Visual Testing](https://playwright.dev/docs/test-snapshots) - Comparison display patterns (visual testing context, not test list)
- [Allure Report Visual Comparison](https://allurereport.org/docs/attachments/) - Show diff/show overlay modes (image comparison, not test results)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already in project, verified in package.json via STATE.md/PROJECT.md
- Architecture: HIGH - Patterns verified in existing codebase (AnalyticsStore computed, HistoryStore signature tracking)
- Pitfalls: HIGH - Identified from actual project constraints (signature-based identity requirement, 100-500 test scale target)

**Research date:** 2026-02-11
**Valid until:** ~30 days (stable domain - diff algorithms and MobX patterns unlikely to change)
