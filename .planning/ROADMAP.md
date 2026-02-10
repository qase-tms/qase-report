# Roadmap: Qase Report

## Milestones

- v1.0 MVP - Phases 1-7 (shipped 2026-02-10)
- v1.1 History & Trends - Phases 8-12 (shipped 2026-02-10)
- v1.2 Design Refresh - Phases 13-17 (shipped 2026-02-10)
- v1.3 Design Overhaul - Phases 18-24 (in progress)

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

### v1.3 Design Overhaul (In Progress)

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
- [ ] 18-01-PLAN.md — Dark theme default, Playwright-style color palette

### Phase 19: Top Bar Redesign
**Goal**: Top bar provides search, export, theme toggle, and run info
**Depends on**: Phase 18
**Requirements**: TOP-01, TOP-02, TOP-03, TOP-04
**Success Criteria** (what must be TRUE):
  1. User can open search with ⌘K (Mac) or Ctrl+K (Windows/Linux)
  2. Search shows results as user types (test names)
  3. Export button downloads current report
  4. Theme toggle visible in top bar
  5. Run date/time displayed prominently
**Plans**: 1 plan

Plans:
- [ ] 19-01-PLAN.md — Command palette search (⌘K), export button, theme toggle, run date display

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
- [ ] 20-01-PLAN.md — Pass rate ring, quick stats, navigation icons, filter chips

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
- [ ] 21-01-PLAN.md — Suite Health, Pass Rate/Duration trends, Attention Required, Quick Insights

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
- [ ] 22-01-PLAN.md — Error clustering algorithm in AnalyticsStore
- [ ] 22-02-PLAN.md — FailureClusters view component and navigation

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
- [ ] 23-01-PLAN.md — AttachmentsStore computed values for cross-test gallery
- [ ] 23-02-PLAN.md — Gallery view component with filters and navigation

### Phase 24: Comparison View
**Goal**: Users can compare two test runs to see changes
**Depends on**: Phase 23
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. User can select two runs from history for comparison
  2. View shows tests that changed status (pass→fail, fail→pass, etc.)
  3. View shows tests added or removed between runs
  4. Duration changes highlighted (significantly faster/slower)
**Plans**: 2 plans

Plans:
- [ ] 24-01-PLAN.md — Comparison computed values in HistoryStore/AnalyticsStore
- [ ] 24-02-PLAN.md — Comparison view component with diff display

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Schema & Validation | v1.0 | 2/2 | Complete | 2026-02-10 |
| 2. Store Infrastructure | v1.0 | 2/2 | Complete | 2026-02-10 |
| 3. Dashboard & Statistics | v1.0 | 2/2 | Complete | 2026-02-10 |
| 4. Test List & Filtering | v1.0 | 2/2 | Complete | 2026-02-10 |
| 5. Test Details | v1.0 | 1/1 | Complete | 2026-02-10 |
| 6. Step Timeline & Attachments | v1.0 | 2/2 | Complete | 2026-02-10 |
| 7. Static HTML Export | v1.0 | 1/1 | Complete | 2026-02-10 |
| 8. History Infrastructure | v1.1 | 3/3 | Complete | 2026-02-10 |
| 9. Trend Visualization | v1.1 | 3/3 | Complete | 2026-02-10 |
| 10. Flakiness Detection | v1.1 | 2/2 | Complete | 2026-02-10 |
| 11. Regression Alerts | v1.1 | 2/2 | Complete | 2026-02-10 |
| 12. Stability Scoring | v1.1 | 3/3 | Complete | 2026-02-10 |
| 13. Theme Foundation | v1.2 | 1/1 | Complete | 2026-02-10 |
| 14. Sidebar Navigation | v1.2 | 1/1 | Complete | 2026-02-10 |
| 15. Bento Grid Dashboard | v1.2 | 2/2 | Complete | 2026-02-10 |
| 16. Microinteractions | v1.2 | 2/2 | Complete | 2026-02-10 |
| 17. Progressive Disclosure & Performance | v1.2 | 2/2 | Complete | 2026-02-10 |
| 18. Dark Theme Foundation | v1.3 | 0/1 | Pending | - |
| 19. Top Bar Redesign | v1.3 | 0/1 | Pending | - |
| 20. Sidebar Overhaul | v1.3 | 0/1 | Pending | - |
| 21. Overview Dashboard | v1.3 | 0/1 | Pending | - |
| 22. Failure Clusters | v1.3 | 0/2 | Pending | - |
| 23. Gallery View | v1.3 | 0/2 | Pending | - |
| 24. Comparison View | v1.3 | 0/2 | Pending | - |
