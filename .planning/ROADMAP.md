# Roadmap: Qase Report

## Milestones

- **v1.0 MVP** - Phases 1-7 (shipped 2026-02-10)
- **v1.1 History & Trends** - Phases 8-12 (shipped 2026-02-10)
- **v1.2 Design Refresh** - Phases 13-17 (shipped 2026-02-10)
- **v1.3 Design Overhaul** - Phases 18-24 (shipped 2026-02-11)
- **v1.4 Layout Simplification** - Phases 25-29 (shipped 2026-02-11)
- **v1.5 Qase TMS Style** - Phases 30-36 (in progress)

## Phases

<details>
<summary>v1.0 MVP (Phases 1-7) - SHIPPED 2026-02-10</summary>

### Phase 1: Schema & Validation
**Goal**: Define and validate Qase Report Format data structures
**Plans**: 2 plans

Plans:
- [x] 01-01: Zod schemas for run.json and results/*.json
- [x] 01-02: Schema validation with error reporting

### Phase 2: Store Infrastructure
**Goal**: Build MobX stores for reactive state management
**Plans**: 2 plans

Plans:
- [x] 02-01: RootStore with ReportStore and TestResultsStore
- [x] 02-02: Computed values for filtering and search

### Phase 3: Dashboard & Statistics
**Goal**: Display test run statistics and metadata
**Plans**: 2 plans

Plans:
- [x] 03-01: Dashboard with stats cards
- [x] 03-02: Run info and host info panels

### Phase 4: Test List & Filtering
**Goal**: Display and filter test results
**Plans**: 2 plans

Plans:
- [x] 04-01: Test list with status filtering
- [x] 04-02: Search and suite grouping

### Phase 5: Test Details
**Goal**: Show individual test details and metadata
**Plans**: 1 plan

Plans:
- [x] 05-01: Test details view with fields and params

### Phase 6: Step Timeline & Attachments
**Goal**: Display test execution steps and attachments
**Plans**: 2 plans

Plans:
- [x] 06-01: Step timeline with nested hierarchy
- [x] 06-02: Attachments viewer with lightbox

### Phase 7: Static HTML Export
**Goal**: Generate standalone HTML that works with file:// protocol
**Plans**: 1 plan

Plans:
- [x] 07-01: Vite build configuration for static export

</details>

<details>
<summary>v1.1 History & Trends (Phases 8-12) - SHIPPED 2026-02-10</summary>

**Milestone Goal:** Add analytics features for test history tracking, trend visualization, flakiness detection, performance regression alerts, and stability scoring.

### Phase 8: History Infrastructure
**Goal**: Users can load and store historical test run data
**Plans**: 3 plans

Plans:
- [x] 08-01: History schema with versioning and signature-based test identity
- [x] 08-02: HistoryStore with tiered loading and localStorage persistence
- [x] 08-03: FileLoader integration and history file upload UI

### Phase 9: Trend Visualization
**Goal**: Users can see pass rate and duration trends over time
**Plans**: 3 plans

Plans:
- [x] 09-01: AnalyticsStore with computed trend data
- [x] 09-02: TrendsChart with pass rate and duration charts
- [x] 09-03: HistoryTimeline and Dashboard integration

### Phase 10: Flakiness Detection
**Goal**: Users can identify flaky tests with multi-factor analysis
**Plans**: 2 plans

Plans:
- [x] 10-01: Flakiness detection algorithm in AnalyticsStore
- [x] 10-02: StabilityBadge component and TestListItem integration

### Phase 11: Regression Alerts
**Goal**: Users receive alerts for performance regressions and test failures
**Plans**: 2 plans

Plans:
- [x] 11-01: Alert types and 2-sigma regression detection in AnalyticsStore
- [x] 11-02: AlertsPanel component and Dashboard integration

### Phase 12: Stability Scoring
**Goal**: Users can assess test health with A+ to F stability grades
**Plans**: 3 plans

Plans:
- [x] 12-01: Stability types and getStabilityScore algorithm
- [x] 12-02: Grade filtering in TestList and grade badges
- [x] 12-03: TestHealthWidget dashboard component

</details>

<details>
<summary>v1.2 Design Refresh (Phases 13-17) - SHIPPED 2026-02-10</summary>

**Milestone Goal:** Modern, user-friendly design with Bento Grid layout, themes, sidebar navigation, and improved performance for 100-500 tests.

### Phase 13: Theme Foundation
**Goal**: Users can switch between light/dark/system themes with persistence
**Plans**: 1 plan

Plans:
- [x] 13-01-PLAN.md — Theme system with colorSchemes API, ThemeToggle component, and FOWT prevention

### Phase 14: Sidebar Navigation
**Goal**: Users navigate via persistent left sidebar with collapsible state
**Plans**: 1 plan

Plans:
- [x] 14-01-PLAN.md — NavigationDrawer with permanent mini variant, MobX state, localStorage persistence

### Phase 15: Bento Grid Dashboard
**Goal**: Dashboard displays data in modern Bento Grid layout with micro-visualizations
**Plans**: 2 plans

Plans:
- [x] 15-01-PLAN.md — CSS Grid Bento layout (BentoGrid container, DashboardCard wrapper, Dashboard refactor)
- [x] 15-02-PLAN.md — Micro-visualizations (SparklineCard, ProgressRingCard, Dashboard integration)

### Phase 16: Microinteractions
**Goal**: UI provides smooth visual feedback through animations and transitions
**Plans**: 2 plans

Plans:
- [x] 16-01-PLAN.md — Accessibility foundation (usePrefersReducedMotion hook) and Dashboard fade-in
- [x] 16-02-PLAN.md — Hover effects on cards/list items, Collapse accessibility updates

### Phase 17: Progressive Disclosure & Performance
**Goal**: UI handles complexity gracefully at scale (100-500 tests)
**Plans**: 2 plans

Plans:
- [x] 17-01-PLAN.md — Default-collapsed suites, expand state persistence, ARIA accessibility
- [x] 17-02-PLAN.md — Virtual scrolling with react-window, scroll position preservation

</details>

<details>
<summary>v1.3 Design Overhaul (Phases 18-24) - SHIPPED 2026-02-11</summary>

**Milestone Goal:** Full redesign inspired by Playwright Smart Reporter with dark theme by default, new sidebar layout with filters, overview dashboard, and three new features (Failure Clusters, Gallery, Comparison).

### Phase 18: Dark Theme Foundation
**Goal**: Dark theme becomes default with Playwright-style color palette
**Depends on**: Phase 17 (v1.2 complete)
**Requirements**: THEME-04, THEME-05
**Success Criteria** (what must be TRUE):
  1. Application loads with dark theme by default (no user action needed)
  2. Light theme still accessible via toggle
  3. Color palette matches Playwright Smart Reporter aesthetic (dark grays, accent colors)
  4. All existing components render correctly in new color scheme
**Plans**: 1 plan

Plans:
- [x] 18-01-PLAN.md — Dark theme default, Playwright-style color palette

### Phase 19: Top Bar Redesign
**Goal**: Top bar provides search, export, theme toggle, and run info
**Depends on**: Phase 18
**Requirements**: TOP-01, TOP-02, TOP-03, TOP-04
**Success Criteria** (what must be TRUE):
  1. User can open search with Cmd+K (Mac) or Ctrl+K (Windows/Linux)
  2. Search shows results as user types (test names)
  3. Export button downloads current report
  4. Theme toggle visible in top bar
  5. Run date/time displayed prominently
**Plans**: 1 plan

Plans:
- [x] 19-01-PLAN.md — Command palette search (Cmd+K), export button, theme toggle, run date display

### Phase 20: Sidebar Overhaul
**Goal**: Sidebar shows stats visualization and filter chips
**Depends on**: Phase 19
**Requirements**: SIDE-01, SIDE-02, SIDE-03, SIDE-04
**Success Criteria** (what must be TRUE):
  1. Sidebar displays pass rate as circular progress ring
  2. Quick stats (passed/failed/flaky counts) visible below ring
  3. Navigation items have descriptive icons
  4. Status and stability filters rendered as clickable chips
  5. Filters persist when navigating between views
**Plans**: 1 plan

Plans:
- [x] 20-01-PLAN.md — Pass rate ring, quick stats, navigation icons, filter chips

### Phase 21: Overview Dashboard
**Goal**: Dashboard provides comprehensive test health overview
**Depends on**: Phase 20
**Requirements**: OVER-01, OVER-02, OVER-03, OVER-04, OVER-05
**Success Criteria** (what must be TRUE):
  1. Suite Health section shows pass rates by suite (bar or list)
  2. Pass Rate card shows current value with sparkline trend
  3. Duration card shows current value with sparkline trend
  4. Attention Required section lists failed and flaky tests
  5. Quick Insights shows top failures and slowest tests
**Plans**: 1 plan

Plans:
- [x] 21-01-PLAN.md — Suite Health, Pass Rate/Duration trends, Attention Required, Quick Insights

### Phase 22: Failure Clusters
**Goal**: Users can view tests grouped by similar error messages
**Depends on**: Phase 21
**Requirements**: CLUST-01, CLUST-02, CLUST-03, CLUST-04
**Success Criteria** (what must be TRUE):
  1. Failed tests grouped by error message similarity (fuzzy matching)
  2. Each cluster shows count of affected tests and common error pattern
  3. Cluster expandable to see all tests in that group
  4. Clicking test navigates to test details view
**Plans**: 2 plans

Plans:
- [x] 22-01-PLAN.md — Error clustering algorithm in AnalyticsStore
- [x] 22-02-PLAN.md — FailureClusters view component and navigation

### Phase 23: Gallery View
**Goal**: Users can browse all attachments across all tests
**Depends on**: Phase 22
**Requirements**: GAL-01, GAL-02, GAL-03, GAL-04
**Success Criteria** (what must be TRUE):
  1. Gallery view shows all attachments from all tests
  2. Attachments filterable by type (screenshots, logs, other)
  3. Each attachment shows which test it belongs to
  4. Clicking attachment opens test details with attachment focused
**Plans**: 2 plans

Plans:
- [x] 23-01-PLAN.md — GalleryAttachment type and galleryAttachments computed in AnalyticsStore
- [x] 23-02-PLAN.md — Gallery view component with filters and navigation

### Phase 24: Comparison View
**Goal**: Users can compare two test runs to see changes
**Depends on**: Phase 23
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. User can select two runs from history for comparison
  2. View shows tests that changed status (pass->fail, fail->pass, etc.)
  3. View shows tests added or removed between runs
  4. Duration changes highlighted (significantly faster/slower)
**Plans**: 2 plans

Plans:
- [x] 24-01-PLAN.md — Comparison computed values in HistoryStore/AnalyticsStore
- [x] 24-02-PLAN.md — Comparison view component with diff display

</details>

<details>
<summary>v1.4 Layout Simplification (Phases 25-29) - SHIPPED 2026-02-11</summary>

**Milestone Goal:** Simplify layout by replacing permanent sidebar with hamburger menu navigation, adding persistent status bar in top bar, converting test details to modal dialog, and removing duplicate statistics.

### Phase 25: Hamburger Navigation Menu
**Goal**: User can navigate to all views via dropdown menu in top bar
**Depends on**: Phase 24 (v1.3 complete)
**Requirements**: NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. User sees hamburger menu icon in top bar that opens navigation dropdown
  2. User sees text labels for all navigation items (Overview, Tests, Clusters, Gallery, Comparison)
  3. User clicks navigation item and dropdown closes automatically
  4. User navigates to selected view successfully
**Plans**: 1 plan

Plans:
- [x] 25-01-PLAN.md — Hamburger menu with MUI Menu dropdown in AppBar

### Phase 26: Persistent Status Bar
**Goal**: User sees run status and statistics in top bar at all times
**Depends on**: Phase 25
**Requirements**: STAT-01, STAT-02, STAT-03
**Success Criteria** (what must be TRUE):
  1. User sees compact pass rate donut visualization in top bar
  2. User sees run metadata (name, date, duration) in top bar
  3. User sees quick statistics (passed/failed/skipped counts) in top bar
  4. User can see status information in all views without scrolling
**Plans**: 1 plan

Plans:
- [x] 26-01-PLAN.md — StatusBarPill component with pass rate ring, quick stats, run metadata

### Phase 27: Modal Test Details
**Goal**: User can inspect test details in modal dialog without layout shift
**Depends on**: Phase 26
**Requirements**: DET-01, DET-02, DET-03, LAY-03
**Success Criteria** (what must be TRUE):
  1. User clicks test in list and details open in centered modal dialog
  2. User presses Escape key or clicks outside modal to close it
  3. User can scroll long test content within modal without issues
  4. User does not see layout shift or AppBar movement when modal opens
  5. User can scroll test list with modal open (virtual scrolling still works)
**Plans**: 1 plan

Plans:
- [x] 27-01-PLAN.md — TestDetailsModal with Dialog, scrollbar-gutter CSS, MainLayout integration

### Phase 28: Layout Simplification
**Goal**: Sidebar removed, filters integrated into test list view
**Depends on**: Phase 27
**Requirements**: LAY-01, LAY-02
**Success Criteria** (what must be TRUE):
  1. User no longer sees permanent sidebar component
  2. User can filter tests by status and stability from test list view
  3. User sees more horizontal space for test content
  4. User filter selections persist when navigating between views
**Plans**: 1 plan

Plans:
- [x] 28-01-PLAN.md — Remove NavigationDrawer and sidebar components, clean up RootStore state

### Phase 29: Statistics Cleanup
**Goal**: Duplicate statistics and charts removed from codebase
**Depends on**: Phase 28
**Requirements**: CLN-01, CLN-02
**Success Criteria** (what must be TRUE):
  1. User sees pass rate visualization only once (in status bar, not duplicated)
  2. User sees statistics consolidated in status bar only
  3. Codebase has no unused duplicate chart components
**Plans**: 1 plan

Plans:
- [x] 29-01-PLAN.md — Remove StatsCard and ProgressRingCard from Dashboard, delete orphaned files

</details>

### v1.5 Qase TMS Style (In Progress)

**Milestone Goal:** Migrate to shadcn/ui with Qase TMS visual style — tabs navigation, right sidebar, drawer test details, table-style test list.

#### Phase 30: Foundation Setup

**Goal**: Tailwind CSS v4 and shadcn/ui installed, dark theme configured, MUI completely removed
**Depends on**: Phase 29 (v1.4 complete)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. Tailwind CSS v4 compiles via Vite plugin without errors
  2. shadcn/ui CLI can add components to src/components/ui/
  3. Dark theme works via Tailwind CSS variables (no FOUC on load)
  4. MUI and Emotion removed from package.json and no imports in code
  5. lucide-react icons replaced @mui/icons-material in all components
**Plans**: 5 plans (3 waves)

Plans:
- [x] 30-01-PLAN.md — Install Tailwind CSS v4 and configure Vite plugin (Wave 1)
- [x] 30-02-PLAN.md — Initialize shadcn/ui and configure path aliases (Wave 2)
- [x] 30-03-PLAN.md — Configure dark theme with CSS variables (Wave 2)
- [x] 30-04-PLAN.md — Remove MUI and Emotion dependencies (Wave 3)
- [x] 30-05-PLAN.md — Migrate icons to lucide-react (Wave 3)

#### Phase 31: Core UI Components

**Goal**: Base shadcn/ui components installed and ready for use
**Depends on**: Phase 30
**Requirements**: DATA-03, DATA-07
**Success Criteria** (what must be TRUE):
  1. Button, Card, Badge components installed and work with dark theme
  2. Skeleton component displays loading states with correct styles
  3. Badge component supports all statuses (passed, failed, skipped, broken)
  4. All components work with MobX observer() without errors
  5. TypeScript types for all components defined explicitly
**Plans**: 2 plans (2 waves)

Plans:
- [x] 31-01-PLAN.md — Install Card, Badge, Skeleton components via CLI (Wave 1)
- [x] 31-02-PLAN.md — Extend Badge with status variants and create StatusBadge component (Wave 2)

#### Phase 32: Layout Restructure

**Goal**: Tab navigation, right sidebar, top bar work with new layout
**Depends on**: Phase 31
**Requirements**: LAYOUT-01, LAYOUT-02, LAYOUT-05
**Success Criteria** (what must be TRUE):
  1. Tab navigation displays 5 tabs (Test cases, Overview, Failure Clusters, Gallery, Comparison)
  2. Right sidebar always visible with fixed width
  3. Completion rate ring displays in sidebar with correct pass rate percentage
  4. Run metadata (title, date, environment) displays in sidebar
  5. Top bar contains run title and action buttons (export, theme toggle)
**Plans**: 3 plans (2 waves)

Plans:
- [x] 32-01-PLAN.md — Install Tabs component and create TabNavigation with 5 tabs (Wave 1)
- [x] 32-02-PLAN.md — Create RunInfoSidebar with pass rate ring and metadata (Wave 1)
- [x] 32-03-PLAN.md — Integrate CSS Grid layout with tabs and sidebar (Wave 2)

#### Phase 33: Test Details Drawer

**Goal**: Test details open in Sheet drawer on the right with nested tabs
**Depends on**: Phase 32
**Requirements**: LAYOUT-03, LAYOUT-04
**Success Criteria** (what must be TRUE):
  1. Clicking test opens Sheet drawer on right (not modal)
  2. Drawer contains 4 nested tabs (Execution, Info, Run History, Retries)
  3. Execution tab shows step timeline and error details
  4. Info tab shows test metadata and custom fields
  5. Drawer closes via Escape or click on overlay
**Plans**: 3 plans (3 waves)

Plans:
- [ ] 33-01-PLAN.md — Install Sheet component and create TestDetailsDrawer shell with tabs (Wave 1)
- [ ] 33-02-PLAN.md — Implement drawer content tabs (ExecutionTab, InfoTab, RunHistoryTab, RetriesTab) (Wave 2)
- [ ] 33-03-PLAN.md — Integrate drawer into MainLayout and remove TestDetailsModal (Wave 3)

#### Phase 34: TanStack Table Migration

**Goal**: Test list works as Data Table with sorting and columns
**Depends on**: Phase 33
**Requirements**: DATA-01, DATA-02, INT-01, INT-02, MIG-02
**Success Criteria** (what must be TRUE):
  1. Test list displays in table with columns (ID, Status, Title, Duration)
  2. All columns support sorting (ascending/descending)
  3. Command palette (Cmd+K) works for test search with fuzzy matching
  4. Row actions dropdown shows actions (view details, view history)
  5. Virtual scrolling works with 500+ tests without performance issues
**Plans**: TBD

Plans:
- [ ] 34-01: Set up TanStack Table with columns
- [ ] 34-02: Implement column sorting
- [ ] 34-03: Add command palette search
- [ ] 34-04: Integrate virtual scrolling with table
- [ ] 34-05: Add row actions dropdown

#### Phase 35: Suite Hierarchy & Progress

**Goal**: Suite hierarchy with expandable rows and progress bars works
**Depends on**: Phase 34
**Requirements**: DATA-04, DATA-05, INT-03
**Success Criteria** (what must be TRUE):
  1. Suite hierarchy displays as expandable rows in table
  2. Collapse/expand state persists during filtering
  3. Progress bar for each suite shows pass/fail segments (multi-color)
  4. Progress bar colors: green (passed), red (failed), yellow (skipped), gray (broken)
  5. Suite duration displays in progress bar tooltip
**Plans**: TBD

Plans:
- [ ] 35-01: Implement suite expandable rows
- [ ] 35-02: Create multi-segment progress bars
- [ ] 35-03: Persist collapse/expand state

#### Phase 36: Views Migration & Polish

**Goal**: All views migrated to shadcn/ui, Recharts integrated, static HTML works
**Depends on**: Phase 35
**Requirements**: DATA-06, MIG-01, MIG-03, MIG-04
**Success Criteria** (what must be TRUE):
  1. Overview, Failure Clusters, Gallery, Comparison views use shadcn/ui components
  2. Recharts charts (trends, sparklines) use Tailwind dark theme colors
  3. Static HTML export works with file:// protocol (CSS inline, assets embedded)
  4. All view transitions smooth with consistent animation duration (300ms)
  5. Loading skeletons show when loading data in all views
**Plans**: TBD

Plans:
- [ ] 36-01: Migrate remaining views to shadcn/ui
- [ ] 36-02: Integrate Recharts with Tailwind theme
- [ ] 36-03: Verify static HTML export
- [ ] 36-04: Polish animations and loading states

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1-7. MVP | v1.0 | 10/10 | Complete | 2026-02-10 |
| 8-12. History | v1.1 | 13/13 | Complete | 2026-02-10 |
| 13-17. Design | v1.2 | 9/9 | Complete | 2026-02-10 |
| 18-24. Overhaul | v1.3 | 14/14 | Complete | 2026-02-11 |
| 25. Hamburger Menu | v1.4 | 1/1 | Complete | 2026-02-11 |
| 26. Status Bar | v1.4 | 1/1 | Complete | 2026-02-11 |
| 27. Modal Details | v1.4 | 1/1 | Complete | 2026-02-11 |
| 28. Layout Cleanup | v1.4 | 1/1 | Complete | 2026-02-11 |
| 29. Stats Cleanup | v1.4 | 1/1 | Complete | 2026-02-11 |
| 30. Foundation Setup | v1.5 | 5/5 | Complete | 2026-02-11 |
| 31. Core UI Components | v1.5 | 2/2 | Complete | 2026-02-11 |
| 32. Layout Restructure | v1.5 | 3/3 | Complete | 2026-02-11 |
| 33. Test Details Drawer | v1.5 | 0/3 | Not started | - |
| 34. TanStack Table | v1.5 | 0/5 | Not started | - |
| 35. Suite Hierarchy | v1.5 | 0/3 | Not started | - |
| 36. Views & Polish | v1.5 | 0/4 | Not started | - |

**Total v1.5:** 10/25 plans complete (40%)
