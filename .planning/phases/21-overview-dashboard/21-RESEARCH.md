# Phase 21: Overview Dashboard - Research

**Researched:** 2026-02-10
**Domain:** Dashboard composition with MobX state management, Recharts visualization, MUI components
**Confidence:** HIGH

## Summary

Phase 21 builds on the existing Dashboard implementation (src/components/Dashboard/) to add comprehensive overview sections. The codebase already has all necessary building blocks: BentoGrid responsive layout, SparklineCard for trends, reusable card patterns, and rich store data from ReportStore, TestResultsStore, and AnalyticsStore.

Key findings:
- BentoGrid uses CSS Grid with responsive breakpoints (4 columns @900px, 6 columns @1280px)
- SparklineCard already renders trends with Recharts (used for Pass Rate and Duration trends)
- AnalyticsStore provides alerts (failed + flaky tests) via computed `.alerts` property
- ReportStore has suite information in `runData.suites` array
- Test results contain suite relations in `relations.suite.data` array
- MUI LinearProgress used in TestHealthWidget for progress bars (good pattern for suite pass rates)

**Primary recommendation:** Use existing card components (DashboardCard, SparklineCard), add new SuiteHealthCard and QuickInsightsCard following established patterns, compute suite-level metrics in new ReportStore computed properties.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | ^18.2.0 | UI framework | Project standard |
| TypeScript | ^5.9.3 | Type safety | Project standard |
| MobX | ^6.9.0 | State management | Existing store pattern |
| mobx-react-lite | ^3.4.3 | React bindings | Standard for MobX in React |
| MUI 5 | ^5.12.0 | UI components | Existing component library |
| Recharts | ^2.15.4 | Charts/sparklines | Already used for trends |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @mui/icons-material | ^5.18.0 | Icons | Already used in AlertsPanel |
| Emotion | ^11.10.6 | MUI styling | MUI dependency |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Chart.js | Recharts already integrated, React-native |
| MUI LinearProgress | Custom CSS | LinearProgress is MUI standard, accessible |
| Computed properties | Action methods | Computed is reactive, auto-updates |

**Installation:**
No new packages needed - all dependencies already installed.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   └── Dashboard/
│       ├── BentoGrid.tsx          # Existing - responsive grid
│       ├── DashboardCard.tsx      # Existing - wrapper with hover
│       ├── SparklineCard.tsx      # Existing - trend visualization
│       ├── SuiteHealthCard.tsx    # NEW - suite pass rate list
│       ├── AttentionRequiredCard.tsx  # NEW - failed/flaky list
│       ├── QuickInsightsCard.tsx  # NEW - top failures/slowest
│       └── index.tsx              # UPDATE - compose new cards
├── store/
│   ├── ReportStore.ts             # UPDATE - add suite metrics
│   ├── AnalyticsStore.ts          # Existing - alerts already present
│   └── TestResultsStore.ts        # Existing - test data source
```

### Pattern 1: Dashboard Card Composition
**What:** Cards wrap content in DashboardCard with colSpan/rowSpan for grid placement
**When to use:** All dashboard widgets
**Example:**
```typescript
// Source: src/components/Dashboard/SparklineCard.tsx
export const SparklineCard = ({
  title,
  data,
  colSpan = 2,
  rowSpan = 1,
  currentValue,
}: SparklineCardProps) => {
  return (
    <DashboardCard colSpan={colSpan} rowSpan={rowSpan}>
      <Typography variant="caption" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {currentValue !== undefined && (
        <Typography variant="h4">{currentValue}</Typography>
      )}
      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" />
        </LineChart>
      </ResponsiveContainer>
    </DashboardCard>
  )
}
```

### Pattern 2: MobX Observer Components
**What:** Components that read store data use observer() HOC
**When to use:** Any component reading from stores
**Example:**
```typescript
// Source: src/components/Dashboard/index.tsx
export const Dashboard = observer(() => {
  const { reportStore, analyticsStore, historyStore, testResultsStore } = useRootStore()

  if (!reportStore.runData) {
    return <Typography>Load a report to view dashboard</Typography>
  }

  return (
    <BentoGrid>
      {/* Cards conditionally rendered based on store state */}
      {analyticsStore.hasAlerts && (
        <DashboardCard colSpan={3}>
          <AlertsPanel onAlertClick={handleAlertClick} />
        </DashboardCard>
      )}
    </BentoGrid>
  )
})
```

### Pattern 3: MobX Computed Properties
**What:** Derived state computed from store data with automatic caching
**When to use:** Aggregations, filters, derived metrics
**Example:**
```typescript
// Source: src/store/AnalyticsStore.ts
export class AnalyticsStore {
  constructor(public root: RootStore) {
    makeAutoObservable(this)
  }

  get alerts(): AlertItem[] {
    const history = this.root.historyStore.history
    if (!history) return []

    const alerts: AlertItem[] = []
    for (const test of history.tests) {
      const flakiness = this.getFlakinessScore(test.signature)
      if (flakiness.status === 'flaky') {
        alerts.push({
          id: `flaky-${test.signature}`,
          type: 'flaky_warning',
          severity: 'warning',
          testSignature: test.signature,
          testTitle: test.title,
          message: `Flaky in ${flakiness.statusChanges} runs`,
        })
      }
    }
    return alerts
  }
}
```

### Pattern 4: Progress Bar Lists (from TestHealthWidget)
**What:** List items with LinearProgress showing percentage distribution
**When to use:** Suite health, grade distribution, any categorical breakdown
**Example:**
```typescript
// Source: src/components/Dashboard/TestHealthWidget.tsx
<Stack spacing={1.5}>
  {grades.map((grade) => {
    const count = gradeDistribution[grade]
    const percentage = total > 0 ? (count / total) * 100 : 0

    return (
      <Box key={grade}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Chip label={grade} color={config.color} size="small" />
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              color={config.color}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
          <Typography variant="body2">
            {count} ({percentage.toFixed(0)}%)
          </Typography>
        </Box>
      </Box>
    )
  })}
</Stack>
```

### Pattern 5: Test Navigation from Cards
**What:** Cards can trigger test selection via onAlertClick callback
**When to use:** Attention Required, Quick Insights (clickable test lists)
**Example:**
```typescript
// Source: src/components/Dashboard/index.tsx
const handleAlertClick = (testSignature: string) => {
  // Find test with matching signature
  for (const [id, test] of testResultsStore.testResults) {
    if (test.signature === testSignature) {
      reportStore.root.selectTest(id)
      return
    }
  }
}

// Pass to child component
<AlertsPanel onAlertClick={handleAlertClick} />
```

### Anti-Patterns to Avoid
- **Direct localStorage access in components:** Use stores (HistoryStore pattern)
- **Inline data computations in render:** Use MobX computed properties
- **Card-specific styling in BentoGrid:** BentoGrid handles only layout, cards handle content
- **Hardcoded grid positions:** Use colSpan/rowSpan props for flexibility

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sparkline trend charts | Custom SVG/Canvas | SparklineCard (existing) | Already implemented with Recharts |
| Progress bars | Custom CSS bars | MUI LinearProgress | Accessible, themed, animated |
| Card hover effects | Custom transitions | DashboardCard (existing) | Consistent animations across dashboard |
| Alert detection | Manual status checking | AnalyticsStore.alerts | Already computed with flakiness + regression logic |
| Test selection/navigation | Direct state mutation | RootStore.selectTest() | Coordinated dock opening + selection |
| Grid responsiveness | Media queries per card | BentoGrid + colSpan/rowSpan | Centralized breakpoint management |

**Key insight:** Dashboard phase builds on mature patterns. Use existing components and computed properties rather than reimplementing visualization or state logic.

## Common Pitfalls

### Pitfall 1: Suite Data Extraction
**What goes wrong:** Assuming suites are pre-aggregated in ReportStore
**Why it happens:** runData.suites is just an array of suite names, not metrics
**How to avoid:** Compute suite metrics by grouping testResults by suite relation
**Warning signs:** Empty suite list despite tests having suite relations

**Solution pattern:**
```typescript
// In ReportStore.ts
get suitePassRates(): Array<{ suite: string; passRate: number; total: number }> {
  if (!this.runData) return []

  // Group tests by suite using testResultsStore
  const suiteGroups = new Map<string, { passed: number; total: number }>()

  for (const test of this.root.testResultsStore.resultsList) {
    const suites = test.relations?.suite?.data || []

    for (const suite of suites) {
      const existing = suiteGroups.get(suite.title) || { passed: 0, total: 0 }
      existing.total++
      if (test.execution.status === 'passed') existing.passed++
      suiteGroups.set(suite.title, existing)
    }
  }

  return Array.from(suiteGroups.entries()).map(([suite, stats]) => ({
    suite,
    passRate: (stats.passed / stats.total) * 100,
    total: stats.total,
  }))
}
```

### Pitfall 2: Conditional Rendering Without Guards
**What goes wrong:** Rendering cards when data not available, causing errors
**Why it happens:** Not checking store loading state or data presence
**How to avoid:** Guard all conditional dashboard sections with existence checks
**Warning signs:** Console errors about undefined properties

**Solution pattern:**
```typescript
// Always check data availability
{reportStore.suitePassRates.length > 0 && (
  <DashboardCard colSpan={3}>
    <SuiteHealthCard />
  </DashboardCard>
)}

// Within component, check store state
if (!reportStore.runData) {
  return <Typography>No data available</Typography>
}
```

### Pitfall 3: Alert vs Attention Required Confusion
**What goes wrong:** Using AnalyticsStore.alerts for "Attention Required" section
**Why it happens:** Alerts include flaky tests (warnings), but "Attention Required" is failed + flaky from current run
**How to avoid:** Filter current test results by status, combine with AnalyticsStore flaky signatures
**Warning signs:** Showing historical flaky tests not in current run

**Solution pattern:**
```typescript
// Attention Required = current failed tests + current tests that are historically flaky
get attentionRequiredTests(): QaseTestResult[] {
  const failed = this.root.testResultsStore.resultsList.filter(
    t => t.execution.status === 'failed'
  )

  const flaky = this.root.testResultsStore.resultsList.filter(
    t => t.signature && this.root.analyticsStore.flakyTests.includes(t.signature)
  )

  // Deduplicate (test can be both failed and flaky)
  const ids = new Set([...failed, ...flaky].map(t => t.id))
  return this.root.testResultsStore.resultsList.filter(t => ids.has(t.id))
}
```

### Pitfall 4: Slowest/Top Failures Sorting
**What goes wrong:** Not handling edge cases (skipped tests, zero duration)
**Why it happens:** Direct .sort() without filtering invalid entries
**How to avoid:** Filter relevant statuses first, handle null/zero durations
**Warning signs:** Skipped tests appearing in "slowest tests"

**Solution pattern:**
```typescript
// Top failures: failed tests with failure count (if history available)
get topFailures(): Array<{ test: QaseTestResult; count: number }> {
  const failedTests = this.root.testResultsStore.resultsList.filter(
    t => t.execution.status === 'failed'
  )

  return failedTests.map(test => ({
    test,
    count: test.signature
      ? this.root.historyStore.getTestHistory(test.signature)
          .filter(r => r.status === 'failed').length
      : 1,
  }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5)
}

// Slowest tests: only passed/failed (exclude skipped/broken)
get slowestTests(): QaseTestResult[] {
  return this.root.testResultsStore.resultsList
    .filter(t => ['passed', 'failed'].includes(t.execution.status))
    .filter(t => t.execution.duration > 0)
    .sort((a, b) => b.execution.duration - a.execution.duration)
    .slice(0, 5)
}
```

## Code Examples

Verified patterns from official sources:

### Existing SparklineCard Usage (Pass Rate with Trend)
```typescript
// Source: src/components/Dashboard/index.tsx (lines 88-96)
{analyticsStore.hasTrendData && (
  <SparklineCard
    title="Pass Rate Trend"
    data={analyticsStore.passRateTrend.map(d => ({
      value: d.passRate,
      label: d.date
    }))}
    currentValue={`${reportStore.passRate.toFixed(0)}%`}
    colSpan={2}
    rowSpan={1}
  />
)}
```

### Existing Alert Detection and Display
```typescript
// Source: src/store/AnalyticsStore.ts (lines 110-186)
get alerts(): AlertItem[] {
  const history = this.root.historyStore.history
  if (!history || history.tests.length === 0) return []

  const alerts: AlertItem[] = []

  for (const test of history.tests) {
    const signature = test.signature

    // Flaky detection
    const flakiness = this.getFlakinessScore(signature)
    if (flakiness.status === 'flaky') {
      alerts.push({
        id: `flaky-${signature}`,
        type: 'flaky_warning',
        severity: 'warning',
        testSignature: signature,
        testTitle: test.title,
        message: `Flaky in ${flakiness.statusChanges} runs`,
      })
    } else if (flakiness.status === 'new_failure') {
      alerts.push({
        id: `new-failure-${signature}`,
        type: 'new_failure',
        severity: 'error',
        testSignature: signature,
        testTitle: test.title,
        message: `Started failing after stable runs`,
      })
    }

    // Performance regression
    const regression = this.getPerformanceRegression(signature)
    if (regression?.isRegression) {
      alerts.push({
        id: `regression-${signature}`,
        type: 'performance_regression',
        severity: 'error',
        testSignature: signature,
        testTitle: test.title,
        message: `Duration above normal`,
      })
    }
  }

  return alerts.sort((a, b) =>
    a.severity === 'error' ? -1 : 1
  )
}

get hasAlerts(): boolean {
  return this.alerts.length > 0
}
```

### MUI Card with List Pattern
```typescript
// Source: src/components/Dashboard/AlertsPanel.tsx (lines 65-134)
<Card>
  <CardHeader
    title={
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningAmberIcon color="warning" />
        <Typography variant="h6">Alerts</Typography>
        <Chip label={alerts.length} size="small" color="warning" />
      </Box>
    }
  />
  <CardContent>
    <List dense disablePadding>
      {alerts.slice(0, 10).map((alert) => (
        <ListItem key={alert.id} disablePadding>
          <ListItemButton onClick={() => onAlertClick(alert.testSignature)}>
            <ListItemIcon>{getAlertIcon(alert.type)}</ListItemIcon>
            <ListItemText
              primary={alert.testTitle}
              secondary={alert.message}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  </CardContent>
</Card>
```

### BentoGrid Integration Pattern
```typescript
// Source: src/components/Dashboard/index.tsx (lines 48-143)
<BentoGrid>
  {/* 1x1 compact stat cards */}
  <DashboardCard><StatsCard status="passed" count={stats.passed} /></DashboardCard>
  <DashboardCard><StatsCard status="failed" count={stats.failed} /></DashboardCard>

  {/* 2x1 sparkline with trend */}
  {analyticsStore.hasTrendData && (
    <SparklineCard
      title="Pass Rate Trend"
      data={analyticsStore.passRateTrend.map(d => ({ value: d.passRate, label: d.date }))}
      currentValue={`${reportStore.passRate.toFixed(0)}%`}
      colSpan={2}
      rowSpan={1}
    />
  )}

  {/* 3x1 wide alert panel */}
  {analyticsStore.hasAlerts && (
    <DashboardCard colSpan={3}>
      <AlertsPanel onAlertClick={handleAlertClick} />
    </DashboardCard>
  )}

  {/* 4x2 large chart */}
  {analyticsStore.hasTrendData && (
    <DashboardCard colSpan={4} rowSpan={2}>
      <TrendsChart />
    </DashboardCard>
  )}
</BentoGrid>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static dashboard | Conditional rendering based on data | Existing pattern | Cards only show when data available |
| Manual trend computation | MobX computed properties | Existing (AnalyticsStore) | Auto-updates, cached |
| Inline data filtering | Store-level computed getters | Existing (TestResultsStore.filteredResults) | Reusable, testable |
| Custom chart components | Recharts library | Phase 15 (SparklineCard) | Consistent, accessible |

**Deprecated/outdated:**
- None identified - existing patterns are current

## Open Questions

1. **Suite Health section layout**
   - What we know: TestHealthWidget uses LinearProgress bars in Stack (vertical list)
   - What's unclear: Should Suite Health use same pattern or horizontal bar chart?
   - Recommendation: Use LinearProgress Stack pattern (consistent with TestHealthWidget)

2. **Quick Insights grid placement**
   - What we know: Existing cards use colSpan 1-4, rowSpan 1-2
   - What's unclear: Should Quick Insights be two separate cards (Top Failures + Slowest) or single card with sections?
   - Recommendation: Single card with two sections (more compact, similar to TrendsChart with multiple charts)

3. **Attention Required deduplication**
   - What we know: A test can be both failed and flaky
   - What's unclear: Show once or twice with different badges?
   - Recommendation: Show once with multiple badges (primary: failed, secondary: flaky)

## Sources

### Primary (HIGH confidence)
- src/components/Dashboard/ - All existing dashboard components examined
- src/store/ReportStore.ts - Run data structure and computed properties
- src/store/AnalyticsStore.ts - Alert computation, trend data, flakiness detection
- src/store/TestResultsStore.ts - Test filtering patterns
- src/schemas/QaseRun.schema.ts - Suite array structure (line 183)
- src/schemas/QaseTestResult.schema.ts - Suite relations structure (lines 53-71)
- package.json - Recharts 2.15.4, MUI 5.12.0 confirmed

### Secondary (MEDIUM confidence)
- None required - all findings from codebase

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already installed and in use
- Architecture: HIGH - Patterns verified from existing implementation
- Pitfalls: HIGH - Identified from data schema analysis and common React/MobX patterns

**Research date:** 2026-02-10
**Valid until:** ~2026-03-12 (30 days - stable stack, no major updates expected)
