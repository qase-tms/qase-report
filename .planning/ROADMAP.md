# Roadmap: Qase Report

## Milestones

- v1.0 MVP - Phases 1-7 (shipped 2026-02-10)
- v1.1 History & Trends - Phases 8-12 (in progress)

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

### v1.1 History & Trends (In Progress)

**Milestone Goal:** Add analytics features for test history tracking, trend visualization, flakiness detection, performance regression alerts, and stability scoring.

#### Phase 8: History Infrastructure
**Goal**: Users can load and store historical test run data
**Depends on**: Phase 7 (v1.0 complete)
**Requirements**: HIST-01, HIST-02, HIST-03, HIST-04
**Success Criteria** (what must be TRUE):
  1. User can load test-history.json file alongside run.json
  2. System validates history data with schema version field
  3. System tracks tests across runs using stable signatures
  4. History data persists in localStorage without crashing browser
  5. System handles large history files (100+ runs) without memory issues
**Plans**: 3 plans

Plans:
- [x] 08-01-PLAN.md — History schema with versioning and signature-based test identity
- [x] 08-02-PLAN.md — HistoryStore with tiered loading and localStorage persistence
- [x] 08-03-PLAN.md — FileLoader integration and history file upload UI

#### Phase 9: Trend Visualization
**Goal**: Users can see pass rate and duration trends over time
**Depends on**: Phase 8
**Requirements**: TRND-01, TRND-02, TRND-03, TRND-04
**Success Criteria** (what must be TRUE):
  1. User can see pass rate trend chart with passed/failed/skipped over time
  2. User can see duration trend chart showing test execution time changes
  3. User can see history timeline of recent runs with status indicators
  4. Charts display tooltips with detailed information on hover
  5. Charts gracefully handle missing data points and outliers
**Plans**: 3 plans

Plans:
- [x] 09-01-PLAN.md — AnalyticsStore with computed trend data
- [x] 09-02-PLAN.md — TrendsChart with pass rate and duration charts
- [x] 09-03-PLAN.md — HistoryTimeline and Dashboard integration

#### Phase 10: Flakiness Detection
**Goal**: Users can identify flaky tests with multi-factor analysis
**Depends on**: Phase 9
**Requirements**: FLKY-01, FLKY-02, FLKY-03, FLKY-04
**Success Criteria** (what must be TRUE):
  1. System detects flaky tests using status changes and error consistency
  2. User sees stability badges on test list items (flaky, stable, new failure)
  3. User sees flakiness percentage showing "flaky in X of Y runs"
  4. Flakiness detection requires minimum 5-run window to avoid false positives
  5. Detection algorithm considers error message patterns, not just status changes
**Plans**: 2 plans

Plans:
- [x] 10-01-PLAN.md — Flakiness detection algorithm in AnalyticsStore
- [x] 10-02-PLAN.md — StabilityBadge component and TestListItem integration

#### Phase 11: Regression Alerts
**Goal**: Users receive alerts for performance regressions and test failures
**Depends on**: Phase 10
**Requirements**: REGR-01, REGR-02, REGR-03
**Success Criteria** (what must be TRUE):
  1. System detects performance regressions using 2-sigma outlier detection
  2. User sees alerts panel on dashboard with flakiness and regression warnings
  3. User can click alert to navigate directly to affected test
  4. Alerts distinguish between flakiness warnings and regression errors
**Plans**: 2 plans

Plans:
- [ ] 11-01-PLAN.md — Alert types and 2-sigma regression detection in AnalyticsStore
- [ ] 11-02-PLAN.md — AlertsPanel component and Dashboard integration

#### Phase 12: Stability Scoring
**Goal**: Users can assess test health with A+ to F stability grades
**Depends on**: Phase 10
**Requirements**: STAB-01, STAB-02, STAB-03
**Success Criteria** (what must be TRUE):
  1. System calculates stability grade (A+ to F) based on pass rate, flakiness, duration variance
  2. User can group and filter tests by stability grade
  3. User sees test health widget on dashboard with grade distribution
  4. Grades require minimum 10 runs to ensure accuracy
  5. Scoring formula is transparent and shows underlying metrics
**Plans**: TBD

Plans:
- [ ] 12-01: TBD
- [ ] 12-02: TBD
- [ ] 12-03: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 8 -> 9 -> 10 -> 11 -> 12

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
| 11. Regression Alerts | v1.1 | 0/2 | Planned | - |
| 12. Stability Scoring | v1.1 | 0/TBD | Not started | - |
