# Phase 40: Timeline View - Research

**Researched:** 2026-02-12
**Domain:** Timeline visualization for test execution
**Confidence:** HIGH

## Summary

Timeline view for test execution requires visualizing tests as horizontal bars with start/end times, showing parallel vs sequential execution. The phase adds a new "timeline" tab to existing navigation (currently: dashboard, tests, failure-clusters, gallery, comparison).

**Key technical decisions:**
1. **Custom component with shadcn/ui patterns** is recommended over heavy libraries (vis-timeline, Gantt libraries)
2. **Use existing tech stack**: React + TypeScript, Tailwind CSS v4, shadcn/ui patterns, MobX
3. **Simple horizontal bar visualization** with swimlanes for parallel execution (similar to Gantt chart but simpler)
4. **Leverage existing test data**: `start_time`, `end_time`, `duration`, `thread` fields from `QaseTestResult`

**Primary recommendation:** Build a custom timeline component using Tailwind CSS and shadcn/ui patterns rather than integrating external timeline libraries. This aligns with project architecture (already migrated from MUI to shadcn/ui), avoids heavy dependencies, and provides full control over visualization.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 18 | ^18.2.0 | Framework | Already in project |
| TypeScript | ^5.9.3 | Type safety | Already in project |
| Tailwind CSS | ^4.1.18 | Styling | v1.5 migration complete |
| shadcn/ui | ^3.8.4 | Component patterns | v1.5 migration complete |
| lucide-react | ^0.563.0 | Icons | Project standard |
| MobX | ^6.9.0 | State management | Project architecture |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Recharts | ^2.15.4 | Charts (if needed) | If timeline requires complex chart patterns, though custom is preferred |
| @tanstack/react-virtual | ^3.13.18 | Virtualization | If timeline has 1000+ tests for performance |
| class-variance-authority | ^0.7.1 | Component variants | For timeline component API variants |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom component | vis-timeline + react-visjs-timeline | Heavy (complex API, styling conflicts with Tailwind), no native React 18 support confirmed |
| Custom component | shadcn-timeline library | Vertical-only timelines, doesn't support duration bars/Gantt-style visualization |
| Custom component | react-google-charts Timeline | External dependency, less control over styling, doesn't match shadcn/ui patterns |
| Recharts custom | Specialized Gantt libraries (Syncfusion, DevExpress) | Commercial/heavy, overkill for simple timeline needs |

**Installation:**
No new packages required. All dependencies already present in project.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── Timeline/          # New timeline component
│   │   ├── index.tsx      # Main Timeline container (observer)
│   │   ├── TimelineBar.tsx # Individual test bar
│   │   ├── TimelineAxis.tsx # Time axis/scale
│   │   └── TimelineLegend.tsx # Status legend
│   ├── TabNavigation/     # Update to add timeline tab
│   └── ui/                # shadcn/ui primitives
├── store/
│   └── index.tsx          # Update RootStore with 'timeline' activeView
├── layout/
│   └── MainLayout/        # Update to render Timeline view
└── types/
    └── qase-report.types.ts # Already has QaseTestResult with timing data
```

### Pattern 1: Timeline Container Component
**What:** Observer component that reads test results from MobX store and renders timeline
**When to use:** Main timeline view in MainLayout renderView()
**Example:**
```typescript
// src/components/Timeline/index.tsx
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { Card } from '../ui/card'

export const Timeline = observer(() => {
  const { testResultsStore } = useRootStore()

  // Convert Map to array and sort by start_time
  const tests = Array.from(testResultsStore.testResults.values())
    .sort((a, b) => a.execution.start_time - b.execution.start_time)

  // Calculate timeline bounds
  const minTime = Math.min(...tests.map(t => t.execution.start_time))
  const maxTime = Math.max(...tests.map(t => t.execution.end_time))
  const totalDuration = maxTime - minTime

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Test Execution Timeline</h2>
      {/* Timeline visualization */}
    </Card>
  )
})
```

### Pattern 2: Horizontal Bar with Positioning
**What:** CSS-based positioning for timeline bars using start/end times
**When to use:** Individual test bars in timeline
**Example:**
```typescript
// src/components/Timeline/TimelineBar.tsx
interface TimelineBarProps {
  test: QaseTestResult
  minTime: number
  totalDuration: number
}

export const TimelineBar = ({ test, minTime, totalDuration }: TimelineBarProps) => {
  const { execution } = test
  const startOffset = ((execution.start_time - minTime) / totalDuration) * 100
  const width = (execution.duration / totalDuration) * 100

  return (
    <div
      className="absolute h-8 rounded flex items-center px-2 text-sm"
      style={{
        left: `${startOffset}%`,
        width: `${width}%`,
        backgroundColor: getStatusColor(execution.status),
      }}
      title={test.title}
    >
      {test.title}
    </div>
  )
}

function getStatusColor(status: string) {
  const colors = {
    passed: 'hsl(var(--success))',
    failed: 'hsl(var(--destructive))',
    skipped: 'hsl(var(--muted))',
    broken: 'hsl(var(--warning))',
  }
  return colors[status] || 'hsl(var(--muted))'
}
```

### Pattern 3: Thread-based Swimlanes for Parallel Execution
**What:** Group tests by `thread` field to show parallel execution in separate lanes
**When to use:** When tests have thread identifiers
**Example:**
```typescript
// Group tests by thread
const groupedByThread = tests.reduce((acc, test) => {
  const thread = test.execution.thread || 'main'
  if (!acc[thread]) acc[thread] = []
  acc[thread].push(test)
  return acc
}, {} as Record<string, QaseTestResult[]>)

// Render swimlanes
return (
  <div className="space-y-4">
    {Object.entries(groupedByThread).map(([thread, threadTests]) => (
      <div key={thread} className="border-l-2 border-muted pl-4">
        <div className="text-sm font-medium text-muted-foreground mb-2">
          Thread: {thread}
        </div>
        <div className="relative h-10">
          {threadTests.map(test => (
            <TimelineBar
              key={test.id}
              test={test}
              minTime={minTime}
              totalDuration={totalDuration}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
)
```

### Pattern 4: Time Axis with Scale
**What:** Horizontal axis showing time markers
**When to use:** At top or bottom of timeline
**Example:**
```typescript
// src/components/Timeline/TimelineAxis.tsx
interface TimelineAxisProps {
  minTime: number
  maxTime: number
}

export const TimelineAxis = ({ minTime, maxTime }: TimelineAxisProps) => {
  const duration = maxTime - minTime
  const markers = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    position: ratio * 100,
    time: new Date(minTime + duration * ratio),
  }))

  return (
    <div className="relative h-8 border-b border-border">
      {markers.map(({ position, time }) => (
        <div
          key={position}
          className="absolute flex flex-col items-center"
          style={{ left: `${position}%` }}
        >
          <div className="h-2 w-px bg-border" />
          <span className="text-xs text-muted-foreground mt-1">
            {time.toLocaleTimeString()}
          </span>
        </div>
      ))}
    </div>
  )
}
```

### Pattern 5: Integration with Existing Navigation
**What:** Add timeline to TabNavigation and RootStore
**When to use:** Phase implementation
**Example:**
```typescript
// src/store/index.tsx - Update type
activeView: 'dashboard' | 'tests' | 'analytics' | 'failure-clusters' | 'gallery' | 'comparison' | 'timeline' = 'dashboard'

setActiveView = (view: 'dashboard' | 'tests' | 'analytics' | 'failure-clusters' | 'gallery' | 'comparison' | 'timeline') => {
  this.activeView = view
}

// src/components/TabNavigation/index.tsx - Add tab
import { Clock } from 'lucide-react'

const tabs = [
  { value: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { value: 'tests', label: 'Test cases', icon: List },
  { value: 'failure-clusters', label: 'Failure Clusters', icon: AlertCircle },
  { value: 'gallery', label: 'Gallery', icon: Images },
  { value: 'comparison', label: 'Comparison', icon: ArrowLeftRight },
  { value: 'timeline', label: 'Timeline', icon: Clock }, // NEW
] as const

// src/layout/MainLayout/index.tsx - Add view case
if (activeView === 'timeline') {
  return <Timeline />
}
```

### Anti-Patterns to Avoid
- **Don't use external timeline libraries**: vis-timeline has React 18 compatibility issues, requires CSS imports conflicting with Tailwind, and doesn't follow shadcn/ui patterns
- **Don't overcomplicate with Recharts**: Recharts has no native Gantt/timeline support, requires custom ScatterChart workarounds that are more complex than CSS positioning
- **Don't ignore thread field**: Tests have `execution.thread` for parallel execution tracking—use it for swimlanes
- **Don't use absolute timestamps in UI**: Convert to relative positions (percentages) for responsive layout
- **Don't render all bars if 1000+ tests**: Consider virtualization with @tanstack/react-virtual (already in project)

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Virtualization for 1000+ items | Custom scroll/windowing logic | @tanstack/react-virtual | Already in project, handles edge cases (dynamic heights, scroll restoration) |
| Status color mapping | Hardcoded colors per status | CSS variables from shadcn/ui theme | Consistent with project theme, supports dark mode |
| Time formatting | Custom date string functions | `Date.toLocaleTimeString()` or `Intl.DateTimeFormat` | Locale-aware, handles timezones |
| Component variants | Manual className construction | class-variance-authority (cva) | Already in project, type-safe variants |
| Tooltip/hover states | Custom hover logic | Native title attribute or shadcn/ui Tooltip | Simple for v1, can upgrade to shadcn Tooltip later |

**Key insight:** Timeline visualization is simpler than it appears. Core pattern is CSS positioning (left %, width %) over a container. Avoid heavy charting libraries that add complexity without benefit for this use case.

## Common Pitfalls

### Pitfall 1: Using vis-timeline/react-visjs-timeline
**What goes wrong:** vis-timeline is powerful but has poor React integration, requires importing separate CSS that conflicts with Tailwind, and has unresolved React 18 compatibility discussions (GitHub issue #1779). The wrapper libraries (react-visjs-timeline, react-vis-timeline) are poorly maintained (last publish 5+ years ago for some).
**Why it happens:** Developers search "React timeline" and find vis-timeline as top result
**How to avoid:** Build custom component with Tailwind CSS—much simpler for this use case
**Warning signs:** If you're importing `vis-timeline/styles/vis-timeline-graph2d.min.css` or wrestling with React 18 warnings

### Pitfall 2: Recharts Gantt Chart Workarounds
**What goes wrong:** Recharts has no native Gantt/timeline support (GitHub issue #813 closed without implementation). Workarounds using ScatterChart + CustomShape are more complex than direct CSS positioning.
**Why it happens:** Project already uses Recharts, seems natural to use for timeline
**How to avoid:** Recharts is for statistical charts (line, bar, area), not timeline/Gantt. Use CSS positioning for timeline bars.
**Warning signs:** If you're using ScatterChart or BarChart with complex data transformations to fake timeline appearance

### Pitfall 3: Ignoring Parallel Execution (Thread Field)
**What goes wrong:** Showing all tests in single row makes parallel execution invisible—tests overlap and timeline is unreadable
**Why it happens:** Overlooking `execution.thread` field in test data
**How to avoid:** Group tests by thread into swimlanes (separate rows per thread)
**Warning signs:** Timeline bars overlap, can't distinguish which tests ran simultaneously

### Pitfall 4: Absolute Pixel Positioning
**What goes wrong:** Using absolute pixel widths (e.g., `width: 50px`) breaks responsive layout, doesn't scale with container
**Why it happens:** Thinking in fixed units instead of relative positioning
**How to avoid:** Use percentage-based positioning: `left: X%` and `width: Y%` based on `(value / totalDuration) * 100`
**Warning signs:** Timeline doesn't resize with window, bars misaligned on different screen sizes

### Pitfall 5: Not Handling Empty Timeline State
**What goes wrong:** Runtime errors or blank screen when no report loaded or no tests have timing data
**Why it happens:** Not checking if `testResultsStore.testResults` is empty before calculating min/max times
**How to avoid:** Early return with empty state message if no tests or report not loaded
**Warning signs:** Console errors about `Math.min()` on empty array, or division by zero

### Pitfall 6: Poor Performance with Large Test Suites
**What goes wrong:** Rendering 1000+ DOM elements for test bars causes lag, slow scrolling
**Why it happens:** Rendering all timeline bars at once without virtualization
**How to avoid:** Use @tanstack/react-virtual (already in project) for timelines with 500+ tests. Start without virtualization, add if needed.
**Warning signs:** Slow initial render, laggy horizontal scrolling on large reports

### Pitfall 7: Missing Test Details on Click
**What goes wrong:** Users can't access test details from timeline—clicking bar does nothing
**Why it happens:** Not integrating with existing `selectTest()` flow
**How to avoid:** Make timeline bars clickable: `onClick={() => rootStore.selectTest(test.id)}`—this opens TestDetailsDrawer (already exists)
**Warning signs:** User confusion about how to see test details from timeline

## Code Examples

Verified patterns following project conventions:

### Complete Timeline Component Structure
```typescript
// src/components/Timeline/index.tsx
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import { Clock } from 'lucide-react'
import type { QaseTestResult } from '../../types/qase-report.types'

export const Timeline = observer(() => {
  const { testResultsStore, reportStore } = useRootStore()

  if (!reportStore.runData) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <Clock className="w-12 h-12 mb-4" />
        <p>No report loaded</p>
      </div>
    )
  }

  const tests = Array.from(testResultsStore.testResults.values())
    .filter(test => test.execution.start_time && test.execution.end_time)
    .sort((a, b) => a.execution.start_time - b.execution.start_time)

  if (tests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
        <Clock className="w-12 h-12 mb-4" />
        <p>No test timing data available</p>
      </div>
    )
  }

  // Calculate timeline bounds
  const minTime = Math.min(...tests.map(t => t.execution.start_time))
  const maxTime = Math.max(...tests.map(t => t.execution.end_time))
  const totalDuration = maxTime - minTime

  // Group by thread for swimlanes
  const groupedByThread = tests.reduce((acc, test) => {
    const thread = test.execution.thread || 'main'
    if (!acc[thread]) acc[thread] = []
    acc[thread].push(test)
    return acc
  }, {} as Record<string, QaseTestResult[]>)

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Test Execution Timeline</h2>
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span>Total duration: {formatDuration(totalDuration)}</span>
          <span>•</span>
          <span>{tests.length} tests</span>
          <span>•</span>
          <span>{Object.keys(groupedByThread).length} threads</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-2 mb-4">
        <Badge variant="outline" className="bg-green-500/10">Passed</Badge>
        <Badge variant="outline" className="bg-red-500/10">Failed</Badge>
        <Badge variant="outline" className="bg-yellow-500/10">Broken</Badge>
        <Badge variant="outline" className="bg-gray-500/10">Skipped</Badge>
      </div>

      {/* Time axis */}
      <TimelineAxis minTime={minTime} maxTime={maxTime} />

      {/* Swimlanes */}
      <div className="space-y-6 mt-4">
        {Object.entries(groupedByThread).map(([thread, threadTests]) => (
          <div key={thread} className="border-l-2 border-muted pl-4">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Thread: {thread}
            </div>
            <div className="relative h-12 bg-muted/20 rounded">
              {threadTests.map(test => (
                <TimelineBar
                  key={test.id}
                  test={test}
                  minTime={minTime}
                  totalDuration={totalDuration}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
})

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}
```

### Timeline Bar Component with Click Integration
```typescript
// src/components/Timeline/TimelineBar.tsx
import { observer } from 'mobx-react-lite'
import { useRootStore } from '../../store'
import type { QaseTestResult } from '../../types/qase-report.types'

interface TimelineBarProps {
  test: QaseTestResult
  minTime: number
  totalDuration: number
}

export const TimelineBar = observer(({ test, minTime, totalDuration }: TimelineBarProps) => {
  const { selectTest } = useRootStore()
  const { execution } = test

  const startOffset = ((execution.start_time - minTime) / totalDuration) * 100
  const width = (execution.duration / totalDuration) * 100

  const statusColors = {
    passed: 'bg-green-500 hover:bg-green-600',
    failed: 'bg-red-500 hover:bg-red-600',
    broken: 'bg-yellow-500 hover:bg-yellow-600',
    skipped: 'bg-gray-500 hover:bg-gray-600',
  }

  const colorClass = statusColors[execution.status] || statusColors.skipped

  return (
    <div
      className={`absolute h-10 rounded flex items-center px-2 text-xs text-white cursor-pointer transition-colors truncate ${colorClass}`}
      style={{
        left: `${startOffset}%`,
        width: `${Math.max(width, 0.5)}%`, // Minimum width for visibility
      }}
      onClick={() => selectTest(test.id)}
      title={`${test.title} (${formatDuration(execution.duration)})`}
    >
      <span className="truncate">{test.title}</span>
    </div>
  )
})

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ${seconds % 60}s`
}
```

### Time Axis Component
```typescript
// src/components/Timeline/TimelineAxis.tsx
interface TimelineAxisProps {
  minTime: number
  maxTime: number
}

export const TimelineAxis = ({ minTime, maxTime }: TimelineAxisProps) => {
  const duration = maxTime - minTime

  // Create 5 time markers across timeline
  const markers = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
    position: ratio * 100,
    time: new Date(minTime + duration * ratio),
  }))

  return (
    <div className="relative h-12 border-b border-border mb-4">
      {markers.map(({ position, time }, index) => (
        <div
          key={index}
          className="absolute flex flex-col items-center -translate-x-1/2"
          style={{ left: `${position}%` }}
        >
          <span className="text-xs text-muted-foreground mb-1">
            {time.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
          <div className="h-2 w-px bg-border" />
        </div>
      ))}
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| vis-timeline library | Custom components with Tailwind | 2024+ | Better React integration, no CSS conflicts, full control |
| MUI Timeline component | shadcn/ui patterns | 2025 (v1.5) | Project already migrated from MUI to shadcn/ui |
| Recharts Gantt workarounds | Direct CSS positioning | 2024+ | Simpler, more maintainable than chart library hacks |
| Complex Gantt libraries | Simple horizontal bars | 2024+ | Timeline for tests doesn't need task dependencies, resource allocation—just duration visualization |

**Deprecated/outdated:**
- **vis-timeline + React wrappers**: React 18 compatibility unclear, wrappers unmaintained (5+ years old)
- **MUI Timeline**: Project completed MUI → shadcn/ui migration in v1.5
- **react-gantt-timeline**: Many Gantt libraries are commercial or overly complex for test timeline needs

## Open Questions

1. **Should timeline show retries/reruns?**
   - What we know: Tests have execution data, retries are tracked somewhere
   - What's unclear: How to visualize retries—stacked bars? Different color? Same test multiple times?
   - Recommendation: Start with single execution per test (latest), add retry visualization in future phase if needed

2. **Virtualization threshold?**
   - What we know: @tanstack/react-virtual is available, project uses it for TestList
   - What's unclear: At what test count does timeline become slow? 500? 1000? 5000?
   - Recommendation: Build without virtualization first, measure performance, add virtualization if >500 tests cause lag

3. **Zoom/pan interactions?**
   - What we know: vis-timeline supports zoom/pan, but we're not using it
   - What's unclear: Do users need to zoom into timeline for better granularity?
   - Recommendation: Ship v1 without zoom (full timeline view), gather user feedback, add zoom in future iteration if requested

4. **Time zone handling?**
   - What we know: Test execution times are Unix timestamps (milliseconds)
   - What's unclear: Are timestamps in UTC? Local time? Should we display in user's timezone?
   - Recommendation: Use `Date.toLocaleTimeString()` which auto-handles user timezone, document behavior

## Sources

### Primary (HIGH confidence)
- Project codebase analysis:
  - `/Users/gda/Documents/github/qase-tms/qase-report/src/store/index.tsx` - RootStore structure
  - `/Users/gda/Documents/github/qase-tms/qase-report/src/schemas/QaseTestResult.schema.ts` - Test data structure with timing fields
  - `/Users/gda/Documents/github/qase-tms/qase-report/src/components/TabNavigation/index.tsx` - Tab navigation pattern
  - `/Users/gda/Documents/github/qase-tms/qase-report/package.json` - Current dependencies (Recharts 2.15.4, React 18, Tailwind v4)

### Secondary (MEDIUM confidence)
- [GitHub: shadcn-timeline](https://github.com/timDeHof/shadcn-timeline) - shadcn/ui timeline component patterns (vertical-focused, but demonstrates component structure)
- [All Shadcn: Timeline Blocks](https://allshadcn.com/blocks/category/timeline/) - Multiple timeline implementations with shadcn/ui
- [GitHub: recharts issue #813](https://github.com/recharts/recharts/issues/813) - Gantt chart support discussion, confirmed no native support
- [TanStack Virtual](https://tanstack.com/virtual/latest) - Virtualization library already in project
- [Material Tailwind Timeline](https://www.material-tailwind.com/docs/react/timeline) - React timeline component patterns with Tailwind
- [Flowbite Timeline](https://flowbite.com/docs/components/timeline/) - Timeline component examples with Tailwind CSS

### Tertiary (LOW confidence, needs verification)
- [Comparing React timeline libraries](https://blog.logrocket.com/comparing-best-react-timeline-libraries/) - LogRocket 2024 comparison (some libraries have compatibility issues)
- [vis-timeline React 18 support issue](https://github.com/visjs/vis-timeline/issues/1779) - GitHub discussion, unresolved compatibility concerns
- [react-visjs-timeline npm](https://www.npmjs.com/package/react-visjs-timeline) - React wrapper for vis-timeline (last publish may be outdated)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already in project, proven architecture
- Architecture: HIGH - Pattern follows established project conventions (observer, MobX, shadcn/ui, Tailwind)
- Pitfalls: HIGH - Based on actual issues found in research (React 18 compatibility, Recharts limitations)
- Implementation approach: HIGH - Custom component recommended over libraries aligns with v1.5 migration to shadcn/ui patterns

**Research date:** 2026-02-12
**Valid until:** ~30 days (stable domain, but check for new timeline libraries)
